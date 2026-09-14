import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
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

  // ✅ HIDE NAVBAR FOR ADMIN AND FARMER
  if (isAuthenticated && (user?.role === 'admin' || user?.role === 'farmer')) {
    return null;
  }

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

        {/* Navigation Links — ONLY FOR BUYERS AND PUBLIC */}
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
              {/* Buyer links only */}
              {user?.role === 'buyer' && (
                <>
                  <Link to="/my-orders" className="nav-link" onClick={closeMenu}>
                    My Orders
                  </Link>
                </>
              )}

              {/* Profile circle with tooltip */}
              <div className="user-avatar-wrapper">
                <Link to="/profile" className="user-avatar-link">
                  <div className="user-avatar">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                </Link>
                <span className="user-tooltip">
                  {user?.fullName || 'User'}
                </span>
              </div>

              {/* Cart icon (Buyer only) */}
              {user?.role === 'buyer' && (
                <Link to="/cart" className="nav-link nav-link-cart" onClick={closeMenu}>
                  <FaShoppingCart size={20} />
                </Link>
              )}

              {/* Logout icon */}
              <button onClick={handleLogout} className="nav-link nav-link-logout" aria-label="Logout">
                <FiLogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}