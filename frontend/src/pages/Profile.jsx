import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Edit2,
  Save,
  X,
  Camera,
  Award,
  Shield,
  Zap,
  Activity,
  User,
  Mail,
  Briefcase,
  FileText,
  Upload,
  CheckCircle,
  Loader2,
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeName, setResumeName] = useState(user?.resume_filename || null);
  const [stats, setStats] = useState({ interviews: 0, avgScore: 0 });

  const [formData, setFormData] = useState({
    name: user?.name || "Prathmesh Nitnaware",
    email: user?.email || "prathmesh.nitnaware@gmail.com",
    role: user?.role || "ML Engineer",
    bio: "Pursuing B.Tech in Computer Engineering. Focused on full-stack development, machine learning, and computer vision.",
  });

  // UNIFIED FETCHING LOGIC: Syncs with MongoDB History
  useEffect(() => {
    const fetchSyncStats = async () => {
      if (!user) return;
      try {
        const res = await api.client.get("/api/interview/history");
        const historyData = res.data || [];

        if (historyData.length > 0) {
          const total = historyData.length;
          const avg = Math.round(
            historyData.reduce(
              (acc, curr) => acc + (curr.overall_score || 0),
              0,
            ) / total,
          );
          setStats({ interviews: total, avgScore: avg });
        }
      } catch (err) {
        console.error("Profile Stats Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSyncStats();
  }, [user]);

  // RESUME UPLOAD LOGIC: Stores in MongoDB for reuse in Mock Interview/ATS
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("resume", file);

    try {
      // Endpoint to save resume context to user document in DB
      await api.client.post("/api/profile/resume/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeName(file.name);
    } catch (err) {
      alert("Resume upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic for profile update would go here
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader-ring"></div>
      </div>
    );

  return (
    <div className="profile-root fade-in">
      <div className="ambient-glow-profile"></div>

      <div className="profile-content-wrapper">
        {/* --- HEADER PANEL --- */}
        <div className="glass-panel profile-header-panel">
          <div className="profile-header-left">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                <User size={40} strokeWidth={1.5} />
              </div>
              <button className="edit-avatar-btn">
                <Camera size={14} />
              </button>
            </div>

            <div className="profile-titles">
              <h1 className="profile-name">{formData.name}</h1>
              <div className="profile-badges">
                <span className="brand-pill">{formData.role}</span>
                <span className="pro-tag">
                  <Shield size={12} /> PRO MEMBER
                </span>
              </div>
            </div>
          </div>

          <div className="profile-header-right">
            <div className="stat-glass-pill">
              <Activity size={18} className="text-indigo" />
              <div className="stat-data">
                <span className="stat-val">{stats.interviews}</span>
                <span className="stat-lbl">SESSIONS</span>
              </div>
            </div>
            <div className="stat-glass-pill">
              <Zap size={18} className="text-blue" />
              <div className="stat-data">
                <span className="stat-val">{stats.avgScore}%</span>
                <span className="stat-lbl">AVG SCORE</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="profile-grid">
          {/* LEFT: Personal Details */}
          <div className="glass-panel">
            <div className="panel-header">
              <h3>PERSONAL DETAILS</h3>
              {!isEditing ? (
                <button
                  className="glass-action-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14} /> EDIT PROFILE
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditing(false)}
                  >
                    CANCEL
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      "SAVING..."
                    ) : (
                      <>
                        <Save size={16} /> SAVE CHANGES
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <form className="details-form">
              <div className="form-group-glass">
                <label>
                  <User size={12} /> FULL NAME
                </label>
                <input
                  className={`input-glass ${!isEditing ? "locked" : ""}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <Mail size={12} /> EMAIL ADDRESS
                </label>
                <input
                  className="input-glass locked"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <Briefcase size={12} /> TARGET ROLE
                </label>
                <input
                  className={`input-glass ${!isEditing ? "locked" : ""}`}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group-glass">
                <label>
                  <FileText size={12} /> PROFESSIONAL BIO
                </label>
                <textarea
                  className={`input-glass textarea ${!isEditing ? "locked" : ""}`}
                  rows="4"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </form>
          </div>

          <div className="profile-sidebar-stack">
            {/* RIGHT SIDEBAR TOP: Resume Vault (Shifted Up) */}
            <div className="glass-panel">
              <div className="panel-header">
                <h3>RESUME VAULT</h3>
              </div>
              <div className="resume-vault-card">
                <div className="rv-main-content">
                  <div className="rv-icon-box bg-indigo-glow">
                    <FileText size={24} className="text-indigo" />
                  </div>
                  <div className="rv-info">
                    <h4 className="text-white">
                      {resumeName || "No Resume Synced"}
                    </h4>
                    <p className="text-muted">Central storage for AI modules</p>
                  </div>
                </div>

                <label className="rv-upload-trigger" title="Upload New Resume">
                  {isUploading ? (
                    <Loader2 className="spin" size={20} />
                  ) : (
                    <Upload size={20} />
                  )}
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {resumeName && (
                <div className="rv-sync-status">
                  <CheckCircle size={14} />
                  <span>Enabled for Mock Interview & ATS</span>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR BOTTOM: Achievements (Shifted Down) */}
            <div className="glass-panel">
              <div className="panel-header">
                <h3>ACHIEVEMENTS</h3>
              </div>

              <div className="badges-list">
                <div className="badge-item active">
                  <div className="badge-icon-wrapper bg-indigo-glow">
                    <Award size={22} className="text-indigo" />
                  </div>
                  <div className="badge-text">
                    <h4>Early Adopter</h4>
                    <p>Member since Alpha v1.0</p>
                  </div>
                </div>

                <div className="badge-item active">
                  <div className="badge-icon-wrapper bg-blue-glow">
                    <Zap size={22} className="text-blue" />
                  </div>
                  <div className="badge-text">
                    <h4>Fast Learner</h4>
                    <p>Completed 3 sessions this week</p>
                  </div>
                </div>

                <div className="badge-item locked">
                  <div className="badge-icon-wrapper">
                    <Shield size={22} className="text-muted" />
                  </div>
                  <div className="badge-text">
                    <h4>Interview Master</h4>
                    <p>Unlock at 10 total sessions</p>
                    <div className="progress-bar-mini">
                      <div
                        className="fill"
                        style={{
                          width: `${Math.min((stats.interviews / 10) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
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