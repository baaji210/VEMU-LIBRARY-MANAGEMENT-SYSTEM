import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <div className="nav-gem">V</div>
          <div className="nav-brand-text">
            <span className="brand-title">VEMU Library</span>
            <span className="brand-sub">Institute of Technology</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <a href="#features" className="nav-link">Features</a>
          <a href="#catalogue" className="nav-link">Catalogue</a>
          <a href="#about" className="nav-link">About</a>
        </div>

        <div className="nav-btns">
          {user ? (
            <div className="nav-user">
              <Link to={`/${user.role}`} className="btn-dash">Dashboard</Link>
              <button onClick={logout} className="btn-logout">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-signin">Sign In</Link>
              <Link to="/register" className="btn-primary">Register Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
