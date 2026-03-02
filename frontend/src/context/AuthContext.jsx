import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://prep-ai-backend-z5rk.onrender.com";

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Added /auth/ to match backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.error || "Login failed" };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, message: "Connection Error. Is the backend running?" };
    }
  };

  // Updated to receive the object sent by Signup.jsx
  const signup = async (signupData) => {
    setLoading(true);
    try {
      // Added /auth/ to match backend
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData) 
      });

      const data = await response.json();

      if (response.ok) {
        // Automatically log them in after signup
        return await login(signupData.email, signupData.password);
      } else {
        setLoading(false);
        return { success: false, message: data.error || "Signup failed" };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, message: "Connection Error." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = { user, isAuthenticated: !!user, loading, login, signup, logout, API_URL };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && (
        <div className="loading-screen">
          <div className="neon-spinner-large"></div>
          <p className="loading-text">Establishing Secure Link...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;