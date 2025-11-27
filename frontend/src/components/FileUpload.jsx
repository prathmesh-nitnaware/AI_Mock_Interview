import React, { useState } from 'react';

const FileUpload = ({ onFileUpload, accept = ".pdf", maxSize = 5 * 1024 * 1024, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (accept && !file.type.includes('pdf')) {
      alert('Please upload a PDF file only');
      return;
    }

    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
    onFileUpload(file);
  };

  const handleClick = () => {
    document.getElementById('file-upload-input').click();
  };

  return (
    <div className="upload-section">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        <div className="upload-icon">
          {loading ? '⏳' : '📄'}
        </div>
        <h3>{loading ? 'Uploading Resume...' : 'Upload Your Resume'}</h3>
        <p>Drag & drop your PDF file here or click to browse</p>
        <p className="file-requirements">Supported format: PDF (Max 5MB)</p>
        
        {selectedFile && (
          <div className="file-info">
            <strong>Selected file:</strong> {selectedFile.name}
            <br />
            <small>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
          </div>
        )}

        <input
          id="file-upload-input"
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={loading}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default FileUpload;