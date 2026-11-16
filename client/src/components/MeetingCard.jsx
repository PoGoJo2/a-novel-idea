import { Link } from 'react-router-dom';
import BookCover from './BookCover.jsx';
import { bookStyle, slotLabel, meetingDateTime } from '../utils/time.js';

// One of the reader's groups: cover, progress through the book, their meeting time, and the video link.
export default function MeetingCard({ membership, zone }) {
  const { group, slot, nextMeetingUtc } = membership;
  const progress = Math.round((Math.min(group.currentWeek, group.totalWeeks) / group.totalWeeks) * 100);
  const next = meetingDateTime(nextMeetingUtc, zone);

  return (
    <article className="my-group bx" style={bookStyle(group.book)}>
      <span className="ribbon" aria-hidden="true" />
      <div className="my-cover">
        <BookCover book={group.book} />
      </div>
      <div className="my-info">
        <h3>{group.book.title}</h3>
        <p className="muted">{group.book.author} · led by {group.leader.name}</p>

        <div className="progress" role="img" aria-label={`Week ${group.currentWeek} of ${group.totalWeeks}`}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="muted small">Week {group.currentWeek} of {group.totalWeeks}</p>

        {slot && (
          <p>
            <span className="tag tag-day">Your time: {slotLabel(slot, zone)}</span>
          </p>
        )}
        <p className="small">{next ? `Next meeting: ${next}` : 'Next meeting date will appear soon.'}</p>

        <div className="join-actions">
          {slot?.meetingLink ? (
            <a className="btn btn-primary" href={slot.meetingLink} target="_blank" rel="noopener noreferrer">
              Open video meeting
            </a>
          ) : (
            <button type="button" className="btn" disabled>Video link coming soon</button>
          )}
          <Link className="btn" to={`/books/${group.book.id}`}>Book page &amp; change time</Link>
        </div>
      </div>
    </article>
  );
}
