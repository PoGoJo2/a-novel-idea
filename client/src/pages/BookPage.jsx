import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as catalogService from '../services/catalogService.js';
import { slotLabel, viewerZone } from '../utils/time.js';
import BookCover from '../components/BookCover.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// Temporary page: proves the book API works from React. Stage 7 builds the full page
// (centered cover, time picker, join button, reading help).
export default function BookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setBook(null);
    setError('');
    catalogService.getBook(id).then((data) => setBook(data.book)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!book) return <Loader />;

  const zone = viewerZone(user);
  return (
    <div className="center-page">
      <p className="eyebrow">The adventure</p>
      <BookCover book={book} className="cover-large" />
      <h1>{book.title}</h1>
      <p className="muted">{book.author} · {book.genre}</p>
      <p className="lead">{book.description}</p>
      {book.groups.map((group) => (
        <ul key={group.id} className="slot-list">
          {group.timeSlots.map((slot) => (
            <li key={slot.id}>
              <span className="tag tag-day">{slotLabel(slot, zone)}</span>
              <span className="tag tag-spot">{slot.seatsLeft} seats left</span>
            </li>
          ))}
        </ul>
      ))}
      <p className="muted">The full booking page arrives in the next stage.</p>
    </div>
  );
}
