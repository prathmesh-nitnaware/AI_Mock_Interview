import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import FileUpload from '../components/FileUpload.jsx';

const Dashboard = () => {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const response = await resumeAPI.getResume();
      setResume(response.resume);
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    setMessage('');

    try {
      const response = await resumeAPI.uploadResume(file);
      setMessage('Resume uploaded successfully!');
      setResume(response.resume);
    } catch (error) {
      setMessage(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      await resumeAPI.deleteResume();
      setResume(null);
      setMessage('Resume deleted successfully!');
    } catch (error) {
      setMessage(error.message || 'Delete failed. Please try again.');
    }
  };

  // --- UPDATED LOGIC HERE ---
  const startMockInterview = () => {
    navigate('/interview');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Interview Dashboard</h1>
          <p>Manage your resume, practice interviews, and track your progress</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('failed') ? 'alert-error' : message.includes('coming soon') ? 'alert-warning' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            📝 Resume Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            🤖 Mock Interviews
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-grid">
            {/* Welcome Card */}
            <div className="dashboard-card welcome-card">
              <h2>Welcome to MockAi-Interview! 🎉</h2>
              <p>Get ready to ace your next job interview with our AI-powered practice platform.</p>
              <div className="welcome-actions">
                <button className="btn btn-primary" onClick={startMockInterview}>
                  Start Mock Interview
                </button>
                {!resume && (
                  <button className="btn btn-outline" onClick={() => setActiveTab('resume')}>
                    Upload Resume First
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="dashboard-card">
              <h2>Your Progress</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-info">
                    <h3>Interview Score</h3>
                    <p>{resume ? '85%' : 'Not rated'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h3>Practice Sessions</h3>
                    <p>0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Status */}
            <div className="dashboard-card">
              <h2>Resume Status</h2>
              <div className="resume-status">
                <div className={`status-indicator ${resume ? 'active' : 'inactive'}`}>
                  <span className="status-dot"></span>
                  {resume ? 'Resume Uploaded' : 'No Resume'}
                </div>
                {resume ? (
                  <div className="resume-preview">
                    <p><strong>File:</strong> {resume.fileName}</p>
                    <p><strong>Uploaded:</strong> {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                    <button 
                      onClick={() => setActiveTab('resume')}
                      className="btn btn-secondary"
                    >
                      Manage Resume
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveTab('resume')}
                    className="btn btn-primary"
                  >
                    Upload Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resume Management Tab */}
        {activeTab === 'resume' && (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Resume Management</h2>
              <p>Upload your resume to get personalized interview questions and feedback</p>
              
              <FileUpload 
                onFileUpload={handleFileUpload}
                accept=".pdf"
                maxSize={5 * 1024 * 1024}
                loading={uploading}
              />

              {resume && (
                <div className="resume-info">
                  <h3>Current Resume</h3>
                  <div className="resume-details">
                    <p><strong>File Name:</strong> {resume.fileName}</p>
                    <p><strong>Uploaded:</strong> {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  {resume.analysis && (
                     <div className="mt-4 p-4 bg-gray-800 rounded">
                        <h4 className="font-bold">AI Analysis</h4>
                        <p>{resume.analysis.profile_summary}</p>
                        <p className="mt-2 text-green-400">Score: {resume.analysis.resume_score}</p>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mock Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2>Mock Interview Sessions</h2>
              <p>Practice with AI-powered interviews tailored to your resume and experience</p>
              
              <div className="interview-types">
                <div className="interview-card">
                  <div className="interview-icon">🎯</div>
                  <h3>Custom Interview</h3>
                  <p>Personalized questions based on your resume</p>
                  <button 
                    className="btn btn-primary"
                    onClick={startMockInterview}
                  >
                    Start New Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;