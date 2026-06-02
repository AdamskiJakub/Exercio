'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { usePasswordResetStore } from '@/stores/password-reset-store';
import { createForgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/forgot-password';

export function useForgotPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const setEmail = usePasswordResetStore((state) => state.setEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/request-password-reset?lang=${locale}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send reset code');
      }

      // Save email to store for reset-password page
      setEmail(data.email);
      
      setSuccess(true);
      // Redirect to reset-password page
      setTimeout(() => {
        router.push('/reset-password');
      }, 2000);
    } catch (err) {
      setError(t('resendFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    success,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
