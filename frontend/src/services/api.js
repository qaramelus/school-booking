// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5005/api/',
});

// Add a request interceptor
API.interceptors.request.use(function (config) {
  const token = localStorage.getItem('user-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

export default API;
