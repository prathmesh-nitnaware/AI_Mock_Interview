import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  Terminal, 
  User, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/layout.css'; 

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to check active routes for glowing state
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'ATS Optimizer', path: '/resume/upload', icon: <FileText size={20} /> },
    { name: 'Mock Interview', path: '/interview/setup', icon: <Mic size={20} /> },
    { name: 'Coding Dojo', path: '/coding/setup', icon: <Terminal size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="app-layout">
      
      {/* --- TOP HEADER --- */}
      <header className="glass-header">
        <div className="header-left">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/dashboard" className="brand-logo">
             <div className="brand-icon-glow"><Sparkles size={16} /></div>
             <span>PREP AI</span>
          </Link>
        </div>

        <div className="header-right">
          <div className="user-profile-trigger" onClick={() => navigate('/profile')}>
            <span className="user-name hidden-mobile">{user?.name || 'Developer'}</span>
            <div className="avatar-circle">
               {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>
        </div>
      </header>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`glass-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-text">{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <span className="link-icon"><LogOut size={20} /></span>
            <span className="link-text">Secure Log Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="main-content-area">
        {/* Mobile overlay to close menu when clicking outside */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}
        
        {/* Outlet renders the current nested route (Dashboard, Profile, etc.) */}
        <Outlet /> 
      </main>

    </div>
  );
};

export default Layout;