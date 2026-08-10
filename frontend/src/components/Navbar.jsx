import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <Logo size="md" />
        </Link>

        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/products" className="nav-link" onClick={closeMenu}>Products</Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link nav-link-login" onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/register" className="nav-link nav-link-register" onClick={closeMenu}>
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Role-based dashboard links */}
              {user?.role === 'farmer' && (
                <Link to="/farmer/dashboard" className="nav-link" onClick={closeMenu}>
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>
                  Admin
                </Link>
              )}
              {user?.role === 'buyer' && (
                <Link to="/marketplace" className="nav-link" onClick={closeMenu}>
                  Marketplace
                </Link>
              )}

              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                Profile
              </Link>

              <button onClick={handleLogout} className="nav-link nav-link-logout">
                Logout
              </button>

              {/* User avatar */}
              <div className="user-avatar">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}