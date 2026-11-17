import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as libraryService from '../services/libraryService.js';
import { useLibrary } from '../context/LibraryContext.jsx';
import BookCover from '../components/BookCover.jsx';
import SaveButtons from '../components/SaveButtons.jsx';
import BackButton from '../components/BackButton.jsx';
import ReadingRoom from '../components/ReadingRoom.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { bookStyle } from '../utils/time.js';

function Shelf({ title, books, emptyText }) {
  return (
    <section className="library-shelf" aria-label={title}>
      <h2>{title} <small>{books.length} {books.length === 1 ? 'book' : 'books'}</small></h2>
      {books.length === 0 ? (
        <p className="empty-note">{emptyText}</p>
      ) : (
        <ul className="library-grid">
          {books.map((book) => (
            <li key={book.id} className="library-book" style={bookStyle(book)}>
              <Link to={`/books/${book.id}`} aria-label={`${book.title} by ${book.author}`}>
                <BookCover book={book} />
              </Link>
              <SaveButtons bookId={book.id} title={book.title} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// "My Library": everything the reader hearted or saved. It reloads whenever a heart or
// bookmark changes, so nothing has to be added by hand.
export default function LibraryPage() {
  const { version } = useLibrary();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    libraryService
      .getLibrary()
      .then(setData)
      .catch((err) => setError(err.message));
  }, [version]);

  if (error) return <ErrorMessage message={error} />;
  if (!data) return <Loader text="Opening your library..." />;

  return (
    <div className="library">
      <div className="library-top">
        <BackButton />
        <p className="eyebrow">My Library</p>
      </div>
      <h1>Your books</h1>
      <hr className="rule" />
      <Shelf title="Favorites" books={data.favorites} emptyText="No favorites yet. Tap the heart on any book to keep it here." />
      <Shelf title="Saved for next time" books={data.saved} emptyText="Nothing saved yet. Tap the bookmark on a book you want to read later." />
      <p className="muted small">Tap a heart or bookmark again to remove a book. Looking for more? <Link to="/">Browse books</Link>.</p>
      <ReadingRoom />
    </div>
  );
}
