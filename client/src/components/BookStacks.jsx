import { useEffect, useState } from 'react';

// Two tall towers of books down both sides of the My Meetings page, with little readers sitting on them.
// They run the full length of the page, from under the top bar to the bottom of the content.
// Pictures live in client/public/characters (made with an AI image tool).
export default function BookStacks() {
  const [box, setBox] = useState({ top: 80, height: 800 });

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector('.nav');
      const main = document.querySelector('main.page');
      const top = nav ? nav.getBoundingClientRect().bottom + window.scrollY + 10 : 0;
      const contentBottom = main ? main.getBoundingClientRect().bottom + window.scrollY : 0;
      const bottom = Math.max(contentBottom, window.innerHeight) - 8;
      setBox({ top, height: Math.max(300, bottom - top) });
    };
    measure();
    const main = document.querySelector('main.page');
    const watcher = new ResizeObserver(measure);
    if (main) watcher.observe(main);
    window.addEventListener('resize', measure);
    return () => {
      watcher.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="book-stacks" aria-hidden="true" style={{ top: box.top, height: box.height }}>
      <img className="book-tower tower-left" src="/characters/tower-left.png" alt="" draggable="false" />
      <img className="book-tower tower-right" src="/characters/tower-right.png" alt="" draggable="false" />
    </div>
  );
}
