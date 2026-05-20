'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  useEffect(() => {
    const success = searchParams.get('success');
    
    if (success === 'true') {
      apiClient
        .get('/auth/me')
        .then((response) => {
          setAuth(response.data);
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('OAuth callback error:', error);
          router.push('/login?error=oauth_failed');
        });
    } else {
      router.push('/login?error=oauth_cancelled');
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-slate-300 text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}
