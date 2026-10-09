import type { SlideDefinition, SlideId, StickerDefinition } from '../types';
import { decorativeStickers } from './decorativeStickers';

const A = `${import.meta.env.BASE_URL}assets/figma`;

const image = (id: string, label: string, src: string, width: number, height: number, rotation = 0): StickerDefinition => ({
  id, label, asset: { kind: 'image', src }, width, height, rotation,
});

export const slideOrder: SlideId[] = ['cover', 'chapters', 'history-1', 'history-2', 'history-3', 'projects', 'case-1', 'case-2', 'case-3'];

const baseSlides: Record<SlideId, SlideDefinition> = {
  cover: {
    id: 'cover', figmaNodeId: '35:46', title: 'Обó мне', background: 'cover',
    stickers: [
      image('experience', 'Опыт', `${A}/cover/imgHologram.png`, 177, 85, 1),
      image('projects', 'Проекты', `${A}/cover/imgHologram1.png`, 268, 151, 14),
      image('history', 'History', `${A}/cover/imgHistoryHologram.png`, 215, 140, -16),
      image('challenge', 'Тестовое', `${A}/cover/imgHologram2.png`, 308, 128, -10),
    ],
  },
  chapters: {
    id: 'chapters', figmaNodeId: '35:57', title: 'Бэкграунд', background: 'clouds',
    stickers: [
    ],
  },
  'history-1': {
    id: 'history-1', figmaNodeId: '35:179', title: 'Начало', background: 'paper',
    stickers: [
      image('story', 'История начала', `${A}/history-1/info-exact.png?v=20261009-figma2`, 608.666667, 231.666667),
    ],
  },
  'history-2': {
    id: 'history-2', figmaNodeId: '35:201', title: 'Фриланс', background: 'paper',
    stickers: [
      image('story', 'История фриланса', `${A}/history-2/info-exact.png?v=20261009-figma2`, 668.333333, 270.333333),
    ],
  },
  'history-3': {
    id: 'history-3', figmaNodeId: '35:223', title: 'Найм', background: 'paper',
    stickers: [
      image('story', 'История найма', `${A}/history-3/info-exact.png?v=20261009-figma2`, 693.333333, 361.666667),
    ],
  },
  projects: {
    id: 'projects', figmaNodeId: '35:87', title: 'Проекты', background: 'xp',
    stickers: [],
  },
  'case-1': {
    id: 'case-1', figmaNodeId: '207:7979', title: 'Тестовое', background: 'xp',
    stickers: [
      // Exports include the original rotation and translucent outer stroke.
      image('brief', 'Задача', `${A}/case-1/info-brief-new.png?v=20261009-figma2`, 476.333333, 249.333333),
      image('solution', 'Решение', `${A}/case-1/info-solution-new.png?v=20261009-figma2`, 583, 268),
    ],
  },
  'case-2': {
    id: 'case-2', figmaNodeId: '35:138', title: 'Как решал', background: 'xp',
    stickers: [
      // Figma frame dimensions plus the 11px outer stroke on each side.
      // The PNG exports are 3×; render their full bounds at the original scale.
      image('goal', 'Продуктовая цель', `${A}/case-2/info-goal-exact.png?v=20261009-figma2`, 468.666667, 229),
      image('research', 'Исследования', `${A}/case-2/info-research-exact.png?v=20261009-figma2`, 468.666667, 229),
      image('jobs', 'Job Story', `${A}/case-2/info-jobs-exact.png?v=20261009-figma2`, 468.666667, 194),
      image('entry', 'Новые входы', `${A}/case-2/info-entry-exact.png?v=20261009-figma2`, 468.666667, 194),
      image('saved', 'Сохранённые условия', `${A}/case-2/info-saved-exact.png?v=20261009-figma2`, 387, 194),
    ],
  },
  'case-3': {
    id: 'case-3', figmaNodeId: '202:7845', title: 'Прототип', background: 'xp',
    stickers: [
      image('result', 'Результат', `${A}/case-3/info-prototype-exact.png?v=20261009-figma2`, 594.333333, 300),
    ],
  },
};

// These stickers are already placed in the Figma composition on “Тестовое”.
// Reserve their canonical entries separately from the random panel inventory.
const preplacedDecorativeIds = new Set(['deco-glasses-hologram', 'deco-dog', 'deco-thumb']);

export function createSlideDefinitions(random: () => number = Math.random): Record<SlideId, SlideDefinition> {
  const result = Object.fromEntries(slideOrder.map(id => [id, { ...baseSlides[id], stickers: [...baseSlides[id].stickers] }])) as Record<SlideId, SlideDefinition>;
  result['case-1'].stickers.push(...decorativeStickers.filter(sticker => preplacedDecorativeIds.has(sticker.id)));
  const pool = decorativeStickers.filter(sticker => !preplacedDecorativeIds.has(sticker.id));
  const family = (sticker: StickerDefinition) => sticker.family ?? sticker.id;
  const uses = new Map(pool.map(sticker => [family(sticker), 0]));
  let previous = new Set<string>();
  for (const id of slideOrder) {
    if (id === 'case-2') {
      previous = new Set();
      continue;
    }
    const selected = new Set(result[id].stickers.filter(sticker => sticker.id.startsWith('deco-')).map(family));
    const count = 2 + Math.floor(random() * 3);
    for (let i = 0; i < count; i++) {
      // Treat different outlines of the same image as one family, including placed stickers.
      const eligible = pool.filter(sticker => !selected.has(family(sticker)) && !previous.has(family(sticker)));
      const leastUsed = Math.min(...eligible.map(sticker => uses.get(family(sticker))!));
      const candidates = eligible.filter(sticker => uses.get(family(sticker)) === leastUsed);
      const sticker = candidates[Math.floor(random() * candidates.length)];
      result[id].stickers.push(sticker);
      selected.add(family(sticker));
      uses.set(family(sticker), leastUsed + 1);
    }
    previous = selected;
  }
  return result;
}

// Choose once per page load, keeping assignments stable while navigating.
export const slides = createSlideDefinitions();
