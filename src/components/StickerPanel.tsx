import { useLayoutEffect, useRef, useState } from 'react';
import type { SlideId, StickerDefinition } from '../types';
import { stickerSource } from './StickerForgeItem';

export function StickerPanel({ slideId, stickers, placedIds, onDragStart }: { slideId: SlideId; stickers: StickerDefinition[]; placedIds: Set<string>; onDragStart: (event: React.DragEvent, sticker: StickerDefinition) => void }) {
  const available = stickers.filter(s => !placedIds.has(s.id));
  const inventory = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);
  const previous = useRef({ slideId, available });
  const [outgoing, setOutgoing] = useState<{ stickers: StickerDefinition[]; scrollTop: number } | null>(null);
  const cleanup = useRef<ReturnType<typeof setTimeout>>();

  useLayoutEffect(() => {
    if (previous.current.slideId !== slideId) {
      clearTimeout(cleanup.current);
      setOutgoing({ stickers: previous.current.available, scrollTop: scrollTop.current });
      scrollTop.current = 0;
      if (inventory.current) inventory.current.scrollTop = 0;
      cleanup.current = setTimeout(() => setOutgoing(null), 260);
    }
    previous.current = { slideId, available };
  }, [slideId, available]);

  useLayoutEffect(() => () => clearTimeout(cleanup.current), []);

  return <aside className="sticker-panel" aria-label="Стикеры для текущего слайда">
    <img src={`${import.meta.env.BASE_URL}assets/figma/shell/imgDieCut2.png`} className="sticker-heading" alt="Стикерс" />
    <div className="inventory-stage">
      {outgoing && <div className="inventory inventory-outgoing" aria-hidden="true">
        <div className="inventory-old-content" style={{ transform: `translateY(${-outgoing.scrollTop}px)` }}>
          {outgoing.stickers.map(sticker => <div key={sticker.id} className="inventory-item"><img src={stickerSource(sticker)} alt="" /></div>)}
          {!outgoing.stickers.length && <p className="inventory-empty">Все стикеры<br />на слайде</p>}
        </div>
      </div>}
      <div key={slideId} ref={inventory} className="inventory inventory-incoming" onScroll={event => { scrollTop.current = event.currentTarget.scrollTop; }}>
        {available.map((sticker, index) => <div key={sticker.id} className="inventory-arrival" style={{ animationDelay: `${80 + Math.min(index, 5) * 35}ms` }}>
          <button
            className="inventory-item"
            draggable
            onDragStart={event => onDragStart(event, sticker)}
            aria-label={`Перетащить стикер: ${sticker.label}`}
          >
            <img src={stickerSource(sticker)} alt="" />
          </button>
        </div>)}
        {!available.length && <p className="inventory-empty inventory-arrival">Все стикеры<br />на слайде</p>}
      </div>
    </div>
  </aside>;
}
