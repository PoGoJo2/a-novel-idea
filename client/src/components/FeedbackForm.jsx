import { useState } from 'react';
import { sendFeedback } from '../services/adminService.js';
import ErrorMessage from './ErrorMessage.jsx';

// Members can send the club a review or a complaint about a book or group.
export default function FeedbackForm({ bookId, groupId }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('review');
  const [rating, setRating] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await sendFeedback({ kind, message, rating: kind === 'review' ? rating : '', bookId, groupId });
      setSent(true); setMessage(''); setRating(''); setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2>Tell the club</h2>
      {sent && <p className="notice" role="status">Thank you. Your note went to the club administrator.</p>}
      {!open ? (
        <button type="button" className="btn" onClick={() => { setOpen(true); setSent(false); }}>Write a review or complaint</button>
      ) : (
        <form className="admin-form" onSubmit={submit}>
          <ErrorMessage message={error} />
          <div className="admin-row">
            <label className="field"><span>This is a</span>
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="review">Review</option><option value="complaint">Complaint</option><option value="other">Other</option>
              </select>
            </label>
            {kind === 'review' && (
              <label className="field"><span>Stars</span>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="">No rating</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            )}
          </div>
          <label className="field"><span>Your message</span><textarea rows={4} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} required /></label>
          <div>
            <button type="submit" className="btn btn-primary" disabled={busy || !message.trim()}>Send</button>{' '}
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}
