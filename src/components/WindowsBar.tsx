import { useEffect, useState } from 'react';

type Props = { folder?: 'projects' | 'case-1' | 'case-2' | 'case-3' };

const localTime = () => new Date().toLocaleTimeString('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: true,
}).replace(/\s/g, '');

export function WindowsBar({ folder = 'projects' }: Props) {
  const [time, setTime] = useState(localTime);
  useEffect(() => {
    const update = () => setTime(localTime());
    const timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  const root = `${import.meta.env.BASE_URL}assets/figma/${folder}`;
  return <div className="windows-bar" aria-hidden="true">
    <div className="start-button">
      <img src={`${root}/imgWindowsLogoWithoutText21.png`} />
      <span>Start</span>
    </div>
    <div className="clock">
      <img src={`${root}/imgVolume21.png`} />
      <span>{time}</span>
    </div>
  </div>;
}
