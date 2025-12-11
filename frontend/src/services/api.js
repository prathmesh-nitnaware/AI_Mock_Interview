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
// INDIVIDUAL EXPORTS
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
    // Note: Removed auth header temporarily to ensure it works for testing
    const response = await apiClient.post('/interview/submit', payload);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Code submission failed");
  }
};

// --- NEW FUNCTION: Fetch Next Question ---
export const fetchNextQuestion = async (params) => {
  try {
    const response = await apiClient.post('/interview/next-question', params);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Failed to fetch next question");
  }
};


// ==========================================
// THE 'api' OBJECT EXPORT
// ==========================================
export const api = {
  // 1. Pass through standard Axios methods
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),

  // 2. Custom Functions
  startInterview: async (sessionConfig) => {
    const response = await apiClient.post('/interview/initiate', sessionConfig);
    return response.data;
  },

  // 3. Connect Functions
  submitCode: submitCode,
  scoreResume: scoreResume,
  getDSAQuestion: getDSAQuestion,
  generateResumeQuestion: generateResumeQuestion,
  
  // --- ADDED THIS LINE ---
  fetchNextQuestion: fetchNextQuestion, 

  // 4. Mock Data Functions
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

  // 5. Aliases
  uploadResume: (file) => scoreResume(file, "Software Engineer")
};