import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Play, Square, ArrowLeft, Mic, MicOff, Send, 
  Video, VideoOff, Activity, MessageSquareWarning, Zap 
} from 'lucide-react';
import './InterviewLive.css'; 

const InterviewLive = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data & Config
  const initialQuestion = location.state?.question;
  const config = location.state?.config || { role: "General", intensity: 3 }; 

  const [question, setQuestion] = useState(initialQuestion || { title: "Loading...", description: "Initializing environment..." });
  const [sessionHistory, setSessionHistory] = useState([]); 
  const [questionIndex, setQuestionIndex] = useState(1);
  const [loadingNext, setLoadingNext] = useState(false);

  // Interaction State
  const [userAnswer, setUserAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  
  // Metrics
  const [speechStartTime, setSpeechStartTime] = useState(null);
  const [speechConfidence, setSpeechConfidence] = useState(0.8);
  const [fillerWordCount, setFillerWordCount] = useState(0);

  // Media State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null); 

  // --- INITIALIZATION & CLEANUP ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
            const results = Array.from(event.results);
            const transcript = results.map(result => result[0].transcript).join('');
            const confidence = results[results.length - 1][0].confidence;
            
            setUserAnswer(transcript);
            setSpeechConfidence(confidence);
            const fillers = (transcript.match(/\b(um|uh|like|you know|sort of)\b/gi) || []).length;
            setFillerWordCount(fillers);
        };
    }

    startCamera();
    if (question?.description) setTimeout(() => speakText(question.description), 1000);
    
    return () => { 
        cancelAiSpeech();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            streamRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.abort(); 
            recognitionRef.current = null;
        }
    };
  }, []);

  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCameraActive(true);
      } catch (err) {
          console.error("Camera Error:", err);
          setCameraActive(false);
      }
  };

  const toggleCamera = () => {
      if (cameraActive) {
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
          }
          setCameraActive(false);
      } else {
          startCamera();
      }
  };

  const handleNextQuestion = async () => {
    cancelAiSpeech();
    setAiFeedback(null);
    setUserAnswer("");
    setFillerWordCount(0);

    if (questionIndex >= config.intensity) {
        navigate('/interview/report', { state: { history: sessionHistory, config: config } });
        return;
    }

    setLoadingNext(true);
    try {
        const nextQ = await api.fetchNextQuestion({
            role: config.role,
            experience: config.experience,
            focus: config.focus,
            resume_context: config.resume_context,
            current_question: question.title
        });
        setQuestion(nextQ);
        setQuestionIndex(prev => prev + 1);
        setTimeout(() => speakText(nextQ.description), 1000);
    } catch (error) {
        alert("Error loading next question.");
    } finally {
        setLoadingNext(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        setUserAnswer("");
        setSpeechStartTime(Date.now());
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    if (isListening) toggleListening();
    
    const durationSec = (Date.now() - speechStartTime) / 1000;
    const wordCount = userAnswer.split(" ").length;
    const wpm = Math.round((wordCount / durationSec) * 60) || 0;

    setSubmitting(true);
    try {
      const response = await api.submitCode({
        code: userAnswer, 
        question_title: question.title,
        mode: "verbal",
        metrics: { wpm, filler_words: fillerWordCount, confidence: speechConfidence, duration: durationSec }
      });
      
      const review = response.review;
      setAiFeedback(review);
      setSessionHistory(prev => [...prev, {
          question: question.title,
          answer: userAnswer,
          feedback: review,
          metrics: { wpm, filler_words: fillerWordCount }
      }]);
      
      if(review?.feedback) speakText(review.feedback);
    } catch (error) {
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  
  const cancelAiSpeech = () => {
    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);
  };

  const currentWPM = isListening && speechStartTime 
    ? Math.round((userAnswer.split(" ").length / ((Date.now() - speechStartTime)/1000)) * 60) || 0 
    : 0;

  return (
    <div className="live-container">
      
      {/* --- LEFT PANEL: AI CONTEXT --- */}
      <div className="question-panel">
        <div className="panel-header">
           <button onClick={() => navigate('/dashboard')} className="glass-btn back-btn">
             <ArrowLeft size={16}/> End Session
           </button>
           <div className="progress-pill">
              <Zap size={14} className="text-indigo-400" />
              <span>{questionIndex} / {config.intensity}</span>
           </div>
        </div>
        
        <div className={`ai-avatar-wrapper ${isAiSpeaking ? 'is-speaking' : ''} ${isListening ? 'is-listening' : ''}`}>
            <div className="ai-orb"></div>
            <div className="orb-glow"></div>
            <div className="orb-ring ring-1"></div>
            <div className="orb-ring ring-2"></div>
        </div>
        
        <div className="ai-status">
            <span className="status-dot"></span>
            {loadingNext ? "Synthesizing next prompt..." : isAiSpeaking ? "PrepAI is speaking..." : isListening ? "Listening to your response..." : "Awaiting your interaction"}
        </div>

        {!loadingNext && (
            <div className="question-content fade-in-up">
                <h1 className="problem-title">{question.title}</h1>
                <p className="desc-box">{question.description}</p>
                <div className="ai-controls">
                    <button onClick={() => speakText(question.description)} className="glass-btn"><Play size={16} /> Replay Audio</button>
                    <button onClick={cancelAiSpeech} className="glass-btn"><Square size={16} /> Stop</button>
                </div>
            </div>
        )}
      </div>

      {/* --- RIGHT PANEL: USER INTERACTION --- */}
      <div className="interaction-panel">
        <div className="interaction-header">
            <h2 className="section-title">Live Transcript</h2>
            <div className="live-metrics-container">
                <div className="metric-pill">
                    <Activity size={14} />
                    <span>{currentWPM} WPM</span>
                </div>
                <div className={`metric-pill ${fillerWordCount > 3 ? 'warn' : ''}`}>
                    <MessageSquareWarning size={14} />
                    <span>{fillerWordCount} Fillers</span>
                </div>
            </div>
        </div>
        
        <div className={`transcript-wrapper ${isListening ? 'recording' : ''}`}>
            <textarea 
                className="transcript-box"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Tap the microphone to begin speaking. Your words will appear here..."
                disabled={submitting || loadingNext}
            />
        </div>
        
        <div className="action-dock">
            <div className="voice-controls">
                <button 
                  onClick={toggleListening} 
                  className={`mic-trigger ${isListening ? 'active' : ''}`}
                >
                    {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>
                <p className="hint-text">{isListening ? "Tap to pause" : "Tap to speak"}</p>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !userAnswer || loadingNext} className="submit-btn-modern">
                {submitting ? "Analyzing Response..." : <> Submit Answer <Send size={16}/> </>}
            </button>
        </div>

        {/* --- FEEDBACK OVERLAY --- */}
        {aiFeedback && (
          <div className="feedback-glass-overlay fade-in">
            <div className="feedback-card-modern scale-in">
              <div className="fc-header">
                <h2>AI Evaluation</h2>
                <div className="score-badges">
                  <div className="s-badge clarity">Clarity: {aiFeedback.clarity_score}/10</div>
                  <div className="s-badge confidence">Confidence: {aiFeedback.confidence_score}/10</div>
                </div>
              </div>
              
              <div className="fc-body">
                <p className="feedback-text">{aiFeedback.feedback}</p>
              </div>
              
              <button onClick={handleNextQuestion} className="next-q-btn">
                  {questionIndex >= config.intensity ? "Conclude Interview & View Report" : "Proceed to Next Question"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- PIP CAMERA --- */}
      <div className="self-view-floating">
        {cameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="self-video" />
        ) : (
            <div className="camera-off-placeholder">
              <VideoOff size={20} className="mb-2 opacity-50" />
              <span>Camera Disabled</span>
            </div>
        )}
        <button onClick={toggleCamera} className="mini-glass-btn toggle-cam" title="Toggle Camera">
            {cameraActive ? <Video size={14}/> : <VideoOff size={14}/>}
        </button>
      </div>

    </div>
  );
};

export default InterviewLive;