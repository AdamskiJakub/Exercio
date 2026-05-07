import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from '@/i18n/routing';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requireRole?: 'CLIENT' | 'INSTRUCTOR' | 'ADMIN';
  redirectTo?: any;
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

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const state = useAuthStore.getState();
      const currentUser = state.user;
      const currentAuth = state.isAuthenticated;

      // Check authentication
      if (requireAuth && (!currentAuth || !currentUser)) {
        router.push(redirectTo);
        return;
      }

      // Check role if required
      if (requireRole && currentUser && currentUser.role !== requireRole) {
        router.push('/dashboard');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [requireAuth, requireRole, redirectTo, router]);

  return {
    isChecking,
    user,
    isAuthenticated,
  };
}
