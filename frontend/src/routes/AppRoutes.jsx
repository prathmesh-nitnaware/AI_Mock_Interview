import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ResumeUpload from '../pages/ResumeUpload';
import ResumeResult from '../pages/ResumeResult'; 

// Interview Flow
import Interview from '../pages/Interview'; // <-- Changed from InterviewSetup
import InterviewSession from '../pages/InterviewSession'; 
import InterviewLive from '../pages/InterviewLive';       
import InterviewReport from '../pages/InterviewReport';   

// Coding Flow
import CodingArena from '../components/Interview/CodingArena';           
import CodingEditor from '../components/Interview/CodeEditor'; 
import CodingReport from '../components/Interview/CodingRport';


const AppRoutes = () => {
  return (
    <Routes>
      
      {/* --- PUBLIC ROUTES (No Global Layout) --- */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* --- PROTECTED ROUTES --- */}
      <Route element={<ProtectedRoute />}>
        
        {/* Immersive/Fullscreen Routes (No Global Layout) */}
        <Route path="/interview/session" element={<InterviewSession />} /> {/* Match the navigate path */}
        <Route path="/interview/live" element={<InterviewLive />} />
        <Route path="/coding/arena" element={<CodingArena />} />

        {/* Standard App Routes (Wrapped in Global Layout & Navbar) */}
        <Route element={<Layout />}>
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Resume Flow */}
          <Route path="/resume/upload" element={<ResumeUpload />} />
          <Route path="/resume/result" element={<ResumeResult />} />

          {/* Voice Interview Config & Report */}
          <Route path="/interview/setup" element={<Interview />} /> {/* Using the merged Interview component */}
          <Route path="/interview/report" element={<InterviewReport />} />
          
          {/* Coding Round Config & Report */}
          <Route path="/coding/arena" element={<CodingArena />} />
          <Route path="/coding/editor" element={<CodingEditor />} />
          <Route path="/coding/report" element={<CodingReport />} />
          
        </Route>
      </Route>

      {/* Fallback - Redirects to Home if route doesn't exist */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;