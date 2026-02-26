/**
 * AUTH UTILITIES
 * Synchronized with AuthContext for seamless session management.
 */

// These MUST match the keys used in AuthContext.jsx
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Check if the user is currently authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  // Returns true if token exists and isn't an empty string
  return !!token && token !== 'undefined';
};

/**
 * Get the authentication token
 * @returns {string | null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set the authentication token
 * @param {string} token 
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Remove the authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get the stored user profile data
 * @returns {object | null}
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Session Corrupted: Error parsing user data", e);
    // If the data is unreadable, clear it to prevent app crashes
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Store the user profile data
 * @param {object} user 
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Remove the stored user data
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Helper to clear all auth data (Logout)
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

/**
 * Helper to get standard Authorization headers
 * Useful for fetch() or axios calls in services/api.js
 * Usage: headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
 */
export const getAuthHeaders = () => {
  const token = getToken();
  // Ensure we prefix with 'Bearer ' for standard JWT backend expectations
  return token ? { Authorization: `Bearer ${token}` } : {};
};