import React, { useState } from 'react';
import ModeSelection from './ModeSelection';
import CodeEditor from './CodeEditor';
import { getDSAQuestion, submitCode } from '../../services/api'; 
import { X, Activity, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import '../../styles/theme.css';

const CodingArena = () => {
  const [stage, setStage] = useState('selection'); // 'selection', 'loading', 'coding'
  const [question, setQuestion] = useState(null);
  const [review, setReview] = useState(null); 
  const [submitting, setSubmitting] = useState(false);

  // --- TRAFFIC CONTROLLER HANDLERS ---

  // 1. Fetch DSA Question based on Difficulty
  const handleDifficultySelect = async (level) => {
    setStage('loading');
    try {
      // Calls @interview_bp.route('/dsa') in interview.py
      const data = await getDSAQuestion(level); 
      setQuestion(data);
      setStage('coding');
    } catch (err) {
      console.error("IDE Init Error:", err);
      alert("Failed to initialize remote environment. Please check your connection.");
      setStage('selection');
    }
  };

  // 2. Used when Resume Parsing returns a dynamic question
  const handleQuestionLoaded = (data) => {
    setQuestion(data);
    setStage('coding');
  };

  // 3. Submit Code for AI Review
  const handleSubmitCode = async (codeStr) => {
    setSubmitting(true);
    try {
      // Calls @interview_bp.route('/submit') in interview.py
      const response = await submitCode({
        code: codeStr,
        question_title: question?.title || "Unknown",
        mode: 'code' // Tells the backend to use the Code Review prompt
      });
      
      if (response.success) {
        setReview(response.review);
      } else {
        alert("AI Reviewer busy. Please try submitting again.");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission failed. Ensure your backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER VIEWS ---

  // VIEW 1: Loading State
  if (stage === 'loading') {
    return (
      <div className="loading-screen">
        <div className="ambient-glow"></div>
        <div className="neon-spinner-large"></div>
        <p className="loading-text">Provisioning IDE Workspace...</p>
      </div>
    );
  }

  // VIEW 2: Selection State
  if (stage === 'selection') {
    return (
      <ModeSelection 
        onDifficultySelect={handleDifficultySelect} 
        onQuestionLoaded={handleQuestionLoaded} 
      />
    );
  }

  // VIEW 3: Coding IDE State
  return (
    <div className="coding-arena-root fade-in">
      <CodeEditor 
        question={question}
        submitting={submitting}
        onSubmit={handleSubmitCode}
        onBack={() => setStage('selection')}
      />

      {/* --- AI REVIEW MODAL --- */}
      {review && (
        <div className="modal-overlay fade-in" style={{zIndex: 9999}}>
          <div className="glass-modal slide-up">
            
            <div className="modal-header">
              <div className="flex-center" style={{gap: '12px'}}>
                  <Sparkles size={20} className="text-indigo" />
                  <h3 className="card-title">AI Performance Insights</h3>
              </div>
              <button onClick={() => setReview(null)} className="btn-ghost" style={{padding: '5px'}}>
                <X size={20}/>
              </button>
            </div>
            
            <div className="card-body" style={{padding: '2rem'}}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Correctness Panel */}
                <div className="glass-panel" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <span className="text-muted" style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Correctness</span>
                  <div className={`flex-center mt-2 ${review.correctness === 'Yes' ? 'text-success' : 'text-warning'}`} style={{fontSize: '1.5rem', fontWeight: '800', gap: '10px'}}>
                    {review.correctness === 'Yes' ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}
                    {review.correctness}
                  </div>
                </div>

                {/* Rating Panel */}
                <div className="glass-panel" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <span className="text-muted" style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Logic Rating</span>
                  <div className="flex-center mt-2 text-indigo" style={{fontSize: '1.5rem', fontWeight: '800', gap: '10px'}}>
                    <Activity size={24}/> {review.rating}/10
                  </div>
                </div>

                {/* Complexity Panel */}
                <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '1.5rem'}}>
                   <span className="text-muted block mb-2" style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Efficiency (Big O)</span>
                   <code className="complexity-tag">
                     {review.time_complexity}
                   </code>
                </div>

                {/* Feedback Panel */}
                <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '1.5rem'}}>
                   <span className="text-muted block mb-2" style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Developer Feedback</span>
                   <p style={{color: '#e4e4e7', lineHeight: '1.6', fontSize: '0.95rem'}}>{review.feedback}</p>
                </div>
                
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setReview(null)} className="btn-secondary w-full">
                RETURN TO WORKSPACE
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CodingArena;