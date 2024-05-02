// src/services/api.js
import axios from 'axios';

// Use environment variable for the API base URL or fallback to localhost
const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:5005/api/';

// Log the baseURL to ensure it's picking up the correct environment variable
console.log(`Using API Base URL: ${baseURL}`);

const API = axios.create({
  baseURL: baseURL,
});

// Add a request interceptor
API.interceptors.request.use(function (config) {
  const token = localStorage.getItem('user-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`Making API call to: ${config.url}`); // Log each API request URL
  return config;
}, function (error) {
  console.error('Error with API request:', error); // Log errors
  return Promise.reject(error);
});

export default API;
