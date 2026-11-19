import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as admin from '../../services/adminService.js';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

// A readable temporary password, for example "Book-4821-Tea"
const WORDS = ['Book', 'Page', 'Tea', 'Quill', 'Shelf', 'Novel', 'Story', 'Ink', 'Lamp', 'Chapter'];
const tempPassword = () => {
  const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
  return `${pick()}-${1000 + Math.floor(Math.random() * 9000)}-${pick()}`;
};

// People: make someone a leader, reset a forgotten password, or remove a disruptive client.
export default function AdminPeople() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback((text = '') => {
    admin.getUsers(text ? `?q=${encodeURIComponent(text)}` : '').then((d) => setUsers(d.users)).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (action, done) => {
    setBusy(true); setError(''); setMessage('');
    try { await action(); setMessage(done); load(q); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <section className="panel">
      <h2>People</h2>
      <p className="muted small">Set someone's role to Leader before assigning them to a group. People who asked for a new password are listed first: use Reset password to give them a temporary one. Removing a client signs them out for good, cancels their seats and blocks their login. You can restore them later.</p>
      <ErrorMessage message={error} />
      {message && <p className="notice admin-message" role="status">{message}</p>}
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); load(q); }}>
        <label className="field"><span>Search by name or email</span><input value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <button type="submit" className="btn btn-small">Search</button>
      </form>
      {!users && !error && <Loader />}
      <ul className="admin-list">
        {(users || []).map((u) => {
          const self = String(u.id) === String(me?.id);
          return (
            <li key={u.id} className={`admin-item${u.suspended ? ' is-retired' : ''}`}>
              <div className="admin-item-head">
                <div>
                  <strong>{u.name}</strong>{u.suspended && <span className="tag">removed</span>}
                  {u.resetRequestedAt && <span className="tag tag-reset">asked for a new password</span>}
                  {!u.resetRequestedAt && u.mustChangePassword && <span className="tag tag-temp">temporary password</span>}
                  <div className="muted small">{u.email}</div>
                </div>
                <div className="admin-actions">
                  <label className="field compact"><span className="sr-only">Role</span>
                    <select value={u.role} disabled={busy || self} onChange={(e) => run(() => admin.setRole(u.id, e.target.value), `${u.name} is now a ${e.target.value}.`)}>
                      <option value="member">Member</option><option value="leader">Leader</option><option value="admin">Administrator</option>
                    </select>
                  </label>
                  {!self && (
                    <button
                      type="button"
                      className={`btn btn-small${u.resetRequestedAt ? ' btn-primary' : ''}`}
                      disabled={busy}
                      onClick={() => {
                        const temp = window.prompt(
                          `Give ${u.name} a temporary password (at least 8 characters). They will choose their own the next time they log in.`,
                          tempPassword()
                        );
                        if (temp === null) return undefined;
                        return run(() => admin.resetPassword(u.id, temp.trim()), `${u.name}'s temporary password is: ${temp.trim()}\nGive it to them privately. They will be asked to choose their own when they log in.`);
                      }}
                    >
                      Reset password
                    </button>
                  )}
                  {!self && u.role !== 'admin' && (
                    <button
                      type="button"
                      className="btn btn-small"
                      disabled={busy}
                      onClick={() => {
                        if (u.suspended) return run(() => admin.suspendUser(u.id, false), `${u.name} was restored.`);
                        const reason = window.prompt(`Remove ${u.name}? Type a short reason (optional) and press OK.`);
                        if (reason === null) return undefined;
                        return run(() => admin.suspendUser(u.id, true, reason), `${u.name} was removed.`);
                      }}
                    >
                      {u.suspended ? 'Restore' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
              {u.suspended && u.suspendedReason && <div className="muted small">Reason: {u.suspendedReason}</div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
