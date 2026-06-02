'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { usePasswordResetStore } from '@/stores/password-reset-store';
import { createResetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/reset-password';

export function useResetPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const { email, clearEmail } = usePasswordResetStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if no email in store
  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(createResetPasswordSchema(t)),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?lang=${locale}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            code: data.code,
            newPassword: data.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      // Clear email from store
      clearEmail();
      
      setSuccess(true);
      // Redirect to login immediately after successful reset
     setTimeout(() => {
        router.push('/login');
      }, 2000); 
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetPasswordFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    email,
    isLoading,
    error,
    success,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
