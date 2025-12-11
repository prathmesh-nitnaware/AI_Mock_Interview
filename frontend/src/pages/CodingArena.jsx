import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import { api } from '../services/api';
import { ArrowLeft, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import './InterviewLive.css'; // Reuse existing layout styles

const CodingArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const question = location.state?.question || {
      title: "Loading...", description: "Initializing...", input_format: "", output_format: ""
  };

  const [code, setCode] = useState(`
# Write your solution here
# Problem: ${question.title}

def solve():
    pass
`);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.submitCode({
        code: code,
        question_title: question.title,
        mode: "code" // <--- Tells backend to check SYNTAX/LOGIC
      });
      setFeedback(response.review);
    } catch (error) {
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="live-container">
      {/* LEFT PANEL: PROBLEM STATEMENT */}
      <div className="question-panel" style={{width: '35%'}}>
        <div className="panel-header">
           <button onClick={() => navigate('/dashboard')} className="back-btn"><ArrowLeft size={16}/> Exit</button>
        </div>
        
        <h1 className="problem-title">{question.title}</h1>
        <div className="desc-box"><p>{question.description}</p></div>

        <div className="io-section" style={{background:'#111', padding:'1rem', borderRadius:'8px', marginTop:'2rem'}}>
             <h3 style={{color:'#666', fontSize:'0.8rem', marginBottom:'10px'}}>INPUT FORMAT</h3>
             <code style={{color:'#22c55e'}}>{question.input_format || "N/A"}</code>
             
             <h3 style={{color:'#666', fontSize:'0.8rem', margin:'20px 0 10px'}}>OUTPUT FORMAT</h3>
             <code style={{color:'#3b82f6'}}>{question.output_format || "N/A"}</code>
        </div>
      </div>

      {/* RIGHT PANEL: CODE EDITOR */}
      <div className="editor-panel" style={{width: '65%', display:'flex', flexDirection:'column'}}>
        <Editor 
          height="70vh" 
          defaultLanguage="python" 
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val)}
          options={{ minimap: { enabled: false }, fontSize: 14 }}
        />
        
        <div className="control-bar" style={{justifyContent:'space-between'}}>
           <span style={{color:'#666', fontSize:'0.9rem'}}>Python 3.10</span>
           <button onClick={handleSubmit} disabled={submitting} className="submit-voice-btn" style={{width:'auto', padding:'0 2rem'}}>
             {submitting ? "Compiling & Analyzing..." : <> <Play size={16}/> Submit Solution </>}
           </button>
        </div>

        {/* FEEDBACK OVERLAY */}
        {feedback && (
          <div className="feedback-overlay">
            <div className="feedback-card" style={{maxWidth:'600px'}}>
              <h2>AI Code Review</h2>
              
              <div className="score-row">
                 <div className="score-item">
                    <span className="label">Status</span>
                    <span className={`value ${feedback.correctness === 'Yes' ? 'green' : 'bad'}`}>
                        {feedback.correctness === 'Yes' ? 'Accepted' : 'Review Needed'}
                    </span>
                 </div>
                 <div className="score-item">
                    <span className="label">Complexity</span>
                    <span className="value blue">{feedback.time_complexity}</span>
                 </div>
                 <div className="score-item">
                    <span className="label">Rating</span>
                    <span className="value">{feedback.rating}/10</span>
                 </div>
              </div>

              <div style={{textAlign:'left', background:'#000', padding:'1rem', borderRadius:'8px', marginBottom:'20px'}}>
                  <p style={{color:'#ddd', lineHeight:'1.6'}}>{feedback.feedback}</p>
              </div>
              
              <div className="feedback-actions">
                  <button onClick={() => setFeedback(null)} className="continue-btn" style={{background:'#333'}}>
                      Keep Editing
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="continue-btn">
                      Finish
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingArena;