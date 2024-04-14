// authService.js

import API from './api';

const AuthService = {
  async login(email, password) {
    try {
      const response = await API.post('auth/login', {
        email,
        password
      });

      localStorage.setItem('user-token', response.data.token);
      localStorage.setItem('user-role', response.data.role);
      localStorage.setItem('user-id', response.data._id); 

      return response.data.role;
    } catch (error) {
      // More nuanced error handling
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Login failed');
      } else {
        throw new Error('Network error or server is not responding');
      }
    }
  }
};

export default AuthService;