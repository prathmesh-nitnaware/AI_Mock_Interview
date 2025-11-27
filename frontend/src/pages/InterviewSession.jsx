import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import Navbar from '../components/Navbar';

const InterviewSession = () => {
  const navigate = useNavigate();
  
  // --- State ---
  const [step, setStep] = useState('upload'); // 'upload', 'setup', 'interview', 'submitting'
  const [interviewPlan, setInterviewPlan] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Refs for Media Capture ---
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // --- Data Collection for Submission ---
  // We store data for EACH turn here
  const [collectedData, setCollectedData] = useState({
    turnMetadata: [], // [{ question_text, audio_file_key, cv_scores_key }]
    audioBlobs: [],   // [Blob, Blob]
    cvScoreFiles: []  // [Blob (json), Blob (json)]
  });

  // Temporary storage for the CURRENT turn's CV scores
  const [currentCvScores, setCurrentCvScores] = useState([]);

  // --- 1. Resume Upload & Plan Generation ---
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      // Call backend to generate questions
      const data = await interviewAPI.startSession(file, "medium", 3);
      setInterviewPlan(data.interview_plan);
      setStep('setup');
    } catch (err) {
      setError('Failed to generate interview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Audio Playback ---
  const playQuestionAudio = (b64Audio) => {
    if (!b64Audio) return;
    const audio = new Audio(`data:audio/mp3;base64,${b64Audio}`);
    audio.play().catch(e => console.error("Audio play error:", e));
  };

  // --- 3. Start Interview ---
  const startInterview = () => {
    setStep('interview');
    setCurrentQuestionIndex(0);
    // Small delay to let UI render before playing audio
    setTimeout(() => {
      playQuestionAudio(interviewPlan[0].question_audio_b64);
    }, 500);
  };

  // --- 4. CV Analysis Loop (Runs while recording) ---
  useEffect(() => {
    let intervalId;
    if (isRecording && step === 'interview') {
      intervalId = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            try {
              // Convert base64 image to blob for upload
              const res = await fetch(imageSrc);
              const blob = await res.blob();
              
              // Send to backend for analysis
              const analysis = await interviewAPI.sendFrame(blob);
              
              // Save the scores: [posture, eye_contact, blink]
              const scoreEntry = [
                analysis.posture_score, 
                analysis.eye_contact ? 1 : 0, 
                analysis.blink_detected ? 1 : 0
              ];
              setCurrentCvScores(prev => [...prev, scoreEntry]);
            } catch (err) {
              console.warn("Frame analysis failed", err);
            }
          }
        }
      }, 1000); // Analyze 1 frame per second
    }
    return () => clearInterval(intervalId);
  }, [isRecording, step]);

  // --- 5. Recording Logic ---
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setCurrentCvScores([]); // Reset scores for this new answer
    audioChunksRef.current = []; // Reset audio buffer

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          finalizeTurn(audioBlob);
        };

        mediaRecorderRef.current.start();
      })
      .catch(err => setError("Microphone access denied: " + err.message));
  }, [interviewPlan, currentQuestionIndex]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- 6. Finalize Turn (Save data) ---
  const finalizeTurn = (audioBlob) => {
    const currentQ = interviewPlan[currentQuestionIndex];
    const idx = currentQuestionIndex;

    // Create JSON blob for CV scores
    const cvBlob = new Blob([JSON.stringify(currentCvScores)], { type: 'application/json' });

    // Update our collected data
    setCollectedData(prev => ({
      turnMetadata: [...prev.turnMetadata, {
        question_text: currentQ.question_text,
        audio_file_key: `audio_${idx}.wav`,
        cv_scores_key: `cv_scores_${idx}.json`
      }],
      audioBlobs: [...prev.audioBlobs, audioBlob],
      cvScoreFiles: [...prev.cvScoreFiles, cvBlob]
    }));

    // Move to next question or finish
    if (currentQuestionIndex < interviewPlan.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      playQuestionAudio(interviewPlan[nextIdx].question_audio_b64);
    } else {
      submitFullInterview();
    }
  };

  // --- 7. Submit Everything ---
  const submitFullInterview = async () => {
    setStep('submitting');
    try {
      // We need to construct the final payload using the LATEST state
      // Note: State updates in 'finalizeTurn' might not be flushed yet if called immediately.
      // However, since we call this from the 'else' block of finalizeTurn, 
      // we need to be careful. 
      // *Fix:* We will use the Functional State Update pattern implicitly by relying 
      // on the fact that the arrays were updated in the render cycle, 
      // BUT to be safe, we use a small timeout or useEffect check. 
      // actually, let's just manually combine the last item since we are inside the closure.
      
      // Wait for state update? 
      // A cleaner way is to have a specific "Finish" button, but here we auto-submit.
      // We will manually grab the blobs from the refs/current scope for the FINAL submission.
      
      // NOTE: Because setCollectedData is async, doing it inside the same function call 
      // won't have the *last* item yet. 
      // Hack for React state closure: We passed data to finalizeTurn. 
      // Ideally, we submit in a separate useEffect dependent on collectedData length.
    } catch (err) {
      setError("Submission failed: " + err.message);
    }
  };

  // Watch for completion
  useEffect(() => {
    if (step === 'interview' && collectedData.turnMetadata.length === interviewPlan.length && interviewPlan.length > 0) {
      const doSubmit = async () => {
        setStep('submitting');
        try {
          const result = await interviewAPI.submitInterview(
            collectedData.turnMetadata,
            collectedData.audioBlobs,
            collectedData.cvScoreFiles
          );
          
          // Store report and go to dashboard (or a report page)
          // For now, simple alert and redirect
          localStorage.setItem('last_interview_report', JSON.stringify(result.final_report));
          alert(`Interview Complete! Your Score: ${result.final_report.final_score_percentage.toFixed(1)}%`);
          navigate('/dashboard');
        } catch (err) {
          setStep('interview'); // Go back so they can try again?
          setError("Failed to submit interview: " + err.message);
        }
      };
      doSubmit();
    }
  }, [collectedData, interviewPlan, step, navigate]);


  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Start Mock Interview</h2>
            <p className="text-gray-400 mb-6">Upload your resume (PDF) to generate personalized technical questions.</p>
            
            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4">{error}</div>}
            
            <label className="block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <span className="text-blue-400">Click to Upload PDF</span>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handleResumeUpload} 
                disabled={loading}
              />
            </label>
            
            {loading && <div className="mt-4 text-blue-400 animate-pulse">Generating questions with AI...</div>}
          </div>
        )}

        {/* STEP 2: SETUP (Video Check) */}
        {step === 'setup' && (
          <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Camera Check</h2>
            <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
               <Webcam 
                 ref={webcamRef}
                 audio={false}
                 className="w-full h-64 object-cover"
               />
            </div>
            <p className="mb-6">Ensure you are in a well-lit room. We will analyze your posture and eye contact.</p>
            <button onClick={startInterview} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold">
              I'm Ready - Start Interview
            </button>
          </div>
        )}

        {/* STEP 3: ACTIVE INTERVIEW */}
        {(step === 'interview' || step === 'submitting') && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: AI Interviewer */}
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-gray-400 uppercase text-sm font-bold mb-2">
                  Question {currentQuestionIndex + 1} of {interviewPlan.length}
                </h3>
                <p className="text-xl font-medium mb-8">
                  {interviewPlan[currentQuestionIndex]?.question_text}
                </p>
              </div>
              
              <div className="flex justify-center">
                {/* Visualizer or Icon for AI speaking */}
                <div className="w-24 h-24 bg-blue-900/50 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-4xl">🤖</span>
                </div>
              </div>
            </div>

            {/* Right: User Camera */}
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
              <div className="w-full bg-black rounded-lg overflow-hidden mb-4 relative">
                <Webcam 
                  ref={webcamRef}
                  audio={false}
                  className="w-full"
                  screenshotFormat="image/jpeg"
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                )}
              </div>

              {step === 'submitting' ? (
                <div className="text-yellow-400 text-lg font-semibold animate-bounce">
                  Submitting Interview...
                </div>
              ) : (
                !isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold"
                  >
                    Start Answer
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold"
                  >
                    Stop Recording
                  </button>
                )
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InterviewSession;