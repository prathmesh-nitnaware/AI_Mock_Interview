import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
import { Code, FileText, Check, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import './InterviewSetup.css'; // Reusing the same nice styles

const CodingSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState(localStorage.getItem('last_resume_text') || "");
  const [showUploader, setShowUploader] = useState(!resumeText);

  const [config, setConfig] = useState({
    role: "Backend Developer", // Default
    language: "Python",
    difficulty: "Medium"
  });

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await api.scoreResume(file, "General");
      if (data.extracted_text) {
          setResumeText(data.extracted_text);
          localStorage.setItem('last_resume_text', data.extracted_text);
          setShowUploader(false);
      }
    } catch (err) {
      alert("Resume parse failed.");
    }
  };

  const startCoding = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // We reuse the existing /initiate endpoint but with focus="Coding"
      const sessionConfig = {
        role: config.role,
        experience: config.difficulty, // Mapping difficulty to experience for AI context
        focus: "Coding", // <--- This tells AI to give a coding problem
        intensity: 1,    // Just 1 problem at a time for practice
        resume_context: resumeText
      };

      const data = await api.startInterview(sessionConfig);
      
      if (data) {
        navigate('/coding/arena', { 
            state: { question: data, config: sessionConfig } 
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate problem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-root page-container">
      <div className="setup-visual">
        <h1 className="visual-title">CODING <br/> ARENA</h1>
        <div className={`context-widget ${resumeText ? 'active' : ''}`}>
           {resumeText ? "RESUME CONTEXT ACTIVE" : "NO RESUME CONTEXT"}
        </div>
      </div>

      <div className="setup-form-wrapper">
        <div className="setup-card-editorial">
          <form onSubmit={startCoding}>
            {showUploader && (
              <div className="form-group">
                 <label className="label-editorial">RESUME SOURCE</label>
                 <div className="upload-minimal">
                    <label className="cursor-pointer bg-gray-800 text-white py-2 px-4 rounded block text-center">
                       UPLOAD PDF
                       <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                    </label>
                 </div>
              </div>
            )}

            <div className="form-group">
               <label className="label-editorial">PREFERRED LANGUAGE</label>
               <div className="radio-group">
                  {['Python', 'JavaScript', 'Java', 'C++'].map(lang => (
                    <button type="button" key={lang} 
                      className={`radio-btn ${config.language === lang ? 'selected' : ''}`}
                      onClick={() => setConfig({...config, language: lang})}
                    >{lang}</button>
                  ))}
               </div>
            </div>

            <div className="form-group">
               <label className="label-editorial">DIFFICULTY</label>
               <div className="radio-group">
                  {['Easy', 'Medium', 'Hard'].map(diff => (
                    <button type="button" key={diff} 
                      className={`radio-btn ${config.difficulty === diff ? 'selected' : ''}`}
                      onClick={() => setConfig({...config, difficulty: diff})}
                    >{diff}</button>
                  ))}
               </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-editorial primary mt-8">
              {loading ? "GENERATING PROBLEM..." : "ENTER CODING ARENA →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodingSetup;