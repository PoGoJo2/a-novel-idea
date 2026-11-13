import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const timezone = DateTime.local().zoneName; // detected from the browser
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({ message: '', details: [] });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError({ message: '', details: [] });

    // Quick checks in the browser; the server checks everything again
    if (form.password.length < 8) return setError({ message: 'Password must be at least 8 characters', details: [] });
    if (form.password !== form.confirm) return setError({ message: 'The passwords do not match', details: [] });

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, timezone });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError({ message: err.message, details: err.errors || [] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card bx">
        <span className="ribbon" aria-hidden="true" style={{ '--ribbon': '#b8934a' }} />
        <h1>Create your account</h1>
        <p className="muted">Join a book group in a few minutes.</p>
        <form onSubmit={handleSubmit} noValidate>
          <ErrorMessage message={error.message} details={error.details} />
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" autoComplete="name" required value={form.name} onChange={update('name')} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={update('email')} />
          </div>
          <div className="field">
            <label htmlFor="password">Password (at least 8 characters)</label>
            <div className="input-row">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={form.password} onChange={update('password')} />
              <button type="button" className="btn" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={form.confirm} onChange={update('confirm')} />
          </div>
          <p className="muted small">Meeting times will be shown in your time zone: {timezone}</p>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <hr className="rule" />
        <p className="muted center-text">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </AuthLayout>
  );
}
