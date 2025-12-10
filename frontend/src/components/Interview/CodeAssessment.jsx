import React, { useState } from 'react';
import Editor from "@monaco-editor/react"; 
import { getDSAQuestion, generateResumeQuestion, submitCode } from '../../services/api'; 

const CodeAssessment = () => {
  const [stage, setStage] = useState('selection'); // 'selection', 'loading', 'coding'
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("# Write your solution here...\n\ndef solve():\n    pass");
  const [review, setReview] = useState(null); // Stores the AI feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- HANDLERS ---
  
  const handleDifficultySelect = async (level) => {
    setStage('loading');
    setError(null);
    try {
      const data = await getDSAQuestion(level); 
      setQuestion(data);
      setStage('coding');
    } catch (err) {
      console.error(err);
      setError("Failed to load DSA question.");
      setStage('selection');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStage('loading');
    setError(null);
    try {
      const data = await generateResumeQuestion(file);
      setQuestion(data);
      setStage('coding');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume.");
      setStage('selection');
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    try {
      const response = await submitCode({
        code: code,
        question_title: question?.title || "Unknown"
      });
      
      // The backend returns { success: true, review: { ... } }
      setReview(response.review);
    } catch (err) {
      console.error(err);
      alert("Submission failed. Check backend console.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER FUNCTIONS ---

  if (stage === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl font-semibold">Preparing Interview Environment...</h2>
      </div>
    );
  }

  if (stage === 'selection') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-8">Select Interview Mode</h1>
        
        {error && <div className="bg-red-600 text-white p-3 rounded mb-6">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Card 1: DSA */}
          <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition border border-gray-700">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">General DSA</h3>
            <p className="text-gray-400 mb-6">Practice standard algorithm problems.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDifficultySelect('easy')} className="px-4 py-2 bg-green-600 rounded font-bold hover:bg-green-500">Easy</button>
              <button onClick={() => handleDifficultySelect('medium')} className="px-4 py-2 bg-yellow-600 rounded font-bold hover:bg-yellow-500">Medium</button>
              <button onClick={() => handleDifficultySelect('hard')} className="px-4 py-2 bg-red-600 rounded font-bold hover:bg-red-500">Hard</button>
            </div>
          </div>

          {/* Card 2: Resume */}
          <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition border border-gray-700">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Resume Based</h3>
            <p className="text-gray-400 mb-6">AI generates a unique question based on your skills.</p>
            <label className="block w-full cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-center py-3 rounded font-bold transition">
              Upload Resume (PDF)
              <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
            </label>
          </div>
        </div>
      </div>
    );
  }

  // --- EDITOR STAGE ---
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left: Question Panel */}
      <div className="w-1/3 p-6 border-r border-gray-700 overflow-y-auto bg-gray-800">
        <button onClick={() => setStage('selection')} className="text-sm text-gray-400 hover:text-white mb-4">← Back to Menu</button>
        <h2 className="text-2xl font-bold mb-4 text-white">{question?.title}</h2>
        <div className="prose prose-invert mb-6">
          <p className="text-gray-300">{question?.description}</p>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg mb-4">
          <h4 className="font-bold text-gray-400 text-sm uppercase mb-2">Input Format</h4>
          <code className="text-green-400 font-mono text-sm">{question?.input_format || "N/A"}</code>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <h4 className="font-bold text-gray-400 text-sm uppercase mb-2">Output Format</h4>
          <code className="text-green-400 font-mono text-sm">{question?.output_format || "N/A"}</code>
        </div>
      </div>

      {/* Right: Code Editor */}
      <div className="w-2/3 flex flex-col relative">
        <Editor 
          height="90%" 
          defaultLanguage="python" 
          value={code}
          onChange={(val) => setCode(val)}
          theme="vs-dark"
          options={{ fontSize: 16, minimap: { enabled: false }, padding: { top: 20 } }}
        />
        
        <div className="h-[10%] bg-gray-800 border-t border-gray-700 flex items-center justify-end px-6">
          <button 
            onClick={handleSubmitCode}
            disabled={submitting}
            className={`px-8 py-3 rounded font-bold text-white transition ${
              submitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {submitting ? 'Analyzing...' : 'Submit & Review'}
          </button>
        </div>

        {/* --- REVIEW MODAL (OVERLAY) --- */}
        {review && (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
              <div className="bg-gray-700 p-4 border-b border-gray-600 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">AI Code Review</h3>
                <button onClick={() => setReview(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="col-span-1 bg-gray-900 p-4 rounded text-center">
                  <span className="block text-gray-400 text-sm uppercase">Correctness</span>
                  <span className={`text-xl font-bold ${review.correctness === 'Yes' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {review.correctness}
                  </span>
                </div>
                <div className="col-span-1 bg-gray-900 p-4 rounded text-center">
                  <span className="block text-gray-400 text-sm uppercase">Rating</span>
                  <span className="text-xl font-bold text-blue-400">{review.rating}</span>
                </div>
                <div className="col-span-2">
                   <span className="block text-gray-400 text-sm uppercase mb-1">Time Complexity</span>
                   <code className="bg-gray-900 px-2 py-1 rounded text-pink-400">{review.time_complexity}</code>
                </div>
                <div className="col-span-2">
                   <span className="block text-gray-400 text-sm uppercase mb-2">Feedback</span>
                   <p className="text-gray-300 leading-relaxed bg-gray-900 p-4 rounded">{review.feedback}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-700 text-right">
                <button 
                  onClick={() => setReview(null)}
                  className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200"
                >
                  Back to Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAssessment;