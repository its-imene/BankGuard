import api from './api';

export const authService = {
  login: async (email) => {
    return await api.post('/auth/login', { email });
  },

  verifyOtp: async (email, code) => {
    return await api.post('/auth/otp/verify', { email, code });
  },

  resendOtp: async (email) => {
    return await api.post('/auth/otp/send', { email });
  },

  confirmAccount: async (token) => {
    return await api.post(`/auth/confirm/${token}`);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
