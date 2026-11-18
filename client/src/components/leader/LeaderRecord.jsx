import { useEffect, useState } from 'react';
import * as leader from '../../services/leaderService.js';
import BookCover from '../BookCover.jsx';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

const Stat = ({ label, value }) => (
  <div className="stat">
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

const dateText = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// My record: the classes I led all the way to the end
export default function LeaderRecord() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    leader.getRecord().then(setData).catch((err) => setError(err.message));
  }, []);

  if (!data && !error) return <Loader />;

  return (
    <section className="panel">
      <h2>Your leading record</h2>
      <ErrorMessage message={error} />
      {data && (
        <>
          <div className="stat-grid">
            <Stat label="Classes finished" value={data.totals.classes} />
            <Stat label="Readers guided" value={data.totals.readers} />
            <Stat label="Weeks led" value={data.totals.weeks} />
          </div>

          {data.classes.length === 0 ? (
            <p className="muted">Classes you finish will appear here. Open a class in its last week and choose “Mark class finished”.</p>
          ) : (
            <ul className="record-list">
              {data.classes.map((c) => (
                <li key={c.id} className="record-row">
                  <BookCover book={c.book} />
                  <div>
                    <strong className="tile-title">{c.book.title}</strong>
                    <div className="muted small">{c.book.author}</div>
                    <div className="muted small">Finished {dateText(c.finishedAt)} · {c.totalWeeks} weeks · {c.readers} reader{c.readers === 1 ? '' : 's'}</div>
                  </div>
                  <span className="finished-stamp">Finished ✔</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
