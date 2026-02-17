# PrepAI – Multimodal AI Mock Interview Platform

## 🚀 Overview

PrepAI is an AI-powered mock interview platform that simulates real-world interview environments using Generative AI, Speech Processing, NLP, and Computer Vision.

Unlike traditional chatbot-based tools, PrepAI evaluates not only technical responses but also communication quality, confidence, posture, gaze stability, tone clarity, and nervousness — delivering a comprehensive performance report.

---

## 🎯 Problem Statement

Interview preparation often suffers from:

- Limited access to expert mock interviewers  
- Subjective and inconsistent feedback  
- No evaluation of body language or speech patterns  
- Static, non-adaptive questioning systems  

PrepAI addresses these gaps using a multimodal AI-driven evaluation framework.

---

## 🧠 Core Features

### 1️⃣ Resume-Based Personalization
- Extracts resume text using PyPDF2 and SpaCy  
- LLM analyzes strengths and skill gaps  
- Generates role-specific and difficulty-adjusted questions  

### 2️⃣ Real-Time Adaptive Interview Engine
- Role-based interviews (ML Engineer, Data Analyst, HR, etc.)  
- Whisper-based Speech-to-Text transcription  
- LLM-driven answer evaluation  
- Dynamic follow-up question generation  
- gTTS-based spoken question simulation  

### 3️⃣ Audio Intelligence
- Speech rate and fluency scoring  
- Tone stability (jitter detection)  
- Nervousness estimation via voice stress patterns  

### 4️⃣ Computer Vision Analysis
- MediaPipe-based posture tracking  
- Eye-gaze tracking and blink-rate monitoring  
- CNN-based emotion recognition  

### 5️⃣ Multimodal Scoring Engine

Weighted evaluation rubric:

- Technical Accuracy — 45%  
- Communication Quality — 20%  
- Body Language — 15%  
- Attention & Engagement — 10%  
- Nervousness Score — Heuristic (Audio + CV signals)  

Generates:
- Full interview transcript  
- Behavioral metrics  
- Structured performance report  
- Personalized improvement roadmap  

---

## 🏗 Technical Architecture

**Frontend → FastAPI Backend → AI Processing Modules**

### Backend
- FastAPI  
- MongoDB  

### AI Components
- LLM (OpenAI / Gemini) for evaluation & adaptive questioning  
- Whisper STT for transcription  
- MediaPipe + OpenCV for posture & gaze tracking  
- Custom CNN for emotion detection  
- Audio feature extraction pipeline  

### Deployment
- Vercel / Render  
- Git for version control  

---

## ⚙️ Challenges & Mitigations

**Posture Detection Accuracy**
- Smoothing filters  
- Diverse training data  
- Validation layers  

**Real-Time Coding Evaluation**
- Rule-based validation  
- Test-case verification  
- Content filtering  

**Scalability & Performance**
- Cloud deployment  
- Secure data handling  
- Optimized API response time  

---

## 🔮 Future Enhancements

- Cheat detection (plagiarism + gaze diversion detection)  
- Real-time interrupting AI for off-track responses  
- Company-specific interview simulations  
- Advanced analytics dashboard  

---

## 📌 Impact

PrepAI bridges the gap between technical evaluation and behavioral analysis by combining NLP, speech processing, and computer vision into a unified AI interview simulator.

It delivers objective, scalable, and personalized interview preparation at scale.
