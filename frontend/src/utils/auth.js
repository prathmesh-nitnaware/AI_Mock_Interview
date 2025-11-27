export const getToken = () => {
  return localStorage.getItem('session_token');
};

export const setToken = (token) => {
  localStorage.setItem('session_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('session_token');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // For mock tokens, just check if it exists
  if (token.startsWith('mock_jwt_token')) {
    return true;
  }
  
  // For real JWT tokens, check expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};