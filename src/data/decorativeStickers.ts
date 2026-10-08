import type { StickerDefinition } from '../types';

// Variants share a family so only one version can appear on a slide.
export const decorativeStickers: StickerDefinition[] = [
  { id: 'deco-boombox-hologram', family: 'boombox', label: 'Бумбокс с голограммой', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/boombox-hologram.png` }, width: 260.000, height: 226.823, rotation: 0 },
  { id: 'deco-boombox-cut', family: 'boombox', label: 'Бумбокс на звезде', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/boombox-cut.png` }, width: 250.000, height: 250.977, rotation: 0 },
  { id: 'deco-phone-hologram', family: 'phone', label: 'Телефон с голограммой', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/phone-hologram.png` }, width: 161.989, height: 280.000, rotation: 0 },
  { id: 'deco-phone-cut', family: 'phone', label: 'Телефон', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/phone-cut.png` }, width: 163.466, height: 280.000, rotation: 0 },
  { id: 'deco-glasses-hologram', family: 'glasses', label: 'Голографические очки', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/glasses-hologram.png` }, width: 287.344, height: 160.172, rotation: 0 },
  { id: 'deco-boombox-star', family: 'boombox', label: 'Бумбокс на голографической звезде', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/boombox-star.png` }, width: 270.000, height: 270.703, rotation: 0 },
  { id: 'deco-tamagotchi', label: 'Тамагочи', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/tamagotchi.png` }, width: 230.000, height: 241.081, rotation: 0 },
  { id: 'deco-player-cut', label: 'CD-плеер', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/player-cut.png` }, width: 240.000, height: 240.000, rotation: 0 },
  { id: 'deco-glasses-cut', family: 'glasses', label: 'Очки', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/glasses-cut.png` }, width: 240.000, height: 150.938, rotation: 0 },
  { id: 'deco-laugh', label: 'Смех', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/laugh.png` }, width: 160.000, height: 160.000, rotation: 0 },
  { id: 'deco-mindblown', label: 'Вау', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/mindblown.png` }, width: 160.000, height: 160.000, rotation: 0 },
  { id: 'deco-thumb', label: 'Класс', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/thumb.png` }, width: 218.000, height: 218.000, rotation: 0 },
  { id: 'deco-fire', label: 'Огонь', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/fire.png` }, width: 175.000, height: 175.000, rotation: 0 },
  { id: 'deco-dog', label: 'Собака', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/stickers/dog.png` }, width: 336.000, height: 336.000, rotation: 0 },
  // This export already includes its tilt; keep its 507×346 aspect ratio.
  { id: 'deco-wow', label: 'Wow', asset: { kind: 'image', src: `${import.meta.env.BASE_URL}assets/figma/chapters/imgWowHologram.png` }, width: 155, height: 155 * 346 / 507, rotation: 0 },
];
