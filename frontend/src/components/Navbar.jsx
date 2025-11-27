import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeToken, getToken } from '../utils/auth';
import { useDarkMode } from '../App';

const Navbar = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  // Get user info from token
  const getUserInfo = () => {
    const token = getToken();
    if (token && token.startsWith('mock_jwt_token')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      } catch {
        return null;
      }
    }
    return null;
  };

  const userInfo = getUserInfo();

  return (
    <nav className="dashboard-navbar">
      <div className="nav-brand">
        <h2>MockAi-Interview</h2>
      </div>
      <div className="nav-menu">
        {userInfo && (
          <span className="welcome-text">
            Welcome, {userInfo.name}!
          </span>
        )}
        <button 
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <Link to="/dashboard" className="nav-item active">Dashboard</Link>
        <button className="nav-item">Interviews</button>
        <button className="nav-item">Analytics</button>
        <button className="nav-item">Settings</button>
        <button className="nav-item" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;