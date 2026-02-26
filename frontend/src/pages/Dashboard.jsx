import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Added this
import { api } from '../services/api';
import { Play, UploadCloud, Terminal, ArrowUpRight, Loader2, Inbox, Sparkles } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth(); // Get real user data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      try {
        // We use the dynamic API_URL logic from your services
        const dashRes = await api.getDashboard(user.id);
        setDashboardData(dashRes);
      } catch (err) { 
        console.error("Dashboard Sync Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="neon-spinner-large"></div>
        <p className="loading-text">Syncing Workspace...</p>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || "DEVELOPER";
  const recentActivity = dashboardData?.recent_activity || [];

  return (
    <div className="page-container dashboard-page fade-in">
      <div className="dashboard-content">
        
        {/* HEADER SECTION */}
        <section className="profile-header-section">
            <div className="profile-text">
                <div className="brand-pill mb-2">
                   <Sparkles size={14} className="text-indigo" />
                   <span>{user?.role || "Software Engineer"}</span>
                </div>
                <h1 className="welcome-title">HELLO, {firstName}</h1>
                <p className="text-muted">Ready for your next career milestone?</p>
            </div>
            
            <div className="stats-mini-grid">
                <div className="mini-stat glass-panel">
                    <span className="ms-val">{dashboardData?.stats?.total_interviews || "0"}</span>
                    <span className="ms-label">SESSIONS</span>
                </div>
                <div className="mini-stat glass-panel">
                    <span className="ms-val">{dashboardData?.stats?.average_score || "0"}</span>
                    <span className="ms-label">AVG SCORE</span>
                </div>
            </div>
        </section>

        {/* MAIN ACTION TILES */}
        <section className="main-actions-grid">
            <Link to="/interview/setup" className="card-editorial card-interactive primary-action">
                <div className="icon-box bg-indigo-glow"><Play size={28} /></div>
                <div>
                  <h3>Start Interview</h3>
                  <p>Voice-based AI Simulation</p>
                </div>
            </Link>

            <Link to="/resume/upload" className="card-editorial card-interactive">
                <div className="icon-box"><UploadCloud size={28} /></div>
                <div>
                  <h3>Resume Scan</h3>
                  <p>ATS Optimization</p>
                </div>
            </Link>

            <Link to="/coding/setup" className="card-editorial card-interactive">
                <div className="icon-box"><Terminal size={28} /></div>
                <div>
                  <h3>Coding Dojo</h3>
                  <p>Algorithm Practice</p>
                </div>
            </Link>
        </section>

        {/* RECENT ACTIVITY TABLE */}
        <section className="recent-section mt-8">
            <h3 className="text-editorial-sub mb-4">RECENT ACTIVITY</h3>
            <div className="activity-list-container glass-panel">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item, i) => (
                      <div key={i} className="activity-row">
                          <div className="act-info">
                              <span className="act-role">{item.role || "Technical Interview"}</span>
                              <span className="act-date">{item.date || "Recently"}</span>
                          </div>
                          <div className="act-score-wrapper">
                              <div className="act-score-pill">{item.score || "--"}</div>
                              <ArrowUpRight size={18} className="text-muted" />
                          </div>
                      </div>
                  ))
                ) : (
                  <div className="empty-state p-12">
                    <Inbox size={40} className="text-muted mb-4" />
                    <p>No recent sessions found.</p>
                  </div>
                )}
            </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;