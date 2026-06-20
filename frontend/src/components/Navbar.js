import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-train"></i> IRCTC
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-home"></i> Home
          </Link>
          <Link to="/pnr-status" className="nav-link" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-search"></i> PNR Status
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" className="nav-link" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-ticket-alt"></i> My Bookings
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-user"></i> {user?.name?.split(' ')[0]}
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-cog"></i> Admin
                </Link>
              )}
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link to="/register" className="nav-btn register-btn" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-user-plus"></i> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
