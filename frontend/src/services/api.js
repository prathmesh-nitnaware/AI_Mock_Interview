import axios from 'axios';

// Ensure this matches your backend URL (Port 5000 is standard for Flask)
const API_URL = "http://localhost:5000/api";

// 1. Create the Axios Instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token
const getAuthToken = () => localStorage.getItem('token');


// ==========================================
// INDIVIDUAL EXPORTS (Keep these for direct imports)
// ==========================================

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Login failed");
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Registration failed");
  }
};

export const scoreResume = async (file, jobDescription = "") => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('job_description', jobDescription);

  try {
    const response = await axios.post(`${API_URL}/resume/score`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Resume scoring failed");
  }
};

export const getDSAQuestion = async (difficulty) => {
  try {
    const response = await apiClient.get(`/interview/dsa`, {
      params: { difficulty },
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Failed to fetch DSA question");
  }
};

export const generateResumeQuestion = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await axios.post(`${API_URL}/interview/generate-from-resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Failed to generate question");
  }
};

export const submitCode = async (payload) => {
  try {
    const response = await apiClient.post('/interview/submit', payload, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Code submission failed");
  }
};


// ==========================================
// THE 'api' OBJECT EXPORT (Fixes your crash)
// ==========================================
// This combines the Axios client with your custom functions
export const api = {
  // 1. Pass through standard Axios methods (so api.get/api.post still work)
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),

  // 2. NEW: The function causing your error (Interview Setup)
  startInterview: async (sessionConfig) => {
    // Calls the backend /initiate route
    const response = await apiClient.post('/interview/initiate', sessionConfig);
    return response.data;
  },

  // 3. NEW: Mock Functions for Dashboard (Prevents Dashboard crash)
  getUserProfile: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ 
        name: "User Name", 
        age: 24, 
        current_job: "Developer" 
      }), 300);
    });
  },
  
  getDashboard: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        stats: { total_interviews: 0, average_score: 0 },
        recent_activity: []
      }), 300);
    });
  },

  // 4. Resume Alias (Safety fallback)
  uploadResume: (file) => scoreResume(file, "Software Engineer")
};