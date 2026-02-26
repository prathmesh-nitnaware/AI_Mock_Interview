import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  ChevronLeft,
  MessageCircle,
  Activity,
  Award,
  MicOff
} from 'lucide-react';
import './InterviewReport.css'; 

const InterviewReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get History from Live Page, handle empty state gracefully
  const { history, config } = location.state || { history: [], config: {} };

  if (!history || history.length === 0) {
    return (
      <div className="report-container empty-state">
        <h2>No Interview Data Found</h2>
        <p>Complete a mock interview to generate an AI performance report.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">Return to Dashboard</button>
      </div>
    );
  }

  // Calculate Averages
  const totalQuestions = history.length;
  const avgClarity = Math.round(history.reduce((acc, curr) => acc + (curr.feedback?.clarity_score || 0), 0) / totalQuestions) || 0;
  const avgConfidence = Math.round(history.reduce((acc, curr) => acc + (curr.feedback?.confidence_score || 0), 0) / totalQuestions) || 0;
  const totalFillers = history.reduce((acc, curr) => acc + (curr.metrics?.filler_words || 0), 0);
  const avgWpm = Math.round(history.reduce((acc, curr) => acc + (curr.metrics?.wpm || 0), 0) / totalQuestions) || 0;

  // Overall Score Calculation (Out of 100)
  const overallScore = Math.round(((avgClarity + avgConfidence) / 2) * 10); 

  // Dynamic UI Helpers
  const getScoreTier = (score) => {
    if (score >= 80) return { color: 'success', text: 'Exceptional Performance', icon: <Award size={24} /> };
    if (score >= 60) return { color: 'warning', text: 'Solid, Needs Polish', icon: <TrendingUp size={24} /> };
    return { color: 'danger', text: 'Requires Practice', icon: <AlertTriangle size={24} /> };
  };

  const tier = getScoreTier(overallScore);

  return (
    <div className="report-container fade-in">
      
      {/* TOP NAVIGATION */}
      <nav className="report-nav">
        <button onClick={() => navigate('/dashboard')} className="nav-back-btn">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <button className="btn-outline-print" onClick={() => window.print()}>
          <Download size={16}/> Export PDF
        </button>
      </nav>

      {/* HEADER & HERO SCORE */}
      <header className="report-header">
        <div className="header-titles">
            <h1 className="report-title">Performance Analysis</h1>
            <p className="report-meta">
              Target Role: <strong>{config.role || "General"}</strong> • 
              Experience: <strong>{config.experience || "N/A"}</strong> • 
              Questions: <strong>{totalQuestions}</strong>
            </p>
        </div>
        
        <div className={`hero-score-card border-${tier.color}`}>
           <div className="score-ring">
              <span className={`score-number text-${tier.color}`}>{overallScore}</span>
              <span className="score-max">/100</span>
           </div>
           <div className="score-verdict">
              <div className={`verdict-badge bg-${tier.color}`}>
                {tier.icon} {tier.text}
              </div>
           </div>
        </div>
      </header>

      {/* METRICS GRID */}
      <div className="metrics-grid">
        <div className="metric-card">
           <div className="mc-header">
              <MessageCircle size={18} className="text-blue" />
              <span>Avg Clarity</span>
           </div>
           <div className="mc-value">{avgClarity}<span className="mc-max">/10</span></div>
           <div className="mc-bar"><div className="mc-fill bg-blue" style={{width: `${avgClarity * 10}%`}}></div></div>
        </div>

        <div className="metric-card">
           <div className="mc-header">
              <CheckCircle size={18} className="text-purple" />
              <span>Avg Confidence</span>
           </div>
           <div className="mc-value">{avgConfidence}<span className="mc-max">/10</span></div>
           <div className="mc-bar"><div className="mc-fill bg-purple" style={{width: `${avgConfidence * 10}%`}}></div></div>
        </div>

        <div className="metric-card">
           <div className="mc-header">
              <Activity size={18} className="text-indigo" />
              <span>Speech Pace</span>
           </div>
           <div className="mc-value">{avgWpm}<span className="mc-max"> WPM</span></div>
           <div className="mc-subtext">{avgWpm > 160 ? "A bit fast" : avgWpm < 110 ? "A bit slow" : "Ideal pace"}</div>
        </div>

        <div className="metric-card">
           <div className="mc-header">
              <MicOff size={18} className={totalFillers > 5 ? 'text-danger' : 'text-success'} />
              <span>Total Fillers</span>
           </div>
           <div className={`mc-value ${totalFillers > 5 ? 'text-danger' : 'text-success'}`}>{totalFillers}</div>
           <div className="mc-subtext">("um", "uh", "like")</div>
        </div>
      </div>

      {/* DETAILED FEEDBACK TIMELINE */}
      <div className="timeline-section">
        <h2 className="section-heading">Detailed Breakdown</h2>
        
        <div className="timeline-container">
          {history.map((item, index) => (
            <div key={index} className="timeline-item">
              
              <div className="timeline-marker">
                 <div className="marker-circle">{index + 1}</div>
                 {index !== history.length - 1 && <div className="marker-line"></div>}
              </div>
              
              <div className="timeline-content slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="t-question">{item.question}</h3>
                
                <div className="t-user-ans">
                   <span className="ans-label">Your Transcript:</span>
                   <p>"{item.answer}"</p>
                </div>
                
                <div className="t-ai-feedback">
                   <div className="ai-f-header">
                      <div className="f-badge">Clarity: {item.feedback?.clarity_score || '-'}/10</div>
                      <div className="f-badge">Pace: {item.metrics?.wpm || '-'} WPM</div>
                      <div className="f-badge">Fillers: {item.metrics?.filler_words || '0'}</div>
                   </div>
                   <p className="ai-comment"><strong>AI Notes:</strong> {item.feedback?.feedback || "No feedback generated."}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default InterviewReport;