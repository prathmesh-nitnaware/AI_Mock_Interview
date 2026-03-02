import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  ChevronLeft,
  MessageCircle,
  Activity,
  Award,
  MicOff,
} from "lucide-react";
import "./InterviewReport.css";

const InterviewReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { history, config } = location.state || { history: [], config: {} };

  if (!history || history.length === 0) {
    return (
      <div className="report-root empty-state">
        <div className="glass-card text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2>No Session Data</h2>
          <button
            onClick={() => navigate("/interview")}
            className="btn-hero-primary"
          >
            START INTERVIEW
          </button>
        </div>
      </div>
    );
  }

  // Analytics Calculation
  const totalQuestions = history.length;
  const avgClarity =
    Math.round(
      history.reduce(
        (acc, curr) => acc + (curr.feedback?.clarity_score || 0),
        0,
      ) / totalQuestions,
    ) || 0;
  const avgConfidence =
    Math.round(
      history.reduce(
        (acc, curr) => acc + (curr.feedback?.confidence_score || 0),
        0,
      ) / totalQuestions,
    ) || 0;
  const totalFillers = history.reduce(
    (acc, curr) => acc + (curr.metrics?.filler_words || 0),
    0,
  );
  const avgWpm =
    Math.round(
      history.reduce((acc, curr) => acc + (curr.metrics?.wpm || 0), 0) /
        totalQuestions,
    ) || 0;
  const overallScore = Math.round(((avgClarity + avgConfidence) / 2) * 10);

  const getTier = (score) => {
    if (score >= 85)
      return {
        color: "success",
        text: "Elite Candidate",
        icon: <Award size={20} />,
      };
    if (score >= 70)
      return {
        color: "warning",
        text: "Job Ready",
        icon: <TrendingUp size={20} />,
      };
    return {
      color: "danger",
      text: "Needs Training",
      icon: <AlertTriangle size={20} />,
    };
  };

  const tier = getTier(overallScore);

  return (
    <div className="report-root fade-in">
      <div className="hero-glow"></div>

      <nav className="report-nav-header">
        <button
          onClick={() => navigate("/dashboard")}
          className="nav-back-glass"
        >
          <ChevronLeft size={18} />
          <span>DASHBOARD</span>
        </button>
        <button className="nav-download-glow" onClick={() => window.print()}>
          <Download size={18} />
          <span>DOWNLOAD PDF</span>
        </button>
      </nav>

      <div className="report-container">
        {/* HORIZONTAL HERO SECTION */}
        <div className="report-hero glass-card">
          <div className="hero-info">
            <h1 className="report-title">
              PERFORMANCE
              <br />
              AUDIT
            </h1>
            <p className="release-badge">
              {config.role?.toUpperCase() || "ML ENGINEER"} • {totalQuestions}{" "}
              SESSIONS
            </p>
          </div>

          <div className={`score-circle-wrapper border-${tier.color}`}>
            <div className="score-value">{overallScore}%</div>
            <div className={`tier-tag bg-${tier.color}`}>
              {tier.icon} {tier.text}
            </div>
          </div>
        </div>

        {/* HORIZONTAL METRICS GRID */}
        <div className="metrics-horizontal-grid">
          <MetricCard
            icon={<MessageCircle className="text-blue" />}
            label="CLARITY"
            value={avgClarity}
            max={10}
          />
          <MetricCard
            icon={<CheckCircle className="text-purple" />}
            label="CONFIDENCE"
            value={avgConfidence}
            max={10}
          />
          <MetricCard
            icon={<Activity className="text-indigo" />}
            label="SPEECH PACE"
            value={avgWpm}
            unit="WPM"
          />
          <MetricCard
            icon={<MicOff className="text-red-500" />}
            label="FILLERS"
            value={totalFillers}
            unit="Detected"
          />
        </div>

        {/* FEEDBACK SECTION */}
        <div className="breakdown-section">
          <h2 className="section-heading">AI SESSION FEEDBACK</h2>
          <div className="timeline-list">
            {history.map((item, idx) => (
              <div key={idx} className="timeline-card glass-card">
                <div className="session-mark">0{idx + 1}</div>
                <div className="session-content">
                  <h3 className="question-text">{item.question}</h3>
                  <div className="ai-insight">
                    <span className="insight-label">AI ANALYSIS</span>
                    <p>
                      {item.feedback?.feedback ||
                        "Technical response was structured well."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, max, unit }) => (
  <div className="metric-card-horizontal glass-card">
    <div className="mh-header">
      {icon}
      <span>{label}</span>
    </div>
    <div className="mh-body">
      <span className="mh-value">{value}</span>
      <span className="mh-unit">{max ? `/${max}` : unit}</span>
    </div>
  </div>
);

export default InterviewReport;
