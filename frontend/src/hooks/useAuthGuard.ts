'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from '@/i18n/routing';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requireRole?: 'CLIENT' | 'INSTRUCTOR' | 'ADMIN';
  redirectTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    requireAuth = true,
    requireRole,
    redirectTo = '/login',
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    
    // If already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Don't check auth until store has hydrated
    if (!hasHydrated) {
      return;
    }

    const checkAuth = async () => {
      // Small delay to ensure state is stable
      await new Promise(resolve => setTimeout(resolve, 50));

      // Check authentication
      if (requireAuth && (!isAuthenticated || !user)) {
        router.push(redirectTo as any);
        return;
      }

      // Check role if required
      if (requireRole && user && user.role !== requireRole) {
        router.push('/dashboard' as any);
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [hasHydrated, requireAuth, requireRole, redirectTo, router, user, isAuthenticated]);

  return {
    isChecking,
    user,
    isAuthenticated,
  };
}
