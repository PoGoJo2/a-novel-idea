import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { forgotPassword } from '../services/authService.js';

// "Forgot your password?" The request goes to the administrator, who sets a temporary password.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState({ message: '', details: [] });
  const [sent, setSent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError({ message: '', details: [] });
    setSubmitting(true);
    try {
      const data = await forgotPassword(email);
      setSent(data.message);
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
        <h1>Forgot your password?</h1>
        {sent ? (
          <p className="notice" role="status">{sent}</p>
        ) : (
          <>
            <p className="muted">Type the email you signed up with. An administrator will set a temporary password for you, and you&apos;ll choose your own the next time you log in.</p>
            <form onSubmit={handleSubmit} noValidate>
              <ErrorMessage message={error.message} details={error.details} />
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Ask for a new password'}
              </button>
            </form>
          </>
        )}
        <hr className="rule" />
        <p className="muted center-text">Remembered it? <Link to="/login">Back to log in</Link></p>
      </div>
    </AuthLayout>
  );
}
