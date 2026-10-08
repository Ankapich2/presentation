import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlideContent } from './components/SlideContent';
import { preloadStickerForge, StickerForgeItem } from './components/StickerForgeItem';
import { StickerPanel } from './components/StickerPanel';
import { PageTurn } from './components/PageTurn';
import { slideOrder, slides } from './data/slides';
import type { PlacedStickerState, SlideId, StickerDefinition } from './types';
import './styles.css';

const slideAssetUrls: Partial<Record<SlideId, string[]>> = {
  chapters: [`${import.meta.env.BASE_URL}assets/figma/chapters/imgPresentationTitleHologram.png`, `${import.meta.env.BASE_URL}assets/figma/chapters/img2021-2026DieCut.png`],
  'history-1': [`${import.meta.env.BASE_URL}assets/figma/history-1/imgPresentationTitleDieCut.png`, `${import.meta.env.BASE_URL}assets/figma/history-1/img20212023Hologram.png`, `${import.meta.env.BASE_URL}assets/figma/history-1/imgImage26DieCut.png`],
  'history-2': [`${import.meta.env.BASE_URL}assets/figma/history-2/imgPresentationTitleDieCut.png`, `${import.meta.env.BASE_URL}assets/figma/history-2/img20232024Hologram.png`, `${import.meta.env.BASE_URL}assets/figma/history-2/imgImage23DieCut.png`],
  'history-3': [`${import.meta.env.BASE_URL}assets/figma/history-3/imgPresentationTitleDieCut.png`, `${import.meta.env.BASE_URL}assets/figma/history-3/img20242026Hologram.png`, `${import.meta.env.BASE_URL}assets/figma/history-3/imgImage24DieCut.png`],
  projects: [`${import.meta.env.BASE_URL}assets/figma/projects/imgPresentationTitleDieCut.png`, `${import.meta.env.BASE_URL}assets/figma/projects/imgImage23.png`, `${import.meta.env.BASE_URL}assets/figma/projects/imgFrame1000006897.png`],
  'case-1': [`${import.meta.env.BASE_URL}assets/figma/case-1/new-title.png`, ...slides['case-1'].stickers.flatMap(sticker => sticker.asset.kind === 'image' ? [sticker.asset.src] : [])],
  'case-2': [`${import.meta.env.BASE_URL}assets/figma/case-2/imgPresentationTitleDieCut.png`, `${import.meta.env.BASE_URL}assets/figma/case-2/imgFrame1000006916DieCut.png`],
  'case-3': [`${import.meta.env.BASE_URL}assets/figma/case-3/prototype-title.png`, `${import.meta.env.BASE_URL}assets/figma/case-3/prototype-phone.png`, `${import.meta.env.BASE_URL}assets/figma/case-3/prototype-phone-overlay.png`],
};

export default function App() {
  const [viewport, setViewport] = useState({ scale: 1, left: 0, top: 0 });
  const [current, setCurrent] = useState<SlideId>('cover');
  const [placed, setPlaced] = useState<Record<SlideId, PlacedStickerState[]>>(() => {
    const state = slideOrder.reduce((result, id) => ({ ...result, [id]: [] }), {} as Record<SlideId, PlacedStickerState[]>);
    state.cover = [
      { slideId: 'cover', stickerId: 'history', x: 14, y: 78, rotation: -16, zIndex: 11 },
      { slideId: 'cover', stickerId: 'experience', x: 321, y: 407, rotation: 1, zIndex: 12 },
      { slideId: 'cover', stickerId: 'challenge', x: 1132, y: 503, rotation: -10, zIndex: 13 },
      { slideId: 'cover', stickerId: 'projects', x: 1379, y: 882, rotation: 14, zIndex: 14 },
    ];
    // Keep the composition centered in the slide beside the sticker panel.
    // Decorative corner stickers retain their original margins.
    state['case-1'] = [
      { slideId: 'case-1', stickerId: 'deco-glasses-hologram', x: 104.939, y: 189.772, rotation: -15.15, zIndex: 13 },
      { slideId: 'case-1', stickerId: 'deco-dog', x: 699, y: 666, rotation: 0, zIndex: 14 },
      { slideId: 'case-1', stickerId: 'deco-thumb', x: 1338.171, y: 140.171, rotation: 7.42, zIndex: 15 },
    ];
    return state;
  });
  const dragSticker = useRef<StickerDefinition | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const [pageTurn, setPageTurn] = useState<{ from: SlideId; direction: 'forward' | 'backward' } | null>(null);
  const turning = useRef(false);
  const index = slideOrder.indexOf(current);
  const currentPlaced = placed[current];
  const definitions = slides[current].stickers;
  const placedIds = useMemo(() => new Set(currentPlaced.map(s => s.stickerId)), [currentPlaced]);

  const finishPageTurn = useCallback(() => {
    turning.current = false;
    setPageTurn(null);
  }, []);

  const go = useCallback((id: SlideId) => {
    if (id === current) return;
    const bookTransition = id.startsWith('history-');
    if (bookTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      turning.current = true;
      setPageTurn({ from: current, direction: slideOrder.indexOf(id) > slideOrder.indexOf(current) ? 'forward' : 'backward' });
    }
    else {
      turning.current = false;
      setPageTurn(null);
    }
    setCurrent(id);
  }, [current]);
  const step = useCallback((delta: number) => {
    go(slideOrder[Math.max(0, Math.min(slideOrder.length - 1, index + delta))]);
  }, [go, index]);

  useEffect(() => {
    if (!pageTurn) return;
    const timer = window.setTimeout(finishPageTurn, 920);
    return () => window.clearTimeout(timer);
  }, [pageTurn, finishPageTurn]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [role="slider"]')) return;
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [step]);

  useEffect(() => {
    const fit = () => {
      const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      const dpr = window.devicePixelRatio || 1;
      const snap = (value: number) => Math.round(value * dpr) / dpr;
      setViewport({ scale, left: snap((window.innerWidth - 1920 * scale) / 2) / scale, top: snap((window.innerHeight - 1080 * scale) / 2) / scale });
    };
    fit();
    window.addEventListener('resize', fit, { passive: true });
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    preloadStickerForge();
    const urls = new Set([
      ...slideOrder.map(id => `${import.meta.env.BASE_URL}assets/figma/${id}/shader-background.png`),
      ...['history-1', 'history-2', 'history-3'].flatMap(id => [
        ...(slideAssetUrls[id as SlideId] ?? []),
        `${import.meta.env.BASE_URL}assets/figma/${id}/imgFrame1000006910.svg`,
      ]),
    ]);
    urls.forEach(src => {
      const image = new Image();
      image.src = src;
      void image.decode().catch(() => {});
    });
  }, []);

  useEffect(() => {
    const nearby = [slideOrder[index - 1], slideOrder[index + 1]].filter(Boolean) as SlideId[];
    nearby.flatMap(id => [
      ...(slideAssetUrls[id] ?? []),
      ...slides[id].stickers.flatMap(sticker => sticker.asset.kind === 'image' ? [sticker.asset.src] : []),
    ]).forEach(src => { const img = new Image(); img.src = src; });
  }, [index]);

  const playStickSound = () => {
    try {
      const AudioContextCtor = window.AudioContext;
      const ctx = audioContext.current ??= new AudioContextCtor();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(72, now + .085);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.16, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .11);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + .12);
    } catch { /* sound is progressive enhancement */ }
  };

  const updateSticker = (id: string, patch: Partial<PlacedStickerState>) => setPlaced(all => ({
    ...all, [current]: all[current].map(s => s.stickerId === id ? { ...s, ...patch } : s),
  }));
  const removeSticker = useCallback((id: string) => setPlaced(all => ({ ...all, [current]: all[current].filter(s => s.stickerId !== id) })), [current]);

  const drop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (turning.current) return;
    const sticker = dragSticker.current;
    if (!sticker || placedIds.has(sticker.id)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = rect.width / 1732;
    const scaleY = rect.height / 1080;
    const x = Math.max(0, Math.min(1732 - sticker.width, (event.clientX - rect.left) / scaleX - sticker.width / 2));
    const y = Math.max(0, Math.min(1080 - sticker.height, (event.clientY - rect.top) / scaleY - sticker.height / 2));
    const next: PlacedStickerState = { slideId: current, stickerId: sticker.id, x, y, rotation: sticker.rotation ?? 0, zIndex: Math.max(10, ...currentPlaced.map(s => s.zIndex + 1)) };
    setPlaced(all => ({ ...all, [current]: [...all[current], next] }));
    playStickSound();
    dragSticker.current = null;
  };

  return <div className="viewport-stage">
  <main className="app-shell" style={{ zoom: viewport.scale, left: viewport.left, top: viewport.top }}>
    <section className={`presentation${pageTurn ? ' page-turn-active' : ''}`} onDragOver={e => e.preventDefault()} onDrop={drop} aria-live="polite" aria-busy={!!pageTurn}>
      <div key={current} className={`slide-transition${current.startsWith('history-') ? ' book-slide' : ''}`}>
        <SlideContent id={current} go={go} />
      </div>
      <div className="sticker-layer">
        {currentPlaced.map(state => {
          const definition = definitions.find(s => s.id === state.stickerId);
          if (!definition) return null;
          return <StickerForgeItem
            key={state.stickerId}
            definition={definition}
            state={state}
            onFront={() => updateSticker(state.stickerId, { zIndex: Math.max(...currentPlaced.map(s => s.zIndex), 0) + 1 })}
            onDetach={() => removeSticker(state.stickerId)}
          />;
        })}
      </div>
      {pageTurn && <PageTurn key={`${pageTurn.from}-${pageTurn.direction}`} from={pageTurn.from} direction={pageTurn.direction} placed={placed[pageTurn.from]} onComplete={finishPageTurn} />}
      <nav className="deck-navigation" aria-label="Навигация по слайдам">
        <button onClick={() => step(-1)} disabled={index === 0}><img src={`${import.meta.env.BASE_URL}assets/figma/shell/imgDieCut.png`} alt="Назад" /></button>
        <button onClick={() => step(1)} disabled={index === slideOrder.length - 1}><img src={`${import.meta.env.BASE_URL}assets/figma/shell/imgDieCut1.png`} alt="Вперёд" /></button>
      </nav>
    </section>
    <StickerPanel
      slideId={current}
      stickers={definitions}
      placedIds={placedIds}
      onDragStart={(event, sticker) => {
        dragSticker.current = sticker;
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', sticker.id);
      }}
    />
  </main>
  </div>;
}
