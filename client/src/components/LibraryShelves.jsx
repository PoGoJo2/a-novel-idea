import { useEffect, useState } from 'react';

// Two tall bookcases down both sides of the My Library page, with readers already on the shelves.
// They run the full length of the page: from under the top bar down to the reading-room floor.
// Pictures live in client/public/characters (made with an AI image tool).
export default function LibraryShelves() {
  const [box, setBox] = useState({ top: 80, height: 800 });

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector('.nav');
      const floor = document.querySelector('.reading-floor');
      const top = nav ? nav.getBoundingClientRect().bottom + window.scrollY + 10 : 0;
      const bottom = floor ? floor.getBoundingClientRect().top + window.scrollY + 6 : document.documentElement.scrollHeight;
      setBox({ top, height: Math.max(300, bottom - top) });
    };
    measure();
    const watcher = new ResizeObserver(measure);
    watcher.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      watcher.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="library-shelves" aria-hidden="true" style={{ top: box.top, height: box.height }}>
      <img className="book-case case-left" src="/characters/case-left.png" alt="" draggable="false" />
      <img className="book-case case-right" src="/characters/case-right.png" alt="" draggable="false" />
    </div>
  );
}
