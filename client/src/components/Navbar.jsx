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
        {user && <NavLink to="/library">My Library</NavLink>}
        {user && <NavLink to="/leaders">Meet the Leaders</NavLink>}
        {user && (user.role === 'leader' || user.role === 'admin') && <NavLink to="/leader">Leader tools</NavLink>}
        {user && user.role === 'admin' && <NavLink to="/admin" className="nav-admin">[ Administrator ]</NavLink>}
      </nav>
      <div className={`nav-actions${user ? ' is-user' : ''}`}>
        {user ? (
          <>
            <div className="nav-user-block">
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <ThemeToggle />
            </div>
            <button type="button" className="btn btn-nav" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <ThemeToggle />
            <Link className="btn btn-nav" to="/login">Log in</Link>
            <Link className="btn btn-nav-solid" to="/register">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
