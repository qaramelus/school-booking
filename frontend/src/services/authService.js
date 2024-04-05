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
      localStorage.setItem('parent-id', response.data._id); 

      return response.data.role;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }
};

export default AuthService;
