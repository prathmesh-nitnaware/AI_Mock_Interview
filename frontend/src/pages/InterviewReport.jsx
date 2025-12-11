import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import './InterviewReport.css'; // You'll create this CSS file

const InterviewReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get History from Live Page
  const { history, config } = location.state || { history: [], config: {} };

  // Calculate Averages
  const totalQuestions = history.length;
  const avgClarity = Math.round(history.reduce((acc, curr) => acc + (curr.feedback.clarity_score || 0), 0) / totalQuestions) || 0;
  const avgConfidence = Math.round(history.reduce((acc, curr) => acc + (curr.feedback.confidence_score || 0), 0) / totalQuestions) || 0;
  const totalFillers = history.reduce((acc, curr) => acc + (curr.metrics.filler_words || 0), 0);

  // Overall Score Calculation
  const overallScore = Math.round((avgClarity + avgConfidence) / 2 * 10); 

  return (
    <div className="report-container">
      <header className="report-header">
        <h1>Interview Performance Report</h1>
        <p>Role: {config.role || "General"} | Intensity: {config.intensity} Questions</p>
      </header>

      {/* SCORE CARDS */}
      <div className="stats-grid">
        <div className="stat-card main">
           <span className="stat-label">Overall Score</span>
           <div className="stat-value big">{overallScore}%</div>
           <span className="stat-sub">{overallScore > 70 ? "Excellent Job!" : "Needs Improvement"}</span>
        </div>
        <div className="stat-card">
           <span className="stat-label">Avg Clarity</span>
           <div className="stat-value">{avgClarity}/10</div>
        </div>
        <div className="stat-card">
           <span className="stat-label">Avg Confidence</span>
           <div className="stat-value">{avgConfidence}/10</div>
        </div>
        <div className="stat-card">
           <span className="stat-label">Total Filler Words</span>
           <div className={`stat-value ${totalFillers > 5 ? 'bad' : 'good'}`}>{totalFillers}</div>
           <span className="stat-sub">("Um", "Uh", "Like")</span>
        </div>
      </div>

      {/* DETAILED FEEDBACK */}
      <div className="history-section">
        <h2>Question Breakdown</h2>
        <div className="history-list">
          {history.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-header">
                 <span className="q-num">Q{index + 1}</span>
                 <h3>{item.question}</h3>
              </div>
              
              <div className="user-ans">
                 <strong>Your Answer:</strong> "{item.answer}"
              </div>
              
              <div className="ai-feedback">
                 <div className="ai-row">
                    <span>💡 Clarity: <strong>{item.feedback.clarity_score}/10</strong></span>
                    <span>🎤 Pace: <strong>{item.metrics.wpm} WPM</strong></span>
                 </div>
                 <p className="ai-comment">"{item.feedback.feedback}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="action-row">
         <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
         <button className="btn-secondary"><Download size={16}/> Download PDF</button>
      </div>
    </div>
  );
};

export default InterviewReport;