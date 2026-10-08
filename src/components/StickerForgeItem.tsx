import { useEffect, useMemo, useRef } from 'react';
import type { PlacedStickerState, StickerDefinition } from '../types';

type ForgeControl = {
  setSource(v: unknown): Promise<void>;
  setOptions(v: unknown): void;
  setRenderScale(v: number): void;
  reappear(): void;
  destroy(): void;
};

let forgeModule: Promise<{ createSticker: (el: HTMLElement, options: unknown) => Promise<ForgeControl> }> | null = null;
const loadForge = () => forgeModule ??= import('../vendor/sticker-forge.es.js');
export const preloadStickerForge = () => void loadForge();

function esc(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!));
}

export function stickerSource(sticker: StickerDefinition): string {
  if (sticker.asset.kind === 'image') return new URL(sticker.asset.src, document.baseURI).href;
  const { text, background, color, fontSize } = sticker.asset;
  const lines: string[] = [];
  const maxChars = Math.max(18, Math.floor((sticker.width - 42) / (fontSize * .55)));
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      if ((line + ' ' + word).trim().length > maxChars) { lines.push(line); line = word; }
      else line = `${line} ${word}`.trim();
    }
    if (line) lines.push(line);
  }
  const lineHeight = fontSize * 1.22;
  const startY = Math.max(34, (sticker.height - lines.length * lineHeight) / 2 + fontSize);
  const tspans = lines.map((line, i) => `<tspan x="${sticker.width / 2}" y="${startY + i * lineHeight}">${esc(line)}</tspan>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sticker.width}" height="${sticker.height}" viewBox="0 0 ${sticker.width} ${sticker.height}"><rect x="8" y="8" width="${sticker.width - 16}" height="${sticker.height - 16}" rx="19" fill="${background}" stroke="rgba(255,255,255,.55)" stroke-width="11"/><text text-anchor="middle" font-family="Pangolin,Comic Sans MS,cursive" font-size="${fontSize}" fill="${color}">${tspans}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface Props {
  definition: StickerDefinition;
  state: PlacedStickerState;
  onFront: () => void;
  onDetach: () => void;
}

export function StickerForgeItem({ definition, state, onFront, onDetach }: Props) {
  const target = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const detachRef = useRef(onDetach);
  const frontRef = useRef(onFront);
  const source = useMemo(() => stickerSource(definition), [definition]);
  const isInfoSticker = definition.asset.kind === 'image' && definition.asset.src.includes('/info-');

  useEffect(() => { detachRef.current = onDetach; }, [onDetach]);
  useEffect(() => { frontRef.current = onFront; }, [onFront]);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let control: ForgeControl | undefined;
    let disposed = false;
    let settleTimer: number | undefined;
    loadForge().then(async mod => {
      if (disposed) return;
      const created = await mod.createSticker(el, {
        source: { type: 'image', src: source, name: definition.label, padding: 0 },
        outline: { width: 0, color: '#ffffff' },
        edge: { width: .5, strength: 0 },
        shadow: { opacity: 0, blur: 0, distance: 0, angle: 42 },
        peel: { radius: .18, stiffness: .48, maxAngle: 3.2, release: 'snap', detachThreshold: .7, grabWidth: Math.max(definition.width, definition.height), residue: false, surfaceShadow: false },
        sound: { enabled: true, volume: .82 },
        back: { color: '#f7f5f2', gloss: .7, roughness: .3 },
        material: { type: 'original', intensity: .8, scale: 1 },
        tilt: 0,
        wind: 0,
        quality: 'medium',
        display: { width: definition.width, height: definition.height },
      });
      if (disposed) { created.destroy(); return; }
      control = created;
      created.setRenderScale(1);
      wrapper.current?.classList.add('forge-ready');
    });
    const detached = () => detachRef.current();
    const peelStart = () => {
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      frontRef.current();
      wrapper.current?.classList.add('is-peeling');
    };
    const peelEnd = (event: Event) => {
      const detail = (event as CustomEvent<{ progress: number; willReset: boolean }>).detail;
      if (!detail.willReset && detail.progress >= .69) {
        wrapper.current?.classList.remove('is-peeling');
        wrapper.current?.classList.add('is-detaching');
      } else {
        settleTimer = window.setTimeout(() => wrapper.current?.classList.remove('is-peeling'), 520);
      }
    };
    el.addEventListener('detachcomplete', detached);
    el.addEventListener('peelstart', peelStart);
    el.addEventListener('peelend', peelEnd);
    return () => {
      disposed = true;
      el.removeEventListener('detachcomplete', detached);
      el.removeEventListener('peelstart', peelStart);
      el.removeEventListener('peelend', peelEnd);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      control?.destroy();
    };
  }, [definition, source]);

  return <div ref={wrapper}
    className={`placed-sticker sticker-land${isInfoSticker ? ' info-sticker' : ''}`}
    style={{ left: state.x, top: state.y, width: definition.width, height: definition.height, transform: `rotate(${state.rotation}deg)`, zIndex: state.zIndex }}
    aria-label={`${definition.label}: потяните за любую область, чтобы отклеить`}
  >
    <img className="sticker-preview" src={source} alt="" draggable={false} />
    <div ref={target} className="forge-target" />
  </div>;
}
