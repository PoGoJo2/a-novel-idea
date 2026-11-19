import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as profiles from '../services/profileService.js';
import { formatStart } from '../utils/startDate.js';
import LeaderAvatar from '../components/LeaderAvatar.jsx';
import BookCover from '../components/BookCover.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { slotsText } from '../components/leader/classTimes.js';

// One leader's own page: their profile and the complete list of classes they lead.
export default function LeaderDetailPage() {
  const { id } = useParams();
  const [leader, setLeader] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setLeader(null);
    profiles.getLeader(id).then((d) => setLeader(d.leader)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!leader) return <Loader text="Opening this leader's page..." />;

  return (
    <div className="leader-detail">
      <Link className="back-btn" to="/leaders"><span aria-hidden="true">←</span> Meet the Leaders</Link>

      <section className="ld-head panel">
        <LeaderAvatar name={leader.name} photo={leader.photo} />
        <div className="ld-about">
          <p className="eyebrow">Reading group leader</p>
          <h1>{leader.name}</h1>
          {leader.bio && <p className="lc-bio">{leader.bio}</p>}
          {leader.history && (<><h3>Background</h3><p>{leader.history}</p></>)}
          {leader.interests.length > 0 && (
            <>
              <h3>Book interests</h3>
              <div className="lc-tags ld-tags">{leader.interests.map((g) => <span key={g} className="tag">{g}</span>)}</div>
            </>
          )}
          {leader.favoriteReads && (<><h3>Favorite reads</h3><p className="lc-favs">{leader.favoriteReads}</p></>)}
        </div>
      </section>

      <section className="panel">
        <h2>
          Classes {leader.name} leads <small className="muted">{leader.classes.length}</small>
        </h2>
        {leader.finished > 0 && <p className="muted small">{leader.finished} class{leader.finished === 1 ? '' : 'es'} finished so far.</p>}
        {leader.classes.length === 0 ? (
          <p className="muted">Not leading a group right now.</p>
        ) : (
          <ul className="ld-classes">
            {leader.classes.map((c) => (
              <li key={c.id}>
                <Link to={`/books/${c.book.id}`} className="ld-class">
                  <BookCover book={c.book} />
                  <span>
                    <strong>{c.book.title}</strong>
                    <span className="muted small">{c.book.author}{c.book.genre ? ` · ${c.book.genre}` : ''}</span>
                    <span className="small">{slotsText(c.timeSlots)}</span>
                    <span className="start-date small">
                      {c.currentWeek >= 1 ? `Week ${c.currentWeek} of ${c.totalWeeks}` : `Starts ${formatStart(c.startDate).text}`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
