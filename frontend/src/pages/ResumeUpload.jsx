import React, { useState } from 'react';
import { scoreResume } from '../services/api'; // <--- FIX 1: Import the specific function
import './Dashboard.css'; // Assuming you saved the CSS from the previous step here
import "./ResumeUpload.css";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // --- FIX 2: Call the correct function directly ---
      // You can change "Software Engineer" to a dynamic job description input if you want
      const data = await scoreResume(file, "Software Engineer");
      
      setResult(data);
    } catch (err) {
      console.error("Upload Error:", err);
      setError("Analysis failed. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="title">ATS OPTIMIZER</h1>
      <p className="subtitle">
        Upload your CV to unlock AI-driven insights. Our engine parses formatting, keywords, and impact metrics.
      </p>

      {/* Upload Section */}
      <div className="upload-box">
        {!file ? (
           <label className="upload-label">
             <span style={{fontSize: '2rem', marginBottom: '10px'}}>+</span>
             <span>Click to Upload PDF</span>
             <input 
               type="file" 
               accept=".pdf" 
               className="hidden" 
               style={{display:'none'}} 
               onChange={handleFileChange} 
             />
           </label>
        ) : (
          <div className="file-info">
             <div style={{display:'flex', alignItems:'center'}}>
                <span style={{fontSize: '1.5rem', marginRight: '10px'}}>📄</span>
                <span style={{fontWeight: '600'}}>{file.name}</span>
             </div>
             <button onClick={() => setFile(null)} className="remove-btn">✕</button>
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button 
          onClick={handleUpload} 
          disabled={loading || !file}
          className="analyze-btn"
        >
          {loading ? "ANALYZING..." : "START ANALYSIS →"}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="results-section">
          
          {/* Score Card */}
          <div className="card">
            <span className="card-title">ATS Score</span>
            <div className={`score-value ${result.score > 70 ? 'score-high' : result.score > 40 ? 'score-med' : 'score-low'}`}>
              {result.score}/100
            </div>
          </div>

          {/* Tips Card */}
          <div className="card">
            <span className="card-title">Improvement Tips</span>
            <ul className="tips-list">
              {result.improvement_tips?.slice(0, 3).map((tip, index) => (
                <li key={index}>
                  <span className="bullet">•</span>
                  {tip}
                </li>
              )) || <li>No specific tips returned.</li>}
            </ul>
          </div>
          
           {/* Summary Card */}
           <div className="card full-width">
            <span className="card-title">Executive Summary</span>
            <p style={{color: '#d1d5db', lineHeight: '1.6'}}>
              {result.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;