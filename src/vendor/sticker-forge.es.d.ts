export interface StickerForgeControl {
  setSource(source: unknown): Promise<void>;
  setOptions(options: unknown): void;
  setRenderScale(scale: number): void;
  reappear(): void;
  reset(): void;
  resize(): void;
  getState(): unknown;
  destroy(): void;
}

export function createSticker(target: HTMLElement, options: unknown): Promise<StickerForgeControl>;
