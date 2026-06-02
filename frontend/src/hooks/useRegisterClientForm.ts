import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createRegisterClientSchema, type RegisterClientFormData } from '@/lib/validations/register-client-form';
import { apiClient } from '@/lib/api';
import { normalizeApiError } from '@/lib/utils/error-handlers';
import { generateUsernameFromEmail } from '@/lib/utils/username-generator';

export function useRegisterClientForm() {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterClientFormData>({
    resolver: zodResolver(createRegisterClientSchema(t)),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: RegisterClientFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = data;
      
      // Auto-generate username from email with proper validation
      const username = generateUsernameFromEmail(registerData.email);

      const locale = window.location.pathname.split('/')[1];
      
      await apiClient.post(`/auth/register?lang=${locale}`, {
        ...registerData,
        username,
      });

      window.location.href = `/${locale}/verify-email?email=${encodeURIComponent(registerData.email)}`;
    } catch (err: any) {
      if (err.response?.status === 409) {
        const conflictMessage = err.response?.data?.message;
        setError(conflictMessage ? `${t('registrationFailed')}: ${conflictMessage}` : t('registrationFailed'));
      } else {
        setError(normalizeApiError(err, t('registrationFailed')));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    error,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
