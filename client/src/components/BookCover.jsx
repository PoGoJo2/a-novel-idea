import { useId } from 'react';
import CoverArt from './CoverArt.jsx';
import { bookStyle } from '../utils/time.js';

// Shows the book's painted cover picture when it has one (client/public/covers), otherwise draws artwork
// from the book's colors. Either way the title and author are printed over the bottom of the cover.
export default function BookCover({ book, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  if (book.coverUrl) {
    return (
      <div className={`cover cover-art has-photo ${className}`} role="img" aria-label={`Cover of ${book.title}`}>
        <img className="cover-photo" src={book.coverUrl} alt="" loading="lazy" draggable="false" />
        <span className="cover-shade" aria-hidden="true" />
        <span className="cover-title">{book.title}</span>
        <span className="cover-author">{book.author}</span>
      </div>
    );
  }

  return (
    <div className={`cover cover-art ${className}`} style={bookStyle(book)} role="img" aria-label={`Cover of ${book.title}`}>
      <svg className="cover-svg" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <CoverArt book={book} uid={uid} />
      </svg>
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
    </div>
  );
}
