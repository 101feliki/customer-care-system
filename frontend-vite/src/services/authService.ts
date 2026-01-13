import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Adjust to your backend port

export const authService = {
  login: async (credentials: any) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      // Store the token and user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Helper to get only the token for API headers
  getToken: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token;
  }
};