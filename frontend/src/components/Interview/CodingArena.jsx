import React, { useState } from 'react';
import ModeSelection from './ModeSelection';
import CodeEditor from './CodeEditor';
import {api} from '../../services/api'; 
import { X, Activity, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import '../../styles/theme.css';

const CodingArena = () => {
  const [stage, setStage] = useState('selection'); // 'selection', 'loading', 'coding'
  const [question, setQuestion] = useState(null);
  const [review, setReview] = useState(null); 
  const [submitting, setSubmitting] = useState(false);

  // --- TRAFFIC CONTROLLER HANDLERS ---

  // 1. Triggered by ModeSelection when user clicks Easy/Med/Hard
  const handleDifficultySelect = async (level) => {
    setStage('loading');
    try {
      const data = await getDSAQuestion(level); 
      setQuestion(data);
      setStage('coding');
    } catch (err) {
      alert("Failed to initialize remote environment. Please try again.");
      setStage('selection');
    }
  };

  // 2. Triggered by ModeSelection when Resume is parsed successfully
  const handleQuestionLoaded = (data) => {
    setQuestion(data);
    setStage('coding');
  };

  // 3. Triggered by CodeEditor when user clicks Submit
  const handleSubmitCode = async (codeStr) => {
    setSubmitting(true);
    try {
      const response = await submitCode({
        code: codeStr,
        question_title: question?.title || "Unknown"
      });
      setReview(response.review);
    } catch (err) {
      alert("Submission failed. Check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER VIEWS ---

  // VIEW 1: Loading State
  if (stage === 'loading') {
    return (
      <div className="loading-screen">
        <div className="neon-spinner-large"></div>
        <p className="loading-text">Provisioning IDE Workspace...</p>
      </div>
    );
  }

  // VIEW 2: Selection State (Uses the component we built!)
  if (stage === 'selection') {
    return (
      <ModeSelection 
        onDifficultySelect={handleDifficultySelect} 
        onQuestionLoaded={handleQuestionLoaded} 
      />
    );
  }

  // VIEW 3: Coding IDE State (Uses the component we built!)
  return (
    <>
      <CodeEditor 
        question={question}
        submitting={submitting}
        onSubmit={handleSubmitCode}
        onBack={() => setStage('selection')}
      />

      {/* --- AI REVIEW MODAL (Overlays the Editor) --- */}
      {review && (
        <div className="modal-overlay fade-in" style={{zIndex: 9999}}>
          <div className="glass-modal slide-up">
            
            <div className="modal-header">
              <div className="flex-center" style={{gap: '8px'}}>
                  <Sparkles size={20} className="text-indigo" />
                  <h3 className="card-title">AI Code Review</h3>
              </div>
              <button onClick={() => setReview(null)} className="btn-ghost" style={{padding: '5px'}}>
                <X size={20}/>
              </button>
            </div>
            
            <div className="card-body" style={{padding: '2rem'}}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                <div className="glass-panel" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <span className="text-muted" style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Functionality</span>
                  <div className={`flex-center mt-2 ${review.correctness === 'Yes' ? 'text-success' : 'text-warning'}`} style={{fontSize: '1.5rem', fontWeight: '800', gap: '10px'}}>
                    {review.correctness === 'Yes' ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}
                    {review.correctness}
                  </div>
                </div>

                <div className="glass-panel" style={{padding: '1.5rem', textAlign: 'center'}}>
                  <span className="text-muted" style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Efficiency</span>
                  <div className="flex-center mt-2 text-indigo" style={{fontSize: '1.5rem', fontWeight: '800', gap: '10px'}}>
                    <Activity size={24}/> {review.rating}/10
                  </div>
                </div>

                <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '1.5rem'}}>
                   <span className="text-muted block mb-2" style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Time Complexity</span>
                   <code style={{background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '6px 12px', borderRadius: '6px', fontFamily: 'monospace'}}>
                     {review.time_complexity}
                   </code>
                </div>

                <div className="glass-panel" style={{gridColumn: '1 / -1', padding: '1.5rem'}}>
                   <span className="text-muted block mb-2" style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Architectural Feedback</span>
                   <p style={{color: '#e4e4e7', lineHeight: '1.6'}}>{review.feedback}</p>
                </div>
                
              </div>
            </div>
            
            <div style={{padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
              <button onClick={() => setReview(null)} className="btn-secondary w-full">
                RETURN TO EDITOR
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CodingArena;