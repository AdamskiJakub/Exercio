import { useTranslations } from 'next-intl';
import { AuthHeader } from '@/components/ui/auth-header';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <AuthHeader
          title={t('resetPasswordTitle')}
          subtitle={t('resetPasswordSubtitle')}
        />
        <ResetPasswordForm />
      </div>
    </div>
  );
}
