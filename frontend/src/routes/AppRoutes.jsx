import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Wrapper
import Layout from '../components/layout/Layout';

// Auth Guard
import ProtectedRoute from '../components/ProtectedRoute';

// --- PAGES (Importing from ../pages based on your screenshot) ---
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

// --- RESUME FLOW ---
import ResumeUpload from '../pages/ResumeUpload';
import ResumeResult from '../pages/ResumeResult'; // Keep if you use it

// --- INTERVIEW FLOW ---
import InterviewSetup from '../pages/InterviewSetup';
import InterviewSession from '../pages/InterviewSession'; // This is the Camera Page
import InterviewReport from '../pages/InterviewReport';
import InterviewLive from '../pages/InterviewLive';

// Note: If you have a separate "CodeAssessment" or "Arena" component, import it here.
// Assuming 'InterviewLive' might be your coding arena based on your file list.
// If not, point this to where your Code Editor page is.

const AppRoutes = () => {
  return (
    <Routes>
      {/* Wrap EVERYTHING in Layout */}
      <Route element={<Layout />}>
        
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Resume Flow */}
          <Route path="/resume/upload" element={<ResumeUpload />} />
          <Route path="/resume/result" element={<ResumeResult />} />

          {/* --- INTERVIEW FLOW --- */}
          
          {/* Step 1: Configuration */}
          <Route path="/interview/setup" element={<InterviewSetup />} />
          
          {/* Step 2: Permissions (Camera/Mic Check) - CRITICAL FIX */}
          <Route path="/interview/room" element={<InterviewSession />} />
          
          {/* Step 3: Live Interview / Coding Arena */}
          {/* Ensure InterviewLive.jsx is your actual coding page */}
          <Route path="/coding/arena" element={<InterviewLive />} />
          
          {/* Post-Interview Reports */}
          <Route path="/interview/report" element={<InterviewReport />} />
          
        </Route>

      </Route>

      {/* Fallback - Redirects to Home if route doesn't exist */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;