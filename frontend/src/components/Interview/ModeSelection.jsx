import React, { useState } from 'react';
import { uploadResumeForInterview } from '../../services/api';
import { Activity, FileText, UploadCloud, Loader2, AlertTriangle, Code2 } from 'lucide-react';
import './ModeSelection.css'; 

const ModeSelection = ({ onQuestionLoaded, onDifficultySelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      // Reuse the parser logic via API
      const questionData = await uploadResumeForInterview(file);
      onQuestionLoaded(questionData); // Callback to switch to Editor view
    } catch (err) {
      console.error("Failed to generate question", err);
      setError("Failed to analyze resume context. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mode-selection-root fade-in-up">
      
      {/* Header */}
      <div className="ms-header">
         <div className="brand-pill mx-auto mb-4">
            <Code2 size={14} className="text-indigo" />
            <span>TECHNICAL ROUND</span>
         </div>
         <h1 className="ms-title">Coding Dojo</h1>
         <p className="ms-sub">Select your interview modality to provision the IDE.</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-pill mx-auto mb-6">
          <AlertTriangle size={16}/> <span>{error}</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="mode-cards-grid">
        
        {/* Card 1: Standard DSA */}
        <div className="glass-panel mode-card">
          <div className="mc-icon-wrapper bg-blue-glow mb-4">
             <Activity size={24} className="text-blue" />
          </div>
          <h3 className="mc-title">Standard Algorithms</h3>
          <p className="mc-desc mb-6">Practice classic data structures and algorithms selected by difficulty.</p>
          
          <div className="diff-buttons mt-auto">
            <button 
              onClick={() => onDifficultySelect && onDifficultySelect('easy')} 
              disabled={loading} 
              className="btn-diff easy"
            >
              Easy
            </button>
            <button 
              onClick={() => onDifficultySelect && onDifficultySelect('medium')} 
              disabled={loading} 
              className="btn-diff medium"
            >
              Medium
            </button>
            <button 
              onClick={() => onDifficultySelect && onDifficultySelect('hard')} 
              disabled={loading} 
              className="btn-diff hard"
            >
              Hard
            </button>
          </div>
        </div>

        {/* Card 2: Resume Based */}
        <div className="glass-panel mode-card">
          <div className="mc-icon-wrapper bg-purple-glow mb-4">
             <FileText size={24} className="text-purple" />
          </div>
          <h3 className="mc-title">Contextual Architecture</h3>
          <p className="mc-desc mb-6">Upload your resume to generate a complex systems problem based on your specific past experience.</p>
          
          <label className={`btn-glow-submit w-full mt-auto ${loading ? 'disabled-label' : ''}`}>
            {loading ? (
              <> <Loader2 size={18} className="animate-spin"/> ANALYZING DOC... </>
            ) : (
              <> <UploadCloud size={18}/> UPLOAD RESUME (PDF) </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf" 
              onChange={handleResumeUpload} 
              disabled={loading} 
            />
          </label>
        </div>

      </div>
    </div>
  );
};

export default ModeSelection;