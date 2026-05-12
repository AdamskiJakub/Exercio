'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard');
      return;
    }

    // Redirect to edit page
    router.push('/dashboard/profile/edit');
  }, [isAuthenticated, user, router]);

  return null;
}
