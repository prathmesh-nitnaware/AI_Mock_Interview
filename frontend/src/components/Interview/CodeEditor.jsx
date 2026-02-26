import React, { useState } from 'react';
import Editor from "@monaco-editor/react";
import { ChevronLeft, Send, TerminalSquare } from 'lucide-react';
import './CodeEditor.css';

const CodeEditor = ({ question, onSubmit, onBack, submitting }) => {
  // Default code template
  const [code, setCode] = useState("# Write your optimal solution here...\n\ndef solve():\n    pass");

  const handleSubmit = () => {
    // Pass the current code back to the parent component to handle the API call
    if (onSubmit) onSubmit(code);
  };

  return (
    <div className="code-editor-root fade-in">
      
      {/* --- LEFT PANEL: Problem Statement --- */}
      <div className="problem-sidebar">
        
        <div className="ps-header">
          <button onClick={onBack} className="btn-back-ghost">
            <ChevronLeft size={16} /> End Session
          </button>
        </div>
        
        <div className="ps-content">
          <div className="brand-pill mb-4">
             <TerminalSquare size={14} className="text-indigo" />
             <span>PROBLEM STATEMENT</span>
          </div>
          
          <h2 className="q-title">{question?.title || "Loading Problem..."}</h2>
          
          <div className="q-desc">
            <p>{question?.description || "Awaiting problem description from the server."}</p>
          </div>
          
          <div className="io-blocks mt-8">
            <div className="io-block">
              <h4>Input Format</h4>
              <code>{question?.input_format || "Standard STDIN"}</code>
            </div>
            <div className="io-block">
              <h4>Expected Output</h4>
              <code>{question?.output_format || "Standard STDOUT"}</code>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: Monaco IDE --- */}
      <div className="ide-main-panel">
        
        {/* Fake IDE Tab Bar */}
        <div className="ide-header">
           <div className="ide-tabs">
             <span className="ide-tab active">solution.py</span>
           </div>
           <div className="ide-actions">
             <span className="text-mono text-muted text-xs">Python 3.10 environment</span>
           </div>
        </div>
        
        {/* Actual Editor */}
        <div className="editor-container">
          <Editor 
            height="100%" 
            defaultLanguage="python" 
            value={code}
            onChange={(val) => setCode(val)}
            theme="vs-dark"
            options={{ 
                fontSize: 15, 
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                minimap: { enabled: false }, 
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth"
            }}
          />
        </div>
        
        {/* Footer / Submit Action */}
        <div className="ide-footer">
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-glow-submit"
          >
            {submitting ? "EXECUTING TEST CASES..." : <> SUBMIT FOR AI REVIEW <Send size={16} /> </>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CodeEditor;