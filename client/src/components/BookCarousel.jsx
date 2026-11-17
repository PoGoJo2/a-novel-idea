import { useState } from 'react';
import BookCover from './BookCover.jsx';
import BookTile from './BookTile.jsx';
import GenreBanner from './GenreBanner.jsx';
import GenreBorder, { ArrowVine } from './GenreBorder.jsx';

// A row of books for one genre: one large book in the middle, smaller covers on each side,
// and arrow buttons to move through the list.
export default function BookCarousel({ title, groups, zone, goals = {} }) {
  const [index, setIndex] = useState(0);
  const offsets = [-2, -1, 0, 1, 2];

  const go = (step) => setIndex((i) => Math.min(Math.max(i + step, 0), groups.length - 1));

  return (
    <section className="carousel" aria-label={`${title} books`}>
      <GenreBorder genre={title} side="left" />
      <GenreBorder genre={title} side="right" />
      <GenreBanner genre={title} count={groups.length} />
      <div className="carousel-stage">
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
                  <BookTile group={group} zone={zone} goal={goals[group.id]} />
                </div>
              );
            }
            return (
              <button key={offset} type="button" className={`slot slot-${size} side-cover`} onClick={() => go(offset)} aria-label={`Show ${group.book.title}`}>
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
