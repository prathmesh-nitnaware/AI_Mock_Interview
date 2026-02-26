import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  CheckCircle2, XCircle, ArrowRight, RefreshCw, 
  Target, Sparkles, AlertTriangle, FileSearch 
} from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css';
import './ResumeResult.css';

const ResumeResult = () => {
  const location = useLocation();
  const [resumeId] = useState(location.state?.resume_id || null);
  const [jobRole, setJobRole] = useState(location.state?.job_role || '');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleScore = async (e) => {
    e?.preventDefault();
    if (!jobRole.trim()) return alert("Please enter a target role.");
    
    setLoading(true);
    try {
      const data = await api.scoreResume(resumeId, jobRole);
      setResults(data);
    } catch (error) {
      alert("AI Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic UI Helper
  const getScoreTier = (score) => {
    if (score >= 80) return { color: 'success', text: 'Highly Optimized', glow: 'glow-success' };
    if (score >= 60) return { color: 'warning', text: 'Needs Refinement', glow: 'glow-warning' };
    return { color: 'danger', text: 'Critical Gaps Detected', glow: 'glow-danger' };
  };

  if (!resumeId) {
    return (
      <div className="result-empty page-container fade-in-up">
        <FileSearch size={48} className="text-muted mb-4" />
        <h1 className="empty-title">No Document Detected</h1>
        <p className="empty-desc">Please upload a resume to begin the ATS analysis.</p>
        <Link to="/resume/upload" className="btn-glow-primary mt-6">Upload Resume</Link>
      </div>
    );
  }

  const tier = results ? getScoreTier(results.score) : null;

  return (
    <div className="result-root page-container">
      
      {/* Ambient Backgrounds */}
      <div className={`ambient-glow-resume ${tier ? tier.glow : ''}`}></div>
      
      {/* HEADER */}
      <div className="result-header fade-in-up">
        <div className="brand-pill">
            <Sparkles size={14} className="text-indigo" />
            <span>AI ATS DIAGNOSTIC</span>
        </div>
        <h1 className="result-title">Resume Audit Report</h1>
      </div>

      {/* INPUT SECTION (Pre-Scan) */}
      {!results && !loading && (
        <div className="result-setup fade-in-up delay-200">
          <Card className="glass-panel setup-panel">
            <div className="setup-icon-wrapper">
              <Target size={24} className="text-indigo" />
            </div>
            <h3 className="panel-heading text-center">Define Target Parameters</h3>
            <p className="panel-sub text-center mb-6">Enter the specific job title you are applying for to calibrate the ATS parser.</p>
            
            <form onSubmit={handleScore} className="setup-form">
              <InputField 
                label="TARGET JOB TITLE"
                name="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="E.g. Senior Full Stack Engineer"
              />
              <Button type="submit" variant="primary" className="btn-glow-submit w-full mt-6">
                RUN AI DIAGNOSTIC <ArrowRight size={16} />
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !results && (
        <div className="ai-scanning-container fade-in-up">
          <div className="scanner-visual">
            <FileSearch size={40} className="text-indigo pulse-icon" />
            <div className="scan-line"></div>
          </div>
          <h3 className="scan-title">Analyzing Document Topology...</h3>
          <p className="scan-sub">Cross-referencing entity graphs with "{jobRole}" requirements.</p>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {results && (
        <div className="report-grid fade-in-up">
          
          {/* Main Score (Left Col) */}
          <div className={`glass-panel score-section border-${tier.color}`}>
            <div className="score-header">
              <h3 className="panel-heading">Overall Match</h3>
            </div>
            
            <div className="score-circle-wrapper">
              <div className={`score-circle text-${tier.color} shadow-${tier.color}`}>
                <span className="score-huge">{results.score}</span>
                <span className="score-max">/100</span>
              </div>
            </div>
            
            <div className={`verdict-badge bg-${tier.color} text-${tier.color}`}>
              {tier.text}
            </div>

            <div className="score-actions">
              <Button variant="secondary" onClick={() => setResults(null)} className="btn-glass-outline w-full">
                <RefreshCw size={14} /> NEW SCAN
              </Button>
            </div>
          </div>

          {/* Details Grid (Right Col) */}
          <div className="details-grid">
            
            {/* Missing Keywords */}
            <Card className="glass-panel">
              <div className="panel-header-flex">
                <AlertTriangle size={18} className="text-danger" />
                <h3 className="panel-heading">Missing Keywords</h3>
              </div>
              <div className="tags-container">
                {results.missing_keywords?.length > 0 ? (
                  results.missing_keywords.map((kw, i) => (
                    <span key={i} className="danger-pill">{kw}</span>
                  ))
                ) : (
                  <span className="success-text">No critical gaps detected.</span>
                )}
              </div>
            </Card>

            {/* Strengths */}
            <Card className="glass-panel">
              <div className="panel-header-flex">
                <CheckCircle2 size={18} className="text-success" />
                <h3 className="panel-heading">Detected Strengths</h3>
              </div>
              <ul className="list-glass success">
                {results.strengths?.map((s, i) => (
                  <li key={i}><CheckCircle2 size={16} /> <span>{s}</span></li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card className="glass-panel">
              <div className="panel-header-flex">
                <XCircle size={18} className="text-danger" />
                <h3 className="panel-heading">Critical Issues</h3>
              </div>
              <ul className="list-glass danger">
                {results.weaknesses?.map((w, i) => (
                  <li key={i}><XCircle size={16} /> <span>{w}</span></li>
                ))}
              </ul>
            </Card>

            {/* Suggestions */}
            <Card className="glass-panel full-width">
              <div className="panel-header-flex">
                <Sparkles size={18} className="text-indigo" />
                <h3 className="panel-heading">Optimization Strategy</h3>
              </div>
              <div className="suggestions-list">
                {results.suggestions?.map((s, i) => (
                  <div key={i} className="suggestion-row">
                    <ArrowRight size={16} className="text-muted" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeResult;