import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api'; 
import { Briefcase, FileText, Check, AlertCircle, Sliders, ArrowRight } from 'lucide-react';
import './InterviewSetup.css';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Initialize State
  // Try to recover resume text if the user came back or refreshed
  const [resumeText, setResumeText] = useState(
    location.state?.raw_text || localStorage.getItem('last_resume_text') || ""
  );
  
  // Show uploader if we don't have text yet
  const [showUploader, setShowUploader] = useState(!resumeText); 
  const [loading, setLoading] = useState(false);

  // Form Configuration
  const [formData, setFormData] = useState({
    role: '',
    experience: '0-2 years',
    type: 'Technical',
    questionCount: 5 // This maps to "intensity" in our backend
  });

  // --- Handlers ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionSelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 1. Send file to backend to extract text
      // We use "General Context" as a placeholder job desc to get the raw text
      const data = await api.scoreResume(file, "General Context");
      
      // 2. Store the extracted text
      if (data.extracted_text) {
          setResumeText(data.extracted_text);
          localStorage.setItem('last_resume_text', data.extracted_text);
          setShowUploader(false);
          alert("Resume Parsed Successfully! AI Context Active.");
      } else {
          alert("Resume parsed, but no text could be extracted.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to parse file. Ensure backend is running.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return alert("Target Role is required.");

    setLoading(true);
    try {
      // 3. Construct the Session Config
      const sessionConfig = {
        role: formData.role,
        experience: formData.experience,
        focus: formData.type,
        intensity: parseInt(formData.questionCount), // This sets the limit for the interview loop
        resume_context: resumeText 
      };

      // 4. Generate the First Question
      const data = await api.startInterview(sessionConfig);
      
      if (data) {
        // --- CRITICAL: Pass Config Forward ---
        // We navigate to the Camera Room first
        // We pass 'config' so the Live page eventually knows the question limit
        navigate('/interview/room', { 
            state: { 
                question: data,
                config: sessionConfig 
            } 
        });
      }
    } catch (error) {
      console.error(error);
      alert("Session initialization failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-root page-container">
      
      {/* LEFT COLUMN: Narrative & Context */}
      <div className="setup-visual">
        <div className="visual-header">
          <span className="text-mono">01 // CONFIGURATION</span>
          <h1 className="visual-title">DESIGN YOUR <br/> SESSION</h1>
        </div>

        <div className={`context-widget ${resumeText ? 'active' : ''}`}>
          <div className="widget-icon">
            {resumeText ? <Check size={20} /> : <AlertCircle size={20} />}
          </div>
          <div className="widget-content">
            <h3 className="widget-title">{resumeText ? "CONTEXT ACTIVE" : "NO CONTEXT"}</h3>
            <p className="widget-desc">
              {resumeText 
                ? "AI has analyzed your resume. Questions will be tailored to your specific project history." 
                : "Standard mode. AI will ask general competency questions based on the role."}
            </p>
            {resumeText && (
              <button className="widget-action" onClick={() => setShowUploader(true)}>
                REPLACE RESUME
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Form */}
      <div className="setup-form-wrapper">
        <div className="setup-card-editorial">
          <form onSubmit={handleSubmit}>
            
            {/* Resume Upload Toggle */}
            {showUploader && (
              <div className="form-group fade-in">
                <div className="label-editorial">
                  <FileText size={14} /> RESUME SOURCE
                </div>
                <div className="upload-minimal">
                   <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded border border-gray-600 block text-center transition">
                      UPLOAD PDF
                      <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                   </label>
                </div>
              </div>
            )}

            {/* Target Role */}
            <div className="form-group">
              <div className="label-editorial">
                <Briefcase size={14} /> TARGET ROLE
              </div>
              <input
                name="role"
                className="input-editorial"
                placeholder="E.G. SENIOR PRODUCT MANAGER"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>

            {/* Settings Grid */}
            <div className="settings-grid">
              
              {/* Experience */}
              <div className="form-group">
                <label className="label-editorial">EXPERIENCE</label>
                <div className="radio-group">
                  {['0-2 YEARS', '3-5 YEARS', '5+ YEARS'].map(exp => (
                    <button
                      key={exp}
                      type="button"
                      className={`radio-btn ${formData.experience === exp.toLowerCase() ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('experience', exp.toLowerCase())}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="form-group">
                <label className="label-editorial">FOCUS</label>
                <div className="radio-group">
                  {['TECHNICAL', 'BEHAVIORAL', 'MIXED'].map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`radio-btn ${formData.type === type ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect('type', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Intensity Slider */}
            <div className="form-group mt-4">
               <div className="slider-header">
                  <div className="label-editorial"><Sliders size={14}/> INTENSITY</div>
                  <span className="slider-val">{formData.questionCount} QUESTIONS</span>
               </div>
               <input 
                 type="range" 
                 name="questionCount" 
                 min="3" max="10" step="1"
                 value={formData.questionCount}
                 onChange={handleChange}
                 className="slider-editorial"
               />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-editorial primary mt-8 flex items-center justify-center gap-2"
            >
              {loading ? "INITIALIZING..." : <>INITIATE SESSION <ArrowRight size={16} /></>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;