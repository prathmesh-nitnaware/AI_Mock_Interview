import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, Video, VideoOff, MicOff, ArrowRight } from 'lucide-react';
import './InterviewSession.css'; // We will create this CSS next

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // The question data passed from the Setup page
  const questionData = location.state?.question;

  // States
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // 1. Request Media Permissions on Mount
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermissions(true);
      } catch (err) {
        console.error("Permission Error:", err);
        setPermissionError("Camera/Microphone access denied. Please enable permissions to proceed.");
      }
    };

    getPermissions();

    // Cleanup: Stop stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Toggle Handlers
  const toggleMic = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const audioTrack = videoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const startActualInterview = () => {
    // Navigate to your actual coding/interview arena, passing the stream/state if needed
    // For now, let's assume we render the Question View right here or navigate to Arena
    navigate('/coding/arena', { state: { question: questionData } });
  };

  // --- RENDER: PERMISSION DENIED ---
  if (permissionError) {
    return (
      <div className="session-container error-state">
        <h2>Access Denied</h2>
        <p>{permissionError}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">Try Again</button>
      </div>
    );
  }

  // --- RENDER: PERMISSION CHECK & PREVIEW ---
  return (
    <div className="session-container">
      <div className="preview-card">
        <h1 className="preview-title">System Check</h1>
        <p className="preview-sub">Ensure your camera and microphone are working before entering.</p>

        {/* Video Preview */}
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay playsInline muted className="live-video" />
          
          <div className="controls-overlay">
            <button onClick={toggleMic} className={`control-btn ${!micOn ? 'off' : ''}`}>
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button onClick={toggleCamera} className={`control-btn ${!cameraOn ? 'off' : ''}`}>
              {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          </div>
        </div>

        {/* Ready Button */}
        <div className="action-area">
          {hasPermissions ? (
            <button onClick={startActualInterview} className="btn-start-interview">
              JOIN SESSION <ArrowRight size={18} />
            </button>
          ) : (
            <button disabled className="btn-loading">Checking Devices...</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;