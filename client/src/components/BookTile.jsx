import { Link, useLocation, useNavigate } from 'react-router-dom';
import BookCover from './BookCover.jsx';
import SaveButtons from './SaveButtons.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { bookStyle, slotLabel } from '../utils/time.js';
import { formatStart } from '../utils/startDate.js';

// The "notify me" button for a group that has already started: the reader asks to hear when a new group begins.
function NotifyButton({ bookId }) {
  const { loggedIn, isNotify, toggleNotify } = useLibrary();
  const navigate = useNavigate();
  const location = useLocation();
  const on = isNotify(bookId);
  return (
    <button
      type="button"
      className={`btn btn-accent notify-btn${on ? ' on' : ''}`}
      aria-pressed={on}
      onClick={() => (loggedIn ? toggleNotify(bookId) : navigate('/login', { state: { from: location } }))}
    >
      {on ? "\u2713 You'll be notified" : 'Notify me when a new group starts'}
    </button>
  );
}

// The large, centered tile in a carousel: cover, title, both meeting times, and a link to join.
// state: "open" (can join), "soon" (the leader has not set the weekly plan yet), "started" (already past week 3).
export default function BookTile({ group, zone, goal, state = 'open' }) {
  const { book, timeSlots } = group;
  const greyed = state !== 'open';
  const start = formatStart(group.startDate);
  return (
    <article className={`tile bx${greyed ? ' is-greyed' : ''}`} style={bookStyle(book)}>
      <span className="ribbon" aria-hidden="true" />
      <div className="cover-wrap">
        <BookCover book={book} />
        <SaveButtons bookId={book.id} title={book.title} />
      </div>
      <h3 className="tile-title">{book.title}</h3>
      <p className="muted">{book.author}</p>
      {start.text && (
        <p className="start-date">
          <strong>{start.past ? 'Started' : 'Starts'}</strong> {start.text}
        </p>
      )}
      {state === 'soon' && <p className="soon-note"><strong>Coming soon.</strong> The leader is still planning the weekly reading.</p>}
      {state === 'started' && <p className="soon-note"><strong>Already started.</strong> Joining closed when week 3 began.</p>}
      {state === 'open' && goal && (
        <p className="tile-goal">
          <strong>Week {goal.weekNumber}:</strong> {goal.chapters}
        </p>
      )}
      {state === 'open' && (
        <ul className="slot-list">
          {timeSlots.map((slot) => (
            <li key={slot.id}>
              <span className="tag tag-day">{slotLabel(slot, zone)}</span>
              <span className="tag tag-spot">{slot.seatsLeft === 0 ? 'Full' : `${slot.seatsLeft} left`}</span>
            </li>
          ))}
        </ul>
      )}
      {state === 'open' && <Link className="btn btn-accent" to={`/books/${book.id}`}>View &amp; join</Link>}
      {state === 'soon' && <span className="btn btn-accent is-disabled" aria-disabled="true">Coming soon</span>}
      {state === 'started' && <NotifyButton bookId={book.id} />}
    </article>
  );
}
