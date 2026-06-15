import api from './api';

export const authService = {
  requestOTP: async (emailOrPhone) => {
    const response = await api.post('/auth/login', { emailOrPhone });
    return response.data;
  },

  verifyOTP: async (otp, emailOrPhone) => {
    const response = await api.post('/auth/verify', { otp, emailOrPhone });
    return response.data;
  },
};

export default authService;
