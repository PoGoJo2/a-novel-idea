import { useId } from 'react';
import CoverArt from './CoverArt.jsx';
import { bookStyle } from '../utils/time.js';

// Shows the cover image when a book has one; otherwise draws abstract artwork from the book's colors.
export default function BookCover({ book, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  if (book.coverUrl) {
    return <img className={`cover cover-img ${className}`} src={book.coverUrl} alt={`Cover of ${book.title}`} />;
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
