import { useTranslations } from 'next-intl';
import { AuthHeader } from '@/components/ui/auth-header';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <AuthHeader
          title={t('forgotPasswordTitle')}
          subtitle={t('forgotPasswordSubtitle')}
        />
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
