import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Play, Square, ArrowLeft, Mic, MicOff, Send, CheckCircle, Video, VideoOff } from 'lucide-react';
import './InterviewLive.css'; 

const InterviewLive = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data & Config
  const initialQuestion = location.state?.question;
  const config = location.state?.config || { role: "General", intensity: 3 }; 

  const [question, setQuestion] = useState(initialQuestion || { title: "Loading...", description: "Initializing..." });
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
  const streamRef = useRef(null); // Holds camera stream for cleanup

  // --- INITIALIZATION & CLEANUP ---
  useEffect(() => {
    // 1. Setup Speech Recognition
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

    // 2. Start Camera
    startCamera();

    // 3. Auto-Speak
    if (question?.description) setTimeout(() => speakText(question.description), 1000);
    
    // --- CRITICAL CLEANUP ---
    return () => { 
        console.log("Cleaning up Live Session...");
        
        // A. Stop AI Voice
        cancelAiSpeech();
        
        // B. Stop Camera Stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            streamRef.current = null;
        }

        // C. Stop Microphone (Speech Recognition)
        if (recognitionRef.current) {
            recognitionRef.current.abort(); // Force stop
            recognitionRef.current = null;
        }
    };
  }, []);

  const startCamera = async () => {
      try {
          // Note: audio is false here because speech recognition handles the mic
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

  // ... (Keep existing Logic Handlers: handleNextQuestion, handleSubmit, speakText, etc.) ...
  // ... (Paste the rest of the logic logic functions from the previous response here) ...

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

  // --- RENDER ---
  return (
    <div className="live-container">
      <div className="question-panel">
        <div className="panel-header">
           <span className="ai-label">Question {questionIndex} / {config.intensity}</span>
           <button onClick={() => navigate('/dashboard')} className="back-btn"><ArrowLeft size={16}/> Quit</button>
        </div>
        
        <div className={`ai-avatar-container ${isAiSpeaking ? 'pulsing' : ''}`}>
            <div className="ai-circle"><div className="wave"></div></div>
            <p className="ai-status-text">
                {loadingNext ? "GENERATING..." : isAiSpeaking ? "AI SPEAKING..." : "AI LISTENING..."}
            </p>
            {isListening && <div className="analyzing-badge">● Analyzing Tone & Clarity</div>}
        </div>

        {!loadingNext && (
            <>
                <h1 className="problem-title">{question.title}</h1>
                <div className="desc-box"><p>{question.description}</p></div>
                <div className="ai-controls">
                    <button onClick={() => speakText(question.description)} className="control-btn"><Play size={20} /> Replay</button>
                    <button onClick={cancelAiSpeech} className="control-btn"><Square size={20} /> Stop</button>
                </div>
            </>
        )}
      </div>

      <div className="interaction-panel">
        <div className="interaction-header">
            <h2>Your Answer</h2>
            <div className="live-metrics">
                {isListening && (
                    <>
                        <span>WPM: {Math.round((userAnswer.split(" ").length / ((Date.now() - speechStartTime)/1000)) * 60) || 0}</span>
                        <span>Fillers: {fillerWordCount}</span>
                    </>
                )}
            </div>
        </div>
        
        <textarea 
            className="transcript-box"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Tap the mic and speak naturally..."
            disabled={submitting || loadingNext}
        />
        
        <div className="voice-controls">
            <button onClick={toggleListening} className={`mic-btn ${isListening ? 'active' : ''}`}>
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <p className="hint-text">{isListening ? "Listening..." : "Tap Mic to Answer"}</p>
        </div>

        <button onClick={handleSubmit} disabled={submitting || !userAnswer || loadingNext} className="submit-voice-btn">
            {submitting ? "Analyzing..." : <> <Send size={18}/> Submit Response </>}
        </button>

        {aiFeedback && (
          <div className="feedback-overlay">
            <div className="feedback-card">
              <h2>AI Analysis</h2>
              <div className="score-row">
                 <div className="score-item"><span className="label">Clarity</span><span className="value green">{aiFeedback.clarity_score}/10</span></div>
                 <div className="score-item"><span className="label">Confidence</span><span className="value blue">{aiFeedback.confidence_score}/10</span></div>
              </div>
              <p className="feedback-text">{aiFeedback.feedback}</p>
              
              <button onClick={handleNextQuestion} className="continue-btn">
                  {questionIndex >= config.intensity ? "View Final Report" : "Next Question →"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="self-view-container">
        {cameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="self-video" />
        ) : (
            <div className="camera-off-placeholder"><VideoOff size={24} color="#666" /><span>Camera Off</span></div>
        )}
        <button onClick={toggleCamera} className="toggle-cam-btn" title="Toggle Camera">
            {cameraActive ? <Video size={16}/> : <VideoOff size={16}/>}
        </button>
      </div>

    </div>
  );
};

export default InterviewLive;