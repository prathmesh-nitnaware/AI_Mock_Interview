import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Zap, User } from 'lucide-react';
import '../../styles/layout.css'; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth(); // Get user from context for Avatar
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="neon-header glass-card">
      <div className="header-container">
        
        {/* 1. BRANDING: PREP AI */}
        <Link to="/" className="logo-area">
          <div className="logo-icon-wrapper">
            <Zap size={20} color="#fff" />
          </div>
          <span className="logo-text">Prep AI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/interview/setup" className={`nav-link ${isActive('/interview/setup') ? 'active' : ''}`}>Interview</Link>
          <Link to="/resume/upload" className={`nav-link ${isActive('/resume/upload') ? 'active' : ''}`}>Resume</Link>
          <Link to="/coding/setup" className={`nav-link ${isActive('/coding/setup') ? 'active' : ''}`}>Coding</Link>
        </nav>

        {/* 2. PROFILE AVATAR (Right Corner) */}
        <div className="header-right">
          <Link to="/profile" className="profile-avatar-btn" title="My Profile">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar-fallback">
                <User size={18} />
              </div>
            )}
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} color="white" /> : <Menu size={20} color="white" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="mobile-nav glass-card">
           <Link to="/dashboard" className="mobile-link">Dashboard</Link>
           <Link to="/interview/setup" className="mobile-link">Interview</Link>
           <Link to="/profile" className="mobile-link">Profile</Link>
        </div>
      )}
    </header>
  );
};

export default Header;