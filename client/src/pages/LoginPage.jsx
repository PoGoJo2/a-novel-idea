import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({ message: '', details: [] });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError({ message: '', details: [] });
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
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
        <h1>Welcome back</h1>
        <p className="muted">Log in to join a group and see your meetings.</p>
        <form onSubmit={handleSubmit} noValidate>
          <ErrorMessage message={error.message} details={error.details} />
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={update('email')} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-row">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={update('password')} />
              <button type="button" className="btn" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <hr className="rule" />
        <p className="muted center-text">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </AuthLayout>
  );
}
