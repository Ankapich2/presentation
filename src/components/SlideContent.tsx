import type { SlideId } from '../types';
import { WindowsBar } from './WindowsBar';

const A = `${import.meta.env.BASE_URL}assets/figma`;
const Img = ({ src, className = '', alt = '' }: { src: string; className?: string; alt?: string }) => <img src={src} className={className} alt={alt} draggable={false} />;

function Cover() {
  return <div className="slide cover-slide">
    <Img src={`${A}/cover/shader-background.png`} className="full-bg cover-base" />
    <Img src={`${A}/cover/imgPresentationTitleHologram.png`} className="cover-title" alt="Обó мне" />
    <Img src={`${A}/cover/portrait-updated.png`} className="cover-person" alt="Фотография автора" />
    <Img src={`${A}/cover/imgExec9355BbdaF0Dd47D6B02E3D50194F104C1DieCut.png`} className="cover-phone" alt="" />
  </div>;
}

const ChapterCard = ({ n, middle, bottom, tone, onClick }: { n: number; middle: string; bottom: string; tone: string; onClick: () => void }) =>
  <button className={`chapter-card chapter-${n}`} onClick={onClick} aria-label={`Открыть главу ${n}`}>
    <span className="chapter-number">Глава {n}</span>
    <span className="chapter-middle">{middle}</span>
    <span className="chapter-bottom" style={{ background: tone }}>{bottom}</span>
  </button>;

function Chapters({ go }: { go: (id: SlideId) => void }) {
  return <div className="slide chapter-slide">
    <Img src={`${A}/chapters/shader-background.png`} className="full-bg shader-export" />
    <Img src={`${A}/chapters/imgPresentationTitleHologram.png`} className="chapter-title" alt="Бэкграунд" />
    <Img src={`${A}/chapters/img2021-2026DieCut.png`} className="chapter-range" alt="2021–2026" />
    <div className="chapter-cards">
      <ChapterCard n={1} middle="photoshop..." bottom="начало" tone="#abfd04" onClick={() => go('history-1')} />
      <ChapterCard n={2} middle="old (no)money" bottom="freelance" tone="#f79705" onClick={() => go('history-2')} />
      <ChapterCard n={3} middle="не так и плохо" bottom="найм" tone="#abfd04" onClick={() => go('history-3')} />
    </div>
  </div>;
}

const history = {
  'history-1': { title: 'imgPresentationTitleDieCut.png', date: 'img20212023Hologram.png', hero: 'imgImage26DieCut.png', heroClass: 'history-cat right', titleW: 474 },
  'history-2': { title: 'imgPresentationTitleDieCut.png', date: 'img20232024Hologram.png', hero: 'imgImage23DieCut.png', heroClass: 'history-cat left', titleW: 445 },
  'history-3': { title: 'imgPresentationTitleDieCut.png', date: 'img20242026Hologram.png', hero: 'imgImage24DieCut.png', heroClass: 'history-cat center', titleW: 404 },
} as const;

function History({ id }: { id: keyof typeof history }) {
  const data = history[id]; const dir = `${A}/${id}`;
  return <div className={`slide history-slide ${id}`}>
    <Img src={`${dir}/shader-background.png`} className="full-bg shader-export" />
    <Img src={`${dir}/imgFrame1000006910.svg`} className="notebook-lines" />
    <div className="history-heading" style={{ width: data.titleW }}>
      <Img src={`${dir}/${data.title}`} />
      <Img src={`${dir}/${data.date}`} className="history-date" />
    </div>
    <Img src={`${dir}/${data.hero}`} className={data.heroClass} alt="" />
  </div>;
}

// Each folder uses its Figma artwork; both retain the same hover motion.
const folderPhotos = {
  left: [
    { x: .13, y: 6.13, bound: 86.814, size: 68.691, angle: -18.34, image: 'folder-console.png', ix: 16.37, iy: 6.04, iw: 40.375, ih: 40.375, ir: 0 },
    { x: 70, y: 13, bound: 60.803, size: 56.455, angle: -4.6, image: 'folder-restrict.png', ix: 6.474, iy: 4.224, iw: 42.738, ih: 42.738, ir: .602 },
    { x: 112, y: 20.14, bound: 73.197, size: 56.455, angle: 21.46, image: 'folder-mine.png', ix: 6.63, iy: 4.81, iw: 41.007, ih: 41.007, ir: 0 },
    { x: 167, y: 49, bound: 56.012, size: 41.257, angle: 28.74, image: 'folder-tree.png', ix: 8.402, iy: 8.402, iw: 24.454, ih: 24.454, ir: 0 },
  ],
  right: [
    { x: 0, y: 13.47, bound: 56.013, size: 41.257, angle: -28.74, image: 'folder-test-1.png', ix: -12.274, iy: -7.574, iw: 66.397, ih: 55.299, ir: 11.167 },
    { x: 35.12, y: 8, bound: 73.197, size: 56.455, angle: -21.46, image: 'folder-test-2.png', ix: 1.092, iy: -7.085, iw: 54.305, ih: 63.729, ir: -1.643 },
    { x: 91.25, y: 6.96, bound: 60.803, size: 56.455, angle: -4.6, image: 'folder-test-3.png', ix: 4.551, iy: -.035, iw: 48, ih: 56, ir: 21.066 },
    { x: 135.35, y: 6.42, bound: 86.814, size: 68.691, angle: 18.34, image: 'folder-test-4.png', ix: 1.821, iy: -6.022, iw: 64, ih: 76, ir: -18.338 },
  ],
};

function Folder({ label, onClick, side }: { label: string; onClick: () => void; side: 'left' | 'right' }) {
  return <button className={`project-folder ${side}`} onClick={onClick} aria-label={label}>
    <div className="photo-stack">
      {folderPhotos[side].map((photo, i) => <div key={i} className="folder-photo-slot" style={{ left: photo.x, top: photo.y, width: photo.bound, height: photo.bound }}>
        <div className={`folder-photo ${photo.size > 60 ? 'large' : ''}`} style={{ width: photo.size, height: photo.size, rotate: `${photo.angle}deg` }}>
          <div className="folder-photo-inner">
            {photo.image && <img src={`${A}/projects/${photo.image}`} alt="" draggable={false} style={{ left: photo.ix, top: photo.iy, width: photo.iw, height: photo.ih, rotate: `${photo.ir}deg` }} />}
          </div>
        </div>
      </div>)}
    </div>
    <div className="folder-glass" aria-hidden="true" />
    <Img src={`${A}/projects/imgRectangle2.svg`} className="folder-shape" />
    <span className="folder-rule rule-first" /><span className="folder-rule rule-second" />
    <div className="folder-label">
      <Img src={`${A}/projects/${side === 'left' ? 'imgDieCut1.png' : 'imgDieCut2.png'}`} alt={label} />
    </div>
  </button>;
}

function Projects({ go }: { go: (id: SlideId) => void }) {
  return <div className="slide projects-slide">
    <Img src={`${A}/projects/shader-background.png`} className="full-bg xp-bg" />
    <Img src={`${A}/projects/imgPresentationTitleDieCut.png`} className="projects-title" alt="Проекты" />
    <Img src={`${A}/projects/imgDieCut.png`} className="projects-subtitle" alt="Есть о чем поведать" />
    <Img src={`${A}/projects/imgImage23.png`} className="projects-cat" alt="" />
    <Folder label="Мой сайт" side="left" onClick={() => window.open('https://ankapich2.github.io/', '_blank', 'noopener,noreferrer')} />
    <Folder label="Тестовое" side="right" onClick={() => go('case-1')} />
    <WindowsBar folder="projects" />
  </div>;
}

function Case({ id }: { id: 'case-1' | 'case-2' | 'case-3' }) {
  const dir = `${A}/${id}`;
  if (id === 'case-3') return <div className="slide case-slide case-3 prototype-slide">
    <Img src={`${dir}/shader-background.png`} className="full-bg xp-bg" />
    <Img src={`${dir}/prototype-title.png`} className="case-title" alt="Прототип" />
    <div className="prototype-phone">
      <Img src={`${dir}/prototype-phone.png`} className="phone-frame" />
      <Img src={`${dir}/prototype-phone-overlay.png`} className="phone-frame" />
      <div className="prototype-screen">
        <iframe src={`${import.meta.env.BASE_URL}prototype/index.html`} title="Авито Работа — кликабельный прототип" />
      </div>
    </div>
    <WindowsBar folder={id} />
  </div>;
  return <div className={`slide case-slide ${id}`}>
    <Img src={`${dir}/shader-background.png`} className="full-bg xp-bg" />
    <Img src={`${dir}/${id === 'case-1' ? 'new-title.png' : 'imgPresentationTitleDieCut.png'}`} className="case-title" alt="" />
    {id === 'case-2' && <Img src={`${dir}/imgFrame1000006916DieCut.png`} className="case-ribbon" />}
    <WindowsBar folder={id} />
  </div>;
}

export function SlideContent({ id, go }: { id: SlideId; go: (id: SlideId) => void }) {
  if (id === 'cover') return <Cover />;
  if (id === 'chapters') return <Chapters go={go} />;
  if (id.startsWith('history')) return <History id={id as keyof typeof history} />;
  if (id === 'projects') return <Projects go={go} />;
  return <Case id={id as 'case-1' | 'case-2' | 'case-3'} />;
}
