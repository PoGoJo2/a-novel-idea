import { useEffect, useState } from 'react';
import * as goalService from '../services/goalService.js';
import ErrorMessage from './ErrorMessage.jsx';

// The leader types the chapters to read each week, for example "Chapters 1-5", then "Chapters 6-11".
// Everyone sees them in the Weekly schedule, and this week's goal shows on the book card.
export default function GoalEditor({ groupId, totalWeeks }) {
  const [saved, setSaved] = useState({}); // what is stored: { 1: 'Chapters 1-5', ... }
  const [draft, setDraft] = useState({}); // what is typed in the boxes
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    goalService.getGoals(groupId)
      .then((data) => {
        if (cancelled) return;
        const map = {};
        data.goals.forEach((g) => { map[g.weekNumber] = g.chapters; });
        setSaved(map);
        setDraft(map);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => { cancelled = true; };
  }, [groupId]);

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const changed = weeks.filter((w) => (draft[w] || '').trim() !== (saved[w] || ''));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      for (const week of changed) {
        await goalService.saveGoal(groupId, week, (draft[week] || '').trim());
      }
      const next = { ...saved };
      changed.forEach((w) => { next[w] = (draft[w] || '').trim(); });
      setSaved(next);
      setMessage('Reading goals saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2>Weekly reading goals</h2>
      <p className="muted small">Type what the group should read each week, such as "Chapters 1-5". Members see it in the weekly schedule, and this week's goal shows on the book card.</p>
      <ErrorMessage message={error} />
      {message && <p className="notice" role="status">{message}</p>}
      <form onSubmit={save}>
        <ul className="goal-rows">
          {weeks.map((week) => (
            <li key={week} className="goal-row">
              <label htmlFor={`goal-${week}`}>Week {week}</label>
              <input
                id={`goal-${week}`}
                type="text"
                maxLength={60}
                placeholder={week === 1 ? 'Chapters 1-5' : week === 2 ? 'Chapters 6-11' : 'Chapters or pages'}
                value={draft[week] || ''}
                onChange={(e) => setDraft({ ...draft, [week]: e.target.value })}
              />
            </li>
          ))}
        </ul>
        <button type="submit" className="btn btn-primary" disabled={busy || changed.length === 0}>Save goals</button>
      </form>
    </section>
  );
}
