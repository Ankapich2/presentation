import { useEffect, useId, useRef } from 'react';
import { SlideContent } from './SlideContent';
import { stickerSource } from './StickerForgeItem';
import { slides } from '../data/slides';
import type { PlacedStickerState, SlideId } from '../types';

const WIDTH = 1732;
const HEIGHT = 1080;
const DURATION = 820;
type Point = [number, number];
const rectangle: Point[] = [[0, 0], [WIDTH, 0], [WIDTH, HEIGHT], [0, HEIGHT]];

// Clip a sheet along the diagonal crease, then reflect the lifted corner.
function clipSheet(crease: number, keepFront: boolean): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < rectangle.length; i++) {
    const a = rectangle[i];
    const b = rectangle[(i + 1) % rectangle.length];
    const da = a[0] + a[1] - crease;
    const db = b[0] + b[1] - crease;
    const insideA = keepFront ? da <= 0 : da >= 0;
    const insideB = keepFront ? db <= 0 : db >= 0;
    if (insideA) points.push(a);
    if (insideA !== insideB) {
      const t = da / (da - db);
      points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return points;
}

export function PageTurn({ from, direction, placed, onComplete }: {
  from: SlideId;
  direction: 'forward' | 'backward';
  placed: PlacedStickerState[];
  onComplete: () => void;
}) {
  const id = useId().replace(/:/g, '');
  const front = useRef<HTMLDivElement>(null);
  const fold = useRef<SVGPolygonElement>(null);
  const shadow = useRef<SVGPolygonElement>(null);
  const gradient = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    let frame = 0;
    let start: number | undefined;
    const mirror = (points: Point[]) => points.map(([x, y]) => [direction === 'backward' ? WIDTH - x : x, y] as Point);
    const draw = (time: number) => {
      start ??= time;
      const progress = Math.min(1, (time - start) / DURATION);
      // Slow corner lift, a continuous sweep, and a soft landing.
      const eased = progress * progress * (3 - 2 * progress);
      const crease = (WIDTH + HEIGHT) * (1 - eased);
      const remaining = mirror(clipSheet(crease, true));
      const lifted = mirror(clipSheet(crease, false).map(([x, y]) => [crease - y, crease - x]));
      if (front.current) front.current.style.clipPath = `polygon(${remaining.map(([x, y]) => `${x}px ${y}px`).join(',')})`;
      const polygon = lifted.map(p => p.join(',')).join(' ');
      fold.current?.setAttribute('points', polygon);
      shadow.current?.setAttribute('points', polygon);
      const x = direction === 'backward' ? WIDTH - crease / 2 : crease / 2;
      gradient.current?.setAttribute('x1', String(x));
      gradient.current?.setAttribute('y1', String(crease / 2));
      gradient.current?.setAttribute('x2', String(x + (direction === 'backward' ? 130 : -130)));
      gradient.current?.setAttribute('y2', String(crease / 2 - 130));
      if (progress < 1) frame = requestAnimationFrame(draw);
      else onComplete();
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [direction, from, onComplete]);

  return <div className={`book-turn ${direction}`} aria-hidden="true">
    <div ref={front} className="book-front">
      <SlideContent id={from} go={() => {}} />
      {placed.map(state => {
        const sticker = slides[from].stickers.find(item => item.id === state.stickerId);
        if (!sticker) return null;
        return <img key={state.stickerId} src={stickerSource(sticker)} alt="" className="book-sticker"
          style={{ left: state.x, top: state.y, width: sticker.width, height: sticker.height, transform: `rotate(${state.rotation}deg)`, zIndex: state.zIndex }} />;
      })}
    </div>
    <svg className="book-fold" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <defs>
        <linearGradient ref={gradient} id={`${id}-paper`} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9b9283" />
          <stop offset=".08" stopColor="#d7cfc0" />
          <stop offset=".28" stopColor="#fffdf6" />
          <stop offset=".65" stopColor="#f0eadd" />
          <stop offset="1" stopColor="#e2dac9" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <polygon ref={shadow} fill="#322719" opacity=".22" filter={`url(#${id}-shadow)`} transform={`translate(${direction === 'backward' ? -12 : 12} 18)`} />
      <polygon ref={fold} fill={`url(#${id}-paper)`} />
    </svg>
  </div>;
}
