import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🚀 DYNAMIC URL LOGIC
  // If the app is running on localhost, it uses the local backend.
  // If it's running on the web, it uses the Render backend.
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://prep-ai-backend-z5rk.onrender.com";

  // 1. Check for existing session on startup
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

  // 2. REAL Login Function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email,  
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        const userData = { 
          id: data.id || "usr_" + Date.now(), 
          name: email.split('@')[0], 
          email: email, 
          role: "candidate" 
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token || 'authenticated');

        setLoading(false);
        navigate('/dashboard');
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.error || "Login failed" };
      }
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        message: "🌐 Connection Error. If using the web link, the server may be waking up. Please try again in 30s." 
      };
    }
  };

  // 3. REAL Signup Function
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email,  
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        const userData = { 
          id: data.id || "usr_" + Date.now(), 
          name: name, 
          email: email, 
          role: "candidate" 
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token || 'authenticated');

        setLoading(false);
        navigate('/dashboard');
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.error || "Signup failed" };
      }
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        message: "🌐 Connection Error. Server is likely warming up." 
      };
    }
  };

  // 4. Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    API_URL // Exported so other services can use it
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      
      {/* --- THEMED LOADING OVERLAY --- */}
      {loading && (
        <div className="loading-screen">
          <div className="neon-spinner-large"></div>
          <p className="loading-text">Establishing Secure Link...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;