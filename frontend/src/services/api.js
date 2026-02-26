import axios from 'axios';

// Dynamic URL: Logic to switch between Local and Production
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000/api" 
  : "https://prep-ai-backend-z5rk.onrender.com/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from local storage
const getAuthToken = () => localStorage.getItem('token');

// ==========================================
// AUTHENTICATION EXPORTS
// ==========================================

export const loginUser = async (credentials) => {
  try {
    // Hits @app.route('/api/auth/login')
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Login failed");
  }
};

export const registerUser = async (userData) => {
  try {
    // Hits @app.route('/api/auth/signup')
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Registration failed");
  }
};

// ==========================================
// FEATURE EXPORTS
// ==========================================

export const uploadResumeForInterview = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    // Hits @app.route('/api/interview/generate-from-resume')
    const response = await axios.post(`${API_URL}/interview/generate-from-resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Resume upload failed");
  }
};

export const submitCode = async (payload) => {
  try {
    // Hits @app.route('/api/interview/submit')
    const response = await apiClient.post('/interview/submit', payload, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Code submission failed");
  }
};

// ==========================================
// THE 'api' OBJECT EXPORT
// ==========================================
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  
  // Aliases for easier use in components
  login: loginUser,
  signup: registerUser,
  submitCode,
  uploadResumeForInterview,

  getDashboard: async (userId) => {
    const response = await apiClient.get(`/dashboard/${userId}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    return response.data;
  }
};