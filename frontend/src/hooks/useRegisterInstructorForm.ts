import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createRegisterInstructorSchema, type RegisterInstructorFormData } from '@/lib/validations/register-instructor-form';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { normalizeApiError } from '@/lib/utils/error-handlers';
import { generateUsernameFromEmail } from '@/lib/utils/username-generator';

export function useRegisterInstructorForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterInstructorFormData>({
    resolver: zodResolver(createRegisterInstructorSchema(t)),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: RegisterInstructorFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = data;
      
      // Auto-generate username from email with proper validation
      const username = generateUsernameFromEmail(registerData.email);
      
      const response = await apiClient.post('/auth/register-instructor', {
        ...registerData,
        username,
      });
      const { user } = response.data;
      
      setAuth(user);
      router.push('/dashboard');
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
