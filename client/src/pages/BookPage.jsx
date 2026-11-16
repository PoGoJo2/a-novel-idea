import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as catalogService from '../services/catalogService.js';
import * as bookingService from '../services/bookingService.js';
import { viewerZone } from '../utils/time.js';
import BookCover from '../components/BookCover.jsx';
import TimeSlotPicker from '../components/TimeSlotPicker.jsx';
import WeeklySchedule from '../components/WeeklySchedule.jsx';
import ReadingHelp from '../components/ReadingHelp.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// The full book page ("The adventure"): centered cover and title, the two meeting times,
// join / switch / leave buttons, the weekly schedule, and the reading-help panel.
export default function BookPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [membership, setMembership] = useState(null); // this reader's active booking for this book
  const [chosen, setChosen] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Reload the book (fresh seat counts) and, when logged in, the reader's own booking
  const load = useCallback(async () => {
    const data = await catalogService.getBook(id);
    setBook(data.book);
    const groupId = data.book.groups[0]?.id;
    if (user && groupId) {
      const mine = await bookingService.getMyMemberships();
      setMembership(mine.memberships.find((m) => m.group.id === groupId) || null);
    } else {
      setMembership(null);
    }
  }, [id, user]);

  useEffect(() => {
    setBook(null);
    setError('');
    setMessage('');
    load().catch((err) => setError(err.message));
  }, [load]);

  // Start with the reader's current time selected, or the first time with a free seat
  useEffect(() => {
    const group = book?.groups[0];
    if (!group) return;
    const open = group.timeSlots.find((s) => s.seatsLeft > 0);
    setChosen(membership?.slot?.id || open?.id || '');
  }, [book, membership]);

  // Runs a booking action, then refreshes the page data
  const act = async (action, doneMessage) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      await load();
      setMessage(doneMessage);
    } catch (err) {
      setError(err.message);
      load().catch(() => {}); // seat counts may have changed
    } finally {
      setBusy(false);
    }
  };

  if (error && !book) return <ErrorMessage message={error} />;
  if (!book) return <Loader />;

  const group = book.groups[0];
  const zone = viewerZone(user);
  const mySlotId = membership?.slot?.id;
  const sameAsCurrent = chosen === mySlotId;

  return (
    <div className="book-page">
      <div className="center-page">
        <p className="eyebrow">The adventure</p>
        <BookCover book={book} className="cover-large" />
        <h1>{book.title}</h1>
        <p className="muted">{book.author} · {book.genre}{book.pageCount ? ` · ${book.pageCount} pages` : ''}</p>
        <p className="lead">{book.description}</p>
      </div>

      {!group ? (
        <section className="panel"><p>No reading group is open for this book yet. Check back soon.</p></section>
      ) : (
        <>
          <section className="panel" aria-labelledby="join-title">
            <h2 id="join-title">{membership ? "You're in this group" : 'Join this group'}</h2>
            <p className="muted">
              Led by {group.leader.name} · {group.totalWeeks} weeks · {group.sessionMinutes}-minute video meetings
            </p>

            <TimeSlotPicker
              slots={group.timeSlots}
              zone={zone}
              value={chosen}
              onChange={setChosen}
              mySlotId={mySlotId}
              disabled={busy}
            />

            <ErrorMessage message={error} />
            {message && <p className="notice" role="status">{message}</p>}

            <div className="join-actions">
              {!user && (
                <Link className="btn btn-primary" to="/login" state={{ from: location }}>
                  Log in to join
                </Link>
              )}

              {user && !membership && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy || !chosen}
                  onClick={() => act(() => bookingService.joinGroup(group.id, chosen), 'You joined the group. See you at the meeting!')}
                >
                  {busy ? 'Joining…' : 'Join this group'}
                </button>
              )}

              {user && membership && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || sameAsCurrent}
                    onClick={() => act(() => bookingService.switchSlot(membership.id, chosen), 'Your meeting time was changed.')}
                  >
                    Switch to this time
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm('Leave this reading group? Your seat will be given up.')) {
                        act(() => bookingService.leaveGroup(membership.id), 'You left the group.');
                      }
                    }}
                  >
                    Leave group
                  </button>
                  <Link className="btn" to="/dashboard">Go to my dashboard</Link>
                </>
              )}
            </div>
            {user && membership && (
              <p className="muted small">Your video meeting link is on your dashboard.</p>
            )}
          </section>

          <WeeklySchedule totalWeeks={group.totalWeeks} currentWeek={group.currentWeek} isMember={Boolean(membership)} />
          <ReadingHelp isMember={Boolean(membership)} />
        </>
      )}
    </div>
  );
}
