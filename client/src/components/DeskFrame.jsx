import { useEffect, useState } from 'react';

// A desk-scene border shaped like a U: the left and right pictures stay in view down the sides while you scroll,
// and the desk along the bottom slides into place at the end of the page. All three pieces are cut from one
// picture, live in the same layer and are scaled the same way, so they line up exactly.
// set="leader", "admin" or "account" (pictures in client/public/desk-*).

// Pictures whose top must not hide under the top bar (the people's faces on My account): while the top bar
// is on screen, the sides start just below it, then settle at the bottom of the window as you scroll.
const KEEP_TOP = { account: true };

// Where each piece sits in the original picture: [left, top, right, bottom] in picture pixels
const BOXES = {"leader": {"w": 1376, "h": 768, "left": [0, 79, 249, 768], "bottom": [218, 521, 953, 768], "right": [953, 2, 1376, 768]}, "admin": {"w": 1376, "h": 768, "left": [0, 143, 340, 768], "bottom": [340, 555, 880, 768], "right": [880, 205, 1376, 768]}, "account": {"w": 1376, "h": 768, "left": [0, 0, 480, 768], "bottom": [480, 405, 910, 768], "right": [910, 0, 1376, 768]}};

export function DeskSides({ set }) {
  const box = BOXES[set];
  const [k, setK] = useState(0); // screen pixels per picture pixel
  const [lift, setLift] = useState(0); // how far the bottom desk is still below the window
  const [offset, setOffset] = useState(0); // space left of the picture when it is narrower than the window
  const [drop, setDrop] = useState(0); // how far the whole picture is pushed down to clear the top bar

  useEffect(() => {
    const update = () => {
      const width = document.documentElement.clientWidth; // the window without its scroll bar
      // My account: shrink a little if needed so the whole picture fits the window once the top bar has scrolled away
      const scale = KEEP_TOP[set] ? Math.min(width / box.w, window.innerHeight / box.h) : width / box.w;
      setK(scale);
      setOffset((width - box.w * scale) / 2);
      const doc = document.documentElement;
      setLift(Math.max(0, doc.scrollHeight - (window.scrollY + window.innerHeight)));
      if (KEEP_TOP[set]) {
        const nav = document.querySelector('.nav');
        const navBottom = nav ? nav.getBoundingClientRect().bottom : 0; // top bar's lower edge on screen
        const pictureTop = window.innerHeight - box.h * scale; // where the top would be if it sat at the bottom
        setDrop(Math.max(0, navBottom - pictureTop));
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const watcher = new ResizeObserver(update);
    watcher.observe(document.body);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      watcher.disconnect();
    };
  }, [box, set]);

  if (!k) return null;
  const place = ([x0, y0, x1, y1]) => ({ left: offset + x0 * k, width: (x1 - x0) * k, bottom: (box.h - y1) * k });

  return (
    <div className="desk-sides" aria-hidden="true">
      <img className="desk-side" style={{ ...place(box.left), transform: `translateY(${drop}px)` }} src={`/desk-${set}/left.png`} alt="" draggable="false" />
      <img className="desk-side" style={{ ...place(box.right), transform: `translateY(${drop}px)` }} src={`/desk-${set}/right.png`} alt="" draggable="false" />
      <img className="desk-side desk-floor" style={{ ...place(box.bottom), transform: `translateY(${lift + drop}px)` }} src={`/desk-${set}/bottom.png`} alt="" draggable="false" />
    </div>
  );
}

// Leaves room at the end of the page for the bottom desk (on phones it shows the desk picture itself)
export function DeskBottom({ set }) {
  const box = BOXES[set];
  const deskTop = box.h - box.bottom[1]; // picture pixels from the bottom of the picture to the top of the desk
  const scale = KEEP_TOP[set] ? `min(100vw / ${box.w}, 100vh / ${box.h})` : `100vw / ${box.w}`;
  return (
    <>
      <div className="desk-room" aria-hidden="true" style={{ height: `calc(${scale} * ${deskTop} - 40px)` }} />
      <img className="desk-bottom-small" src={`/desk-${set}/bottom.png`} alt="" aria-hidden="true" draggable="false" />
    </>
  );
}
