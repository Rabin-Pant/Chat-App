'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';
import Sidebar from '@/components/chat/Sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useSocket(isAuthenticated);

  const isConversationOpen = pathname !== '/chat';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <div className={`${
        isConversationOpen ? 'hidden md:flex' : 'flex'
      } w-full md:w-80 flex-col`}>
        <Sidebar />
      </div>
      <main className={`${
        isConversationOpen ? 'flex' : 'hidden md:flex'
      } flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900`}>
        {children}
      </main>
    </div>
  );
}