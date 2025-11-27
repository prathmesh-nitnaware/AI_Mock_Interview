import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { useDarkMode } from '../App';

const Landing = () => {
  const authenticated = isAuthenticated();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>MockAi-Interview</h2>
        </div>
        <div className="nav-links">
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {authenticated ? (
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Rest of the Landing component remains the same */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 AI-Powered Interview Platform</span>
          </div>
          <h1>Ace Your Interviews with AI-Powered Mock Sessions</h1>
          <p>Practice with intelligent AI interviews, get instant feedback, and upload your resume for personalized career guidance. Boost your confidence and land your dream job.</p>
          <div className="hero-buttons">
            {!authenticated && (
              <>
                <Link to="/signup" className="btn-hero-primary">
                  <span className="btn-icon">🎯</span>
                  Start Free Trial
                  <span className="btn-arrow">→</span>
                </Link>
                <Link to="/login" className="btn-hero-secondary">
                  <span className="btn-icon">👨‍💼</span>
                  Watch Demo
                </Link>
              </>
            )}
            {authenticated && (
              <Link to="/dashboard" className="btn-hero-primary">
                <span className="btn-icon">🚀</span>
                Go to Interviews
                <span className="btn-arrow">→</span>
              </Link>
            )}
          </div>
          <div className="hero-features">
            <div className="feature-tag">
              <span className="check-icon">✅</span>
              AI-Powered Feedback
            </div>
            <div className="feature-tag">
              <span className="check-icon">✅</span>
              Real-time Analysis
            </div>
            <div className="feature-tag">
              <span className="check-icon">✅</span>
              Resume Integration
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="ai-interview-visual">
            <div className="floating-card card-1">
              <div className="card-icon">🤖</div>
              <h4>AI Interviewer</h4>
              <p>Smart questioning</p>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">📊</div>
              <h4>Live Analysis</h4>
              <p>Real-time feedback</p>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🎯</div>
              <h4>Progress Track</h4>
              <p>Performance metrics</p>
            </div>
            <div className="main-illustration">
              <div className="ai-avatar">
                <div className="avatar-face">
                  <div className="avatar-eyes"></div>
                  <div className="avatar-mouth"></div>
                </div>
              </div>
              <div className="speech-bubble">
                "Tell me about yourself and your experience..."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose MockAi-Interview?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Interviews</h3>
              <p>Practice with realistic AI interviewers that adapt to your responses and provide instant feedback.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Performance Analytics</h3>
              <p>Get detailed insights into your interview performance with comprehensive analytics and scores.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Resume Analysis</h3>
              <p>Upload your resume and get personalized interview questions based on your experience and skills.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Coaching</h3>
              <p>Receive tailored recommendations to improve your interview skills and confidence.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Flexible Practice</h3>
              <p>Practice anytime, anywhere with our 24/7 available AI interview platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your improvement over time with detailed progress reports and history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="features-section stats-section">
        <div className="container">
          <div className="interview-stats">
            <div className="stat-box">
              <h4>Practice Sessions</h4>
              <p>10K+</p>
            </div>
            <div className="stat-box">
              <h4>Success Rate</h4>
              <p>89%</p>
            </div>
            <div className="stat-box">
              <h4>Users Helped</h4>
              <p>5K+</p>
            </div>
            <div className="stat-box">
              <h4>Avg. Improvement</h4>
              <p>42%</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Master Your Interview Skills?</h2>
          <p>Join thousands of job seekers who have transformed their interview performance with MockAi-Interview.</p>
          {!authenticated && (
            <Link to="/signup" className="btn-hero-primary large">
              <span className="btn-icon">🚀</span>
              Start Your Journey Now
              <span className="btn-arrow">→</span>
            </Link>
          )}
          {authenticated && (
            <Link to="/dashboard" className="btn-hero-primary large">
              <span className="btn-icon">🎯</span>
              Continue Practicing
              <span className="btn-arrow">→</span>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 MockAi-Interview. All rights reserved. Transform your career with AI-powered interview practice.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;