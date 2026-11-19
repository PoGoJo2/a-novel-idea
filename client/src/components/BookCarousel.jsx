import { useEffect, useRef, useState } from 'react';
import BookCover from './BookCover.jsx';
import BookTile from './BookTile.jsx';
import GenreBanner from './GenreBanner.jsx';
import GenreBorder, { ArrowVine } from './GenreBorder.jsx';

// Painted scene behind each genre's carousel (pictures in client/public/scenes)
const SCENES = {
  Mystery: 'mystery', Fantasy: 'fantasy', 'Science Fiction': 'science-fiction', Classics: 'classics', Horror: 'horror',
  Romance: 'romance', 'Thriller / Action': 'thriller', 'True Crime': 'true-crime', Autobiography: 'autobiography',
  'Self Help / Personal Development': 'self-help',
};

// The scene's outline follows the vine brackets on each side (see ArrowVine in GenreBorder.jsx):
// the vine is a 100 x 400 drawing that sits 78px outside the stage and stretches to the stage's height.
const VINE_OUT = 78;
const sceneOutline = (stageW, stageH) => {
  const k = stageH / 400; // vertical stretch of the vine drawing
  const W = stageW + VINE_OUT * 2;
  const H = Math.round(stageH / 2 + Math.min(60, Math.max(36, stageW * 0.04)));
  const yMid = 200 * k;
  const left = `M70 0 C26 ${36 * k} 8 ${112 * k} 8 ${yMid} L9 ${H}`;
  const right = `L${W - 9} ${H} L${W - 8} ${yMid} C${W - 8} ${112 * k} ${W - 26} ${36 * k} ${W - 70} 0 Z`;
  return { W, H, d: `${left} ${right}` };
};

// A row of books for one genre: one large book in the middle, smaller covers on each side,
// and arrow buttons to move through the list, in front of a painted scene for the genre.
export default function BookCarousel({ title, groups, zone, goals = {}, soon = new Set(), started = new Set(), needsLeader = new Set() }) {
  const [index, setIndex] = useState(0);
  const stageRef = useRef(null);
  const [outline, setOutline] = useState(null);

  // Measure the stage so the scene's curved outline matches the vines at any window size
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !SCENES[title]) return undefined;
    const measure = () => setOutline(sceneOutline(stage.offsetWidth, stage.offsetHeight));
    measure();
    const watcher = new ResizeObserver(measure);
    watcher.observe(stage);
    return () => watcher.disconnect();
  }, [title]);
  const offsets = [-2, -1, 0, 1, 2];

  const go = (step) => setIndex((i) => Math.min(Math.max(i + step, 0), groups.length - 1));

  return (
    <section className="carousel" aria-label={`${title} books`}>
      <GenreBorder genre={title} side="left" />
      <GenreBorder genre={title} side="right" />
      <GenreBanner genre={title} count={groups.length} />
      <div ref={stageRef} className={`carousel-stage${SCENES[title] ? ' has-scene' : ''}`}>
        {SCENES[title] && outline && (
          <div
            className="carousel-scene"
            aria-hidden="true"
            style={{ left: -VINE_OUT, width: outline.W, height: outline.H, clipPath: `path('${outline.d}')` }}
          >
            <img src={`/scenes/${SCENES[title]}.jpg`} alt="" loading="lazy" draggable="false" />
          </div>
        )}
        <ArrowVine side="left" />
        <ArrowVine side="right" />
        <button type="button" className="carousel-arrow left" onClick={() => go(-1)} disabled={index === 0} aria-label={`Previous ${title} book`}>
          &#8249;
        </button>

        <div className="carousel-track">
          {offsets.map((offset) => {
            const group = groups[index + offset];
            const size = Math.abs(offset);
            if (!group) return <div key={offset} className={`slot slot-${size} spacer`} aria-hidden="true" />;
            if (offset === 0) {
              return (
                <div key={offset} className="slot slot-0">
                  <BookTile group={group} zone={zone} goal={goals[group.id]} state={needsLeader.has(String(group.id)) ? 'leader' : soon.has(String(group.id)) ? 'soon' : started.has(String(group.id)) ? 'started' : 'open'} />
                </div>
              );
            }
            return (
              <button key={offset} type="button" className={`slot slot-${size} side-cover${soon.has(String(group.id)) || started.has(String(group.id)) ? ' is-greyed' : ''}`} onClick={() => go(offset)} aria-label={`Show ${group.book.title}`}>
                <BookCover book={group.book} />
              </button>
            );
          })}
        </div>

        <button type="button" className="carousel-arrow right" onClick={() => go(1)} disabled={index === groups.length - 1} aria-label={`Next ${title} book`}>
          &#8250;
        </button>
      </div>
      <p className="carousel-count" aria-live="polite">{index + 1} of {groups.length}</p>
    </section>
  );
}
