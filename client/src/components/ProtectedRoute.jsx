import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

// Wrap a page in this to require a login. Visitors are sent to /login and,
// after logging in, returned to the page they wanted.
// Optional: roles={['admin']} also limits the page to those roles.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <p className="empty">This page is for {roles.join(' or ')}s only.</p>;
  return children;
}
