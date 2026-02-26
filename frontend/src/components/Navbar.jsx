import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import "./components.css"; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detect scroll to add solid background/glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="icon-glow-circle" style={{ width: '36px', height: '36px', marginBottom: 0 }}>
              <Sparkles size={18} />
            </div>
            <span className="logo-text">PREP AI</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links desktop-only">
            <Link to="/" className="nav-link">Features</Link>
            <Link to="/login" className="nav-link">Secure Log In</Link>
            <Link to="/signup">
              <button className="btn btn-primary btn-sm">Get Started</button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-link">Features</Link>
          <Link to="/login" className="mobile-link">Secure Log In</Link>
          <Link to="/signup" className="mobile-link highlight">Get Started</Link>
        </div>
      </nav>

      {/* Mobile Menu Overlay (Darkens background when open) */}
      {isMobileMenuOpen && (
        <div 
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(4px)', zIndex: 999 
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;