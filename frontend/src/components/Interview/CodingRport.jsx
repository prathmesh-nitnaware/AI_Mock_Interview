import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Trophy } from 'lucide-react';

const CodingReport = () => {
  return (
    <div className="page-container fade-in">
      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-editorial text-center p-12">
          <div className="icon-glow-circle mb-6" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
            <Trophy size={40} className="text-indigo" />
          </div>
          
          <h1 className="text-editorial-h1">Challenge Complete!</h1>
          <p className="text-muted mb-8">Your code has been submitted and evaluated by our AI engine.</p>

          <div className="stats-mini-grid mb-8">
            <div className="mini-stat glass-panel">
              <span className="ms-val text-green">100%</span>
              <span className="ms-label">TEST CASES</span>
            </div>
            <div className="mini-stat glass-panel">
              <span className="ms-val">O(n)</span>
              <span className="ms-label">EFFICIENCY</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/dashboard" className="btn btn-secondary">
               <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <Link to="/coding/setup" className="btn btn-primary">
               Try Another One
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingReport;