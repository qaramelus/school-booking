import axios from 'axios';

// Use environment variable for the API base URL or fallback to localhost
const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:5005/api/';

console.log(`Using API Base URL: ${baseURL}`); // Good for debugging purposes

const API = axios.create({
  baseURL: baseURL,
});

// Add a request interceptor
API.interceptors.request.use(function (config) {
  const token = localStorage.getItem('user-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log the full URL (baseURL + requested endpoint)
  console.log(`Making API call to: ${config.baseURL}${config.url}`);
  return config;
}, function (error) {
  console.error('Error with API request:', error);
  return Promise.reject(error);
});

export default API;
