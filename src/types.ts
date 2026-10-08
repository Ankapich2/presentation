export type SlideId =
  | 'cover'
  | 'chapters'
  | 'history-1'
  | 'history-2'
  | 'history-3'
  | 'projects'
  | 'case-1'
  | 'case-2'
  | 'case-3';

export type StickerAsset =
  | { kind: 'image'; src: string }
  | { kind: 'label'; text: string; background: string; color: string; fontSize: number };

export interface StickerDefinition {
  id: string;
  family?: string;
  label: string;
  asset: StickerAsset;
  width: number;
  height: number;
  rotation?: number;
}

export interface SlideDefinition {
  id: SlideId;
  figmaNodeId: string;
  title: string;
  background: 'cover' | 'clouds' | 'paper' | 'xp';
  stickers: StickerDefinition[];
}

export interface PlacedStickerState {
  slideId: SlideId;
  stickerId: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}
