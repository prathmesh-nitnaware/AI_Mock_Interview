import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Edit2, Save, X, Camera, Award, Shield, Zap, Activity, User } from 'lucide-react';
import '../styles/theme.css';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ interviews: 0, avgScore: 0 });
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Developer',
    email: user?.email || '',
    role: user?.role || 'Software Engineer',
    bio: 'Passionate developer preparing for big tech interviews. Focused on scalable systems and clean frontend architecture.'
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const data = await api.getDashboard(user.id);
        if (data) {
          const totalInterviews = data.interview_scores ? data.interview_scores.length : 0;
          const avg = data.interview_scores?.length 
            ? Math.round(data.interview_scores.reduce((a, b) => a + b, 0) / totalInterviews) 
            : 0;
          
          setStats({ interviews: totalInterviews, avgScore: avg });
        }
      } catch (err) {
        console.error("Error loading profile stats", err);
      }
    };
    fetchStats();
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic for updating user profile via API would go here
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-root page-container fade-in">
      
      {/* Background Ambience */}
      <div className="ambient-glow-profile"></div>

      <div className="profile-content-wrapper">
        
        {/* --- HEADER PANEL --- */}
        <div className="card-editorial profile-header-panel mb-8">
          <div className="profile-header-left">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="profile-img-fill" />
                ) : (
                  <User size={40} strokeWidth={1.5} />
                )}
              </div>
              <button className="edit-avatar-btn" title="Change Avatar">
                <Camera size={14} />
              </button>
            </div>
            
            <div className="profile-titles">
              <h1 className="text-editorial-h1" style={{ fontSize: '2.5rem', textTransform: 'none' }}>
                {formData.name}
              </h1>
              <div className="profile-badges mt-2">
                <span className="brand-pill">{formData.role}</span>
                <span className="brand-pill pro-tag" style={{ background: 'rgba(255,215,0,0.1)', color: '#ffd700', borderColor: 'rgba(255,215,0,0.2)' }}>
                  <Shield size={12}/> PRO MEMBER
                </span>
              </div>
            </div>
          </div>

          <div className="profile-header-right">
            <div className="mini-stat glass-panel">
              <Activity size={18} className="text-indigo" />
              <div className="stat-data">
                <span className="ms-val">{stats.interviews}</span>
                <span className="ms-label">SESSIONS</span>
              </div>
            </div>
            <div className="mini-stat glass-panel">
              <Zap size={18} className="text-blue" />
              <div className="stat-data">
                <span className="ms-val">{stats.avgScore}%</span>
                <span className="ms-label">AVG SCORE</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="profile-grid">
          
          {/* LEFT: Personal Details Form */}
          <div className="card-editorial profile-form-panel">
            <div className="card-header">
              <h3 className="card-title">Personal Details</h3>
              {!isEditing ? (
                <button className="btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} /> EDIT
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
                    <X size={16} />
                  </button>
                  <button className="btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                    {loading ? "..." : <Save size={16} />}
                  </button>
                </div>
              )}
            </div>

            <form className="details-form mt-4">
              <div className="input-wrapper">
                <label className="input-label">Full Name</label>
                <input 
                  className="neon-input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Email Address</label>
                <input 
                  className="neon-input" 
                  value={formData.email} 
                  disabled // Email usually locked for security
                  style={{ opacity: 0.6 }}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Target Role</label>
                <input 
                  className="neon-input"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Professional Bio</label>
                <textarea 
                  className="neon-input" 
                  name="bio"
                  rows="4"
                  style={{ minHeight: '120px', resize: 'none' }}
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </form>
          </div>

          {/* RIGHT: Achievements */}
          <div className="card-editorial profile-badges-panel">
            <div className="card-header">
              <h3 className="card-title">Achievements</h3>
            </div>
            
            <div className="badges-list mt-6">
              <div className="badge-item glass-panel active">
                <div className="icon-glow-circle" style={{ width: '45px', height: '45px' }}>
                  <Award size={20} />
                </div>
                <div className="badge-text ml-4">
                  <h4 className="text-white font-bold">Early Adopter</h4>
                  <p className="text-muted text-xs">Member since Alpha v1.0</p>
                </div>
              </div>

              <div className="badge-item glass-panel active mt-4">
                <div className="icon-glow-circle" style={{ width: '45px', height: '45px', color: '#60a5fa' }}>
                  <Zap size={20} />
                </div>
                <div className="badge-text ml-4">
                  <h4 className="text-white font-bold">Fast Learner</h4>
                  <p className="text-muted text-xs">Completed 3 sessions this week</p>
                </div>
              </div>

              <div className="badge-item glass-panel locked mt-4" style={{ opacity: 0.5 }}>
                <div className="icon-glow-circle" style={{ width: '45px', height: '45px', background: 'transparent' }}>
                  <Shield size={20} className="text-muted" />
                </div>
                <div className="badge-text ml-4">
                  <h4 className="text-muted font-bold">Interview Master</h4>
                  <p className="text-muted text-xs">Unlock at 5 total sessions</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;