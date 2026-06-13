import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/auth.api';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const loginWithOtp = async (email: string, code: string) => {
    const tokens = await authApi.verifyOtp(email, code);
    setAuth(tokens.user, tokens.accessToken, tokens.refreshToken);
    if (!tokens.user.displayName) {
      router.push('/setup');
    } else {
      router.push('/chat');
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return { user, isAuthenticated, loginWithOtp, logout };
};