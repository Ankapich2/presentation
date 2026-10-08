/// <reference types="vite/client" />

declare module '/vendor/sticker-forge/sticker-forge.es.js' {
  export function createSticker(target: HTMLElement, options: unknown): Promise<{
    setSource(source: unknown): Promise<void>;
    setOptions(options: unknown): void;
    destroy(): void;
  }>;
}
