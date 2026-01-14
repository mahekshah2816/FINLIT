import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="nav-brand">
            💰 FinLit
          </Link>

          {isAuthenticated ? (
            <>
              <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                <li>
                  <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/transactions" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    Transactions
                  </Link>
                </li>
                <li>
                  <Link to="/add" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    Add Transaction
                  </Link>
                </li>
              </ul>

              <div className="nav-user">
                <button
                  className="btn btn-outline"
                  onClick={toggleUserMenu}
                  style={{ position: 'relative' }}
                >
                  <FiUser />
                  {user?.name}
                </button>

                {isUserMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '200px',
                    zIndex: 1000,
                    marginTop: '0.5rem'
                  }}>
                    <Link
                      to="/profile"
                      className="btn"
                      style={{
                        width: '100%',
                        borderRadius: '0',
                        borderBottom: '1px solid var(--border-color)',
                        justifyContent: 'flex-start'
                      }}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings />
                      Profile
                    </Link>
                    <button
                      className="btn btn-danger"
                      style={{
                        width: '100%',
                        borderRadius: '0',
                        justifyContent: 'flex-start'
                      }}
                      onClick={handleLogout}
                    >
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button className="mobile-menu-btn" onClick={toggleMenu}>
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </>
          ) : (
            <ul className="nav-menu">
              <li>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>

      <style>{`
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-primary);
          cursor: pointer;
        }

        .nav-user {
          position: relative;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }

          .nav-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--bg-primary);
            flex-direction: column;
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            border-top: 1px solid var(--border-color);
          }

          .nav-menu.active {
            display: flex;
          }

          .nav-menu li {
            margin: 0.5rem 0;
          }

          .nav-user {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
