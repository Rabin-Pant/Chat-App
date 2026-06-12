import apiClient from '@/lib/api.client';
import { AuthTokens } from '@/types/chat.types';

export const authApi = {
  requestOtp: async (email: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/otp/request', { email });
    return data;
  },

  verifyOtp: async (email: string, code: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post('/auth/otp/verify', { email, code });
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  googleLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },
};