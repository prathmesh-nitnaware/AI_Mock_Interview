import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// --- Local Storage Helpers for Mock Auth ---
const getRegisteredUsers = () => {
  const users = localStorage.getItem('mockai_registered_users');
  return users ? JSON.parse(users) : [];
};

const saveRegisteredUser = (user) => {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem('mockai_registered_users', JSON.stringify(users));
};

// --- Auth API ---
export const authAPI = {
  login: async (email, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getRegisteredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Return a simple token string that will pass isAuthenticated()
      const mockToken = `valid-session-${Date.now()}`;
      return { token: mockToken, user: { name: user.name, email: user.email } };
    }
    throw new Error('Invalid email or password.');
  },

  signup: async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getRegisteredUsers();
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered.');
    }
    
    const newUser = { id: Date.now().toString(), name, email, password };
    saveRegisteredUser(newUser);
    
    const mockToken = `valid-session-${Date.now()}`;
    return { 
      token: mockToken, 
      user: { name, email } 
    };
  }
};

// --- Resume & Interview API ---
export const resumeAPI = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Dummy job description for scoring endpoint
    formData.append('job_description', "Software Engineer"); 

    try {
      const response = await axios.post(`${API_URL}/score_resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const resumeInfo = {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        analysis: response.data
      };
      localStorage.setItem('current_resume', JSON.stringify(resumeInfo));
      
      return { resume: resumeInfo, message: "Resume analyzed successfully!" };
    } catch (error) {
      console.error("Upload error:", error);
      // Fallback if backend is down, just so UI doesn't break
      const resumeInfo = { fileName: file.name, fileUrl: URL.createObjectURL(file), analysis: null };
      localStorage.setItem('current_resume', JSON.stringify(resumeInfo));
      return { resume: resumeInfo, message: "Resume uploaded (Backend analysis failed)" };
    }
  },

  getResume: async () => {
    const data = localStorage.getItem('current_resume');
    return { resume: data ? JSON.parse(data) : null };
  },
  
  deleteResume: async () => {
    localStorage.removeItem('current_resume');
  }
};

export const interviewAPI = {
  startSession: async (file, difficulty = "Medium", numQuestions = 3) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    formData.append('num_questions', numQuestions);

    const response = await axios.post(`${API_URL}/generate_interview_plan`, formData);
    return response.data; 
  },

  sendFrame: async (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, "frame.jpg");
    const response = await axios.post(`${API_URL}/analyze_frame`, formData, { timeout: 1000 }); 
    return response.data;
  },

  submitInterview: async (turnData, audioBlobs, cvScores) => {
    const formData = new FormData();
    formData.append('turn_data_json', JSON.stringify(turnData));

    audioBlobs.forEach((blob, index) => {
      formData.append('files', blob, `audio_${index}.wav`);
    });

    cvScores.forEach((scores, index) => {
      const scoresBlob = new Blob([JSON.stringify(scores)], { type: 'application/json' });
      formData.append('files', scoresBlob, `cv_scores_${index}.json`);
    });

    const response = await axios.post(`${API_URL}/submit_full_interview`, formData);
    return response.data;
  }
};