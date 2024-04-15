// authService.js

import API from './api';

const AuthService = {
  async login(email, password) {
    try {
      const response = await API.post('auth/login', {
        email,
        password
      });

      // Save the token and role in local storage
      localStorage.setItem('user-token', response.data.token);
      localStorage.setItem('user-role', response.data.role);
      localStorage.setItem('user-id', response.data._id);

      // Check if the role is 'parent' and save the ID as 'parent-id' specifically
      if (response.data.role === 'parent') {
        localStorage.setItem('parent-id', response.data._id);
      }

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
