import { useEffect, useState } from 'react';
import * as admin from '../../services/adminService.js';
import { formatStart } from '../../utils/startDate.js';
import BookCover from '../BookCover.jsx';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';
import { slotsText } from '../leader/classTimes.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHOW = 3; // classes shown before "Show all"

// One tile per leader: totals, how full each day is, and the classes they lead now.
function LeaderTile({ leader }) {
  const [all, setAll] = useState(false);
  const classes = all ? leader.classes : leader.classes.slice(0, SHOW);
  const stat = (value, label) => (
    <div className="lt-stat"><strong>{value}</strong><span>{label}</span></div>
  );

  return (
    <article className="leader-tile">
      <header className="lt-who">
        <span className="lt-avatar" aria-hidden="true">{leader.name.charAt(0).toUpperCase()}</span>
        <div>
          <strong>{leader.name}</strong>
          <div className="muted small">{leader.email}</div>
        </div>
      </header>

      <div className="lt-stats">
        {stat(leader.leading, 'Leading')}
        {stat(leader.finished, 'Finished')}
        {stat(leader.readers, 'Readers')}
        {stat(leader.requests, 'Requests')}
      </div>

      <div className="lt-days" aria-label={`Classes per day, limit ${leader.maxPerDay}`}>
        {leader.perDay.map((n, d) => (
          <div key={d} className={`lt-day${n >= leader.maxPerDay ? ' full' : n > 0 ? ' some' : ''}`} title={`${n} of ${leader.maxPerDay} on ${DAYS[d]}`}>
            <span>{DAYS[d]}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>

      {leader.problems?.length > 0 && (
        <div className="lt-problems" role="alert">
          <strong>{leader.problems.length} scheduling conflict{leader.problems.length === 1 ? '' : 's'}</strong>
          <ul>{leader.problems.slice(0, 3).map((p) => <li key={p}>{p}</li>)}</ul>
          {leader.problems.length > 3 && <span className="small">…and {leader.problems.length - 3} more. Run the fix-up script or change these on the Groups tab.</span>}
        </div>
      )}

      {leader.classes.length === 0 ? (
        <p className="muted small">Not leading any classes right now.</p>
      ) : (
        <ul className="lt-classes">
          {classes.map((c) => (
            <li key={c.id}>
              <BookCover book={c.book} />
              <span>
                <strong>{c.book.title}</strong>
                <span className="muted small">
                  {slotsText(c.timeSlots)} · {c.currentWeek >= 1 ? `week ${c.currentWeek} of ${c.totalWeeks}` : `starts ${formatStart(c.startDate).text}`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {leader.classes.length > SHOW && (
        <button type="button" className="link-button small" onClick={() => setAll((v) => !v)}>
          {all ? 'Show fewer' : `Show all ${leader.classes.length}`}
        </button>
      )}
    </article>
  );
}

// Administrator → Leaders tab
export default function AdminLeaders() {
  const [leaders, setLeaders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.getLeaders().then((d) => setLeaders(d.leaders)).catch((err) => setError(err.message));
  }, []);

  if (!leaders && !error) return <Loader />;

  return (
    <section className="panel">
      <h2>Leaders</h2>
      <p className="muted small">Each leader can lead up to 3 classes a day, and never two whose meeting times overlap. Sorted A to Z.</p>
      <ErrorMessage message={error} />
      {leaders && leaders.length === 0 && <p className="muted">No leaders yet. Make someone a leader on the People tab.</p>}
      <div className="leader-tiles">
        {(leaders || []).map((l) => <LeaderTile key={l.id} leader={l} />)}
      </div>
      <p className="muted small lt-key">Day boxes show how many class meetings the leader has that day. Light green means there's room; red means the day is full.</p>
    </section>
  );
}
