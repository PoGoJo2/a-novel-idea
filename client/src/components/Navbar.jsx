import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="nav">
      <Link to="/" aria-label="A Novel Idea, home" className="nav-logo">
        <Logo />
      </Link>
      <nav className="nav-links" aria-label="Main">
        <NavLink to="/" end>Browse</NavLink>
        {user && <NavLink to="/dashboard">My Meetings</NavLink>}
      </nav>
      <div className="nav-actions">
        <ThemeToggle />
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
            <button type="button" className="btn btn-nav" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link className="btn btn-nav" to="/login">Log in</Link>
            <Link className="btn btn-nav-solid" to="/register">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
