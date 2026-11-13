import { Link } from 'react-router-dom';
import BookCover from './BookCover.jsx';
import { bookStyle, slotLabel } from '../utils/time.js';

// The large, centered tile in a carousel: cover, title, both meeting times, and a link to join.
export default function BookTile({ group, zone }) {
  const { book, timeSlots } = group;
  return (
    <article className="tile bx" style={bookStyle(book)}>
      <span className="ribbon" aria-hidden="true" />
      <BookCover book={book} />
      <h3 className="tile-title">{book.title}</h3>
      <p className="muted">{book.author}</p>
      <ul className="slot-list">
        {timeSlots.map((slot) => (
          <li key={slot.id}>
            <span className="tag tag-day">{slotLabel(slot, zone)}</span>
            <span className="tag tag-spot">{slot.seatsLeft === 0 ? 'Full' : `${slot.seatsLeft} left`}</span>
          </li>
        ))}
      </ul>
      <Link className="btn btn-accent" to={`/books/${book.id}`}>View &amp; join</Link>
    </article>
  );
}
