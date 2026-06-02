'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { createVerifyEmailSchema, type VerifyEmailFormData } from '@/lib/validations/verify-email';

export function useVerifyEmailForm(initialEmail?: string) {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(createVerifyEmailSchema(t)),
    mode: 'onSubmit',
    defaultValues: {
      email: initialEmail || '',
    },
  });

  const emailValue = form.watch('email');

  const onSubmit = async (data: VerifyEmailFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?lang=${locale}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            code: data.code,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify email');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verificationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!emailValue) {
      setError(t('emailRequired'));
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/send-verification?lang=${locale}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailValue }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }

      toast.success(t('codeResent'));
    } catch (err) {
      setError(t('resendFailed'));
    } finally {
      setIsResending(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    success,
    isResending,
    emailValue,
    onSubmit: form.handleSubmit(onSubmit),
    handleResendCode,
  };
}