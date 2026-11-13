import { bookStyle } from '../utils/time.js';

// Shows the cover image when a book has one; otherwise draws a cover from the book's colors.
export default function BookCover({ book, className = '' }) {
  if (book.coverUrl) {
    return <img className={`cover cover-img ${className}`} src={book.coverUrl} alt={`Cover of ${book.title}`} />;
  }
  return (
    <div className={`cover ${className}`} style={bookStyle(book)} role="img" aria-label={`Cover of ${book.title}`}>
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
    </div>
  );
}
