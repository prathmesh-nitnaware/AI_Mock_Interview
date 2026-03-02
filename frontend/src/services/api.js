import axios from "axios";

// ==========================================
// BASE URL SWITCHER
// ==========================================
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://prep-ai-backend-z5rk.onrender.com";

// ==========================================
// AXIOS CLIENT
// ==========================================
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// AUTH INTERCEPTOR (CRITICAL)
// ==========================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Standard check to attach Bearer token if it exists
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR (AUTO LOGOUT ON 401)
// ==========================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401, the token is likely expired
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(
      error.response?.data || { message: "Server error" }
    );
  }
);

// ==========================================
// AUTH FUNCTIONS
// ==========================================
export const loginUser = async (credentials) => {
  const response = await apiClient.post("/api/auth/login", credentials);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post("/api/auth/signup", userData);
  return response.data;
};

// ==========================================
// RESUME & AUDIT FUNCTIONS
// ==========================================
export const scoreResume = async (formData) => {
  /**
   * Matches Flask: app.register_blueprint(resume_bp, url_prefix="/api/resume")
   * This sends the actual file + job description to the Ollama engine.
   */
  const response = await apiClient.post(
    "/api/resume/score", 
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ==========================================
// INTERVIEW FUNCTIONS
// ==========================================
export const initiateInterview = async (payload) => {
  const response = await apiClient.post("/api/interview/initiate", payload);
  return response.data;
};

export const submitCode = async (payload) => {
  if (!payload.session_id) {
    throw new Error("session_id missing. Interview not initialized.");
  }
  const response = await apiClient.post("/api/interview/submit", payload);
  return response.data;
};

export const getDSAQuestion = async (difficulty) => {
  const response = await apiClient.get("/api/interview/dsa", {
    params: { difficulty },
  });
  return response.data;
};

export const uploadResumeForInterview = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await apiClient.post(
    "/api/interview/generate-from-resume",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ==========================================
// DASHBOARD
// ==========================================
export const getDashboard = async (userId) => {
  const response = await apiClient.get(`/api/dashboard/${userId}`);
  return response.data;
};

// ==========================================
// CONSOLIDATED API EXPORT
// ==========================================
export const api = {
  loginUser,
  registerUser,
  scoreResume,
  initiateInterview,
  submitCode,
  getDSAQuestion,
  getDashboard,
  uploadResumeForInterview,
  client: apiClient 
};