import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { DeskSides, DeskBottom } from '../components/DeskFrame.jsx';

const ROLE_NAMES = { member: 'Member', leader: 'Leader', admin: 'Administrator' };

// My account: who is signed in, and a form to change the password.
export default function AccountPage() {
  const { user, changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState({ message: '', details: [] });
  const [done, setDone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const mustChange = user.mustChangePassword;

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError({ message: '', details: [] });
    setDone('');
    if (form.newPassword !== form.confirm) {
      setError({ message: 'The two new passwords do not match', details: [] });
      return;
    }
    setSubmitting(true);
    try {
      const data = await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      // After replacing a temporary password, carry on to the person's meetings
      if (mustChange) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setDone(`${data.message} You stay logged in here; any other device will need to log in again.`);
    } catch (err) {
      setError({ message: err.message, details: err.errors || [] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard account-page">
      <DeskSides set="account" />
      <p className="eyebrow">My account</p>
      <h1>Hi, {user.name.split(' ')[0]}</h1>
      <hr className="rule" />

      {mustChange && (
        <p className="goal-warning" role="alert">
          An administrator gave you a temporary password. Please choose your own password below before you continue.
        </p>
      )}

      <section className="panel account-details">
        <h2>Your details</h2>
        <dl>
          <dt>Name</dt><dd>{user.name}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Role</dt><dd>{ROLE_NAMES[user.role] || user.role}</dd>
          <dt>Time zone</dt><dd>{user.timezone}</dd>
        </dl>
      </section>

      <section className="panel">
        <h2>Change password</h2>
        <form onSubmit={handleSubmit} noValidate className="account-form">
          <ErrorMessage message={error.message} details={error.details} />
          {done && <p className="notice" role="status">{done}</p>}
          <div className="field">
            <label htmlFor="currentPassword">{mustChange ? 'Temporary password' : 'Current password'}</label>
            <input id="currentPassword" type={show ? 'text' : 'password'} autoComplete="current-password" required value={form.currentPassword} onChange={update('currentPassword')} />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password (at least 8 characters)</label>
            <input id="newPassword" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={form.newPassword} onChange={update('newPassword')} />
          </div>
          <div className="field">
            <label htmlFor="confirm">Type the new password again</label>
            <input id="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" required value={form.confirm} onChange={update('confirm')} />
          </div>
          <label className="show-row">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
          </label>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Change password'}
          </button>
        </form>
      </section>
      <DeskBottom set="account" />
    </div>
  );
}
