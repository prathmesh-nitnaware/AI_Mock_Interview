import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Terminal, Play, CheckCircle, Code, Award, RotateCcw, Loader2 } from 'lucide-react';
import './CodingDojo.css';

const CodingDojo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);

  // Fetch a challenge tailored to your ML Engineer profile
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        // We'll use a dedicated endpoint for generating code challenges
        const res = await api.client.post("/api/interview/next", { 
          focus: "Algorithms & Data Structures",
          role: "ML Engineer" 
        });
        setProblem(res.data);
        setCode(res.data.starter_code || "// Write your solution here...");
      } catch (err) {
        console.error("Dojo Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, []);

  const handleRunCode = async () => {
    setSubmitting(true);
    try {
      const res = await api.client.post("/api/interview/submit", {
        answer: code,
        question_title: problem.title
      });
      setOutput(res.data.review);
    } catch (err) {
      alert("Execution failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="loader-ring"></div></div>;

  return (
    <div className="dojo-root fade-in">
      <div className="ambient-glow-dojo"></div>
      
      <div className="dojo-layout">
        {/* LEFT: PROBLEM DEFINITION */}
        <div className="problem-panel glass-panel">
          <div className="panel-header-dojo">
            <div className="brand-pill-light"><Terminal size={14}/> CHALLENGE_MODE</div>
            <span className="difficulty-tag">MEDIUM</span>
          </div>

          <h1 className="dojo-title">{problem?.title}</h1>
          <div className="dojo-description">
            <p>{problem?.description}</p>
          </div>

          {output && (
            <div className="ai-feedback-box glass-card fade-in-up">
              <div className="feedback-head">
                <Award size={16} className="text-indigo" />
                <span>AI CODE REVIEW</span>
              </div>
              <p>{output.feedback}</p>
              <div className="dojo-score-row">
                <span>Logic: {output.clarity_score}/10</span>
                <span>Optimality: {output.confidence_score}/10</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: CODE EDITOR */}
        <div className="editor-panel glass-panel">
          <div className="editor-header">
            <div className="tab active"><Code size={14}/> solution.py</div>
            <button className="reset-btn" onClick={() => setCode(problem?.starter_code)}>
              <RotateCcw size={14}/>
            </button>
          </div>

          <textarea 
            className="code-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />

          <div className="editor-actions">
            <div className="status-msg">
              {submitting ? "Analyzing Logic..." : "Ready to execute"}
            </div>
            <button 
              className="run-btn-glow" 
              onClick={handleRunCode}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="spin" size={18}/> : <><Play size={18}/> RUN ANALYSIS</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingDojo;