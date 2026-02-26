import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  ShieldCheck, 
  Settings2,
  AlertTriangle
} from 'lucide-react';
import './InterviewSession.css';

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Data from Setup
  const questionData = location.state?.question;
  const sessionConfig = location.state?.config;

  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // Hardware States
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Simulate a brief "checking" phase for UX
        setTimeout(() => {
            setHasPermissions(true);
            setIsChecking(false);
        }, 1200);

      } catch (err) {
        console.error("Permission Error:", err);
        setPermissionError("Hardware access denied. Please enable your camera and microphone in your browser settings.");
        setIsChecking(false);
      }
    };

    if (!questionData) {
       console.warn("No session data found. The interview might crash if forced.");
    }

    getPermissions();

    // --- CLEANUP ---
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop(); 
          track.enabled = false;
        });
      }
    };
  }, [questionData]);

  // Toggle Handlers
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraOn;
        setCameraOn(!cameraOn);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const startActualInterview = () => {
    navigate('/interview/live', { 
      state: { 
        question: questionData,
        config: sessionConfig 
      } 
    });
  };

  if (permissionError) {
    return (
      <div className="lobby-container flex-center">
        <div className="error-card">
            <AlertTriangle size={48} className="error-icon" />
            <h2>Access Denied</h2>
            <p>{permissionError}</p>
            <button onClick={() => window.location.reload()} className="btn-retry">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container fade-in">
      <div className="lobby-grid">
        
        {/* LEFT: Video Preview */}
        <div className="preview-panel">
          <div className="panel-header">
             <Settings2 size={18} />
             <span>Hardware Configuration</span>
          </div>

          <div className={`video-wrapper ${!cameraOn ? 'cam-off-bg' : ''}`}>
            {cameraOn ? (
               <video ref={videoRef} autoPlay playsInline muted className="live-video" />
            ) : (
               <div className="cam-off-state">
                  <div className="avatar-placeholder"></div>
                  <span>Camera Disabled</span>
               </div>
            )}
            
            {/* Floating Controls inside video */}
            <div className="controls-overlay">
              <button onClick={toggleMic} className={`control-btn ${!micOn ? 'off' : ''}`} title="Toggle Mic">
                 {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button onClick={toggleCamera} className={`control-btn ${!cameraOn ? 'off' : ''}`} title="Toggle Camera">
                 {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>
          
          <div className="audio-visualizer-box">
             <span className="av-label">Mic Input</span>
             {micOn ? (
                 <div className="equalizer">
                    <span className="bar b1"></span>
                    <span className="bar b2"></span>
                    <span className="bar b3"></span>
                    <span className="bar b4"></span>
                    <span className="bar b5"></span>
                 </div>
             ) : (
                 <span className="av-muted">Muted</span>
             )}
          </div>
        </div>

        {/* RIGHT: Pre-flight Checklist */}
        <div className="checklist-panel">
          <div className="checklist-content">
              <div className="badge-system">PRE-FLIGHT</div>
              <h1 className="lobby-title">System Check</h1>
              <p className="lobby-sub">Please verify your hardware and environment before initializing the AI simulation.</p>

              <div className="checklist-items">
                 <div className="check-item slide-in" style={{ animationDelay: '0.2s' }}>
                    {isChecking ? <div className="loader-ring"></div> : <CheckCircle2 size={24} className="text-success" />}
                    <div className="ci-text">
                       <strong>Video Feed</strong>
                       <span>{isChecking ? 'Detecting camera...' : cameraOn ? 'Camera active and secure' : 'Camera disabled (Optional)'}</span>
                    </div>
                 </div>

                 <div className="check-item slide-in" style={{ animationDelay: '0.4s' }}>
                    {isChecking ? <div className="loader-ring"></div> : <CheckCircle2 size={24} className="text-success" />}
                    <div className="ci-text">
                       <strong>Audio Input</strong>
                       <span>{isChecking ? 'Detecting microphone...' : micOn ? 'Microphone active' : 'Microphone muted (Action required)'}</span>
                    </div>
                 </div>

                 <div className="check-item slide-in" style={{ animationDelay: '0.6s' }}>
                    <ShieldCheck size={24} className="text-indigo" />
                    <div className="ci-text">
                       <strong>Environment</strong>
                       <span>Ensure you are in a quiet, well-lit room.</span>
                    </div>
                 </div>
              </div>
          </div>

          <div className="action-area slide-in" style={{ animationDelay: '0.8s' }}>
            {hasPermissions && !isChecking ? (
              <button 
                onClick={startActualInterview} 
                className="btn-enter-studio"
                disabled={!micOn} // Prevent entering if mic is explicitly muted
              >
                {micOn ? (
                   <> ENTER STUDIO <ArrowRight size={18} /> </>
                ) : (
                   "UNMUTE TO ENTER"
                )}
              </button>
            ) : (
              <button disabled className="btn-loading">
                 <div className="loader-ring small"></div> Checking Systems...
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InterviewSession;