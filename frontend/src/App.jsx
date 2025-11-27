import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InterviewSession from './pages/InterviewSession'; // Import the new page
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';
import './App.css';

// Create Dark Mode Context
const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('mockai-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('mockai-dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            
            <Route 
              path="/login" 
              element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />} 
            />
            
            <Route 
              path="/signup" 
              element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Signup />} 
            />
            
            {/* Protected Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected Interview Session Route */}
            <Route 
              path="/interview" 
              element={
                <ProtectedRoute>
                  <InterviewSession />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;