import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ChevronRight, Clock, Code2, Users, Settings, 
  AlertCircle, FileText, CheckCircle2, UploadCloud, Loader2
} from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css';
import './Interview.css';

const Interview = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resumeText, setResumeText] = useState(localStorage.getItem('last_resume_text') || "");
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    role: '',
    experience: '0-2 years',
    type: 'Technical',
    questionCount: 5
  });

  const handleChange = (e) => {
    setError(false); 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  // --- Resume Parsing Logic ---
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await api.scoreResume(file, "General Context");
      if (data.extracted_text) {
          setResumeText(data.extracted_text);
          localStorage.setItem('last_resume_text', data.extracted_text);
      } else {
          alert("Resume parsed, but no text could be extracted.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to parse file. Ensure backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Session Init Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role.trim()) {
      setError(true);
      return;
    }
    
    setLoading(true);
    try {
      const sessionConfig = {
        role: formData.role,
        experience: formData.experience,
        focus: formData.type,
        intensity: formData.questionCount,
        resume_context: resumeText 
      };

      // Ensure your backend endpoint matches this signature
      const data = await api.startInterview(sessionConfig);
      
      if (data) {
        // Pass to the Lobby/System Check screen first
        navigate('/interview/session', { 
            state: { question: data, config: sessionConfig } 
        });
      }
    } catch { 
      alert("Failed to initialize session. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  const expOptions = [
    { label: '0-2 YEARS', val: '0-2 years' },
    { label: '3-5 YEARS', val: '3-5 years' },
    { label: '5+ YEARS', val: '5+ years' }
  ];

  const typeOptions = [
    { label: 'TECHNICAL', icon: <Code2 size={16} /> },
    { label: 'BEHAVIORAL', icon: <Users size={16} /> },
    { label: 'SYSTEM DESIGN', icon: <Settings size={16} /> }
  ];

  return (
    <div className="interview-root page-container fade-in-up">
      <div className="interview-split">
        
        {/* Left Side: Meta Info & Resume Context */}
        <div className="interview-meta">
          <div className="meta-badge">SYSTEM.INIT</div>
          <h1 className="meta-title">SESSION<br/>CONFIG</h1>
          <p className="meta-desc">
            Define the parameters for your AI simulation. The model will adapt its phrasing, difficulty, and follow-up questions based on these settings.
          </p>

          {/* New Integrated Resume Context Widget */}
          <div className={`context-widget mt-8 ${resumeText ? 'active' : ''}`}>
             <div className="cw-header">
                {resumeText ? <CheckCircle2 size={20} className="text-success" /> : <FileText size={20} className="text-muted" />}
                <h3>{resumeText ? "AI CONTEXT ACTIVE" : "OPTIONAL CONTEXT"}</h3>
             </div>
             <p className="cw-desc">
                {resumeText 
                  ? "Your resume data is loaded. The AI will tailor scenarios to your specific past projects."
                  : "Upload a resume to generate highly personalized, experience-specific interview questions."}
             </p>
             
             <label className="cw-upload-btn">
                {isUploading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                {resumeText ? "REPLACE RESUME" : "UPLOAD RESUME PDF"}
                <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={isUploading} />
             </label>
          </div>
        </div>

        {/* Right Side: Configuration Form */}
        <div className="interview-form-wrapper">
          <Card className="card-editorial setup-card">
            <form onSubmit={handleSubmit}>
              
              <div className="group-editorial">
                <InputField 
                  label="TARGET ROLE"
                  name="role"
                  placeholder="E.g. Senior Frontend Engineer"
                  value={formData.role}
                  onChange={handleChange}
                  className={error ? 'input-error' : ''}
                />
                {error && <span className="error-text"><AlertCircle size={14} /> A target role is required.</span>}
              </div>

              <div className="group-editorial">
                <label className="label-editorial">EXPERIENCE LEVEL</label>
                <div className="chips-row">
                  {expOptions.map(exp => (
                    <button
                      key={exp.val} type="button"
                      className={`chip-btn ${formData.experience === exp.val ? 'active' : ''}`}
                      onClick={() => handleSelect('experience', exp.val)}
                    >
                      <Clock size={14} className="chip-icon" /> {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group-editorial">
                <label className="label-editorial">SESSION TYPE</label>
                <div className="chips-row">
                  {typeOptions.map(type => (
                    <button
                      key={type.label} type="button"
                      className={`chip-btn ${formData.type === type.label ? 'active' : ''}`}
                      onClick={() => handleSelect('type', type.label)}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group-editorial">
                <div className="flex-between">
                  <label className="label-editorial">INTENSITY (QUESTIONS)</label>
                  <span className="text-mono highlight-text">{formData.questionCount}</span>
                </div>
                <div className="slider-wrapper">
                  <input 
                    type="range" min="3" max="10" step="1"
                    value={formData.questionCount}
                    onChange={(e) => handleSelect('questionCount', parseInt(e.target.value))}
                    className="slider-editorial"
                    style={{ backgroundSize: `${((formData.questionCount - 3) * 100) / 7}% 100%` }}
                  />
                  <div className="slider-labels">
                    <span>Quick (3)</span>
                    <span>Deep Dive (10)</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" variant="primary" 
                isLoading={loading} disabled={!formData.role.trim() || loading}
                className="btn-editorial primary w-full mt-6 init-btn"
              >
                INITIALIZE ENVIRONMENT <ChevronRight size={18} />
              </Button>

            </form>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Interview;