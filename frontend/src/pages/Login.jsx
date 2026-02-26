import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import InputField from '../components/forms/InputField';
import '../styles/theme.css';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to where they came from, or dashboard by default
  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    
    // Calls the backend via AuthContext
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-root">
      
      {/* Premium Background Effects */}
      <div className="ambient-glow"></div>
      <div className="noise-overlay"></div>

      <div className="login-container fade-in-up">
        {/* REPLACED <Card> with <div className="glass-login-card"> */}
        <div className="glass-login-card">
          
          <div className="login-header">
            <div className="brand-pill">
              <Sparkles size={14} className="text-indigo" />
              <span>PREP AI</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Access your dashboard and resume your training.</p>
          </div>

          {error && (
            <div className="error-pill shake-animation">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
                <InputField
                  type="email"
                  label="EMAIL ADDRESS"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail size={16} />}
                  required
                />
            </div>
            
            <div className="input-wrapper">
                <InputField
                  type="password"
                  label="PASSWORD"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock size={16} />}
                  required
                />
            </div>

            <div className="form-options">
              <label className="custom-checkbox">
                <input type="checkbox" /> 
                <span className="checkmark"></span>
                <span className="cb-label">Remember me for 30 days</span>
              </label>
              <Link to="/forgot-password" className="link-hover-glow">Forgot Password?</Link>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="btn-glow-submit w-full mt-4" 
              isLoading={loading}
              disabled={loading}
            >
              {loading ? "Authenticating..." : <> Secure Sign In <ArrowRight size={18} /> </>}
            </Button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup" className="link-highlight">Create one now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;