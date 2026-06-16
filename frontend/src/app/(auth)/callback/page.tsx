'use client';
import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/api.client';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      router.push('/login');
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    apiClient.get('/users/me').then(({ data }) => {
      setAuth(data.user, accessToken, refreshToken);
      if (!data.user.displayName) {
        router.push('/setup');
      } else {
        router.push('/chat');
      }
    }).catch(() => {
      router.push('/login');
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}