'use client';

import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { AuthHeader } from '@/components/ui/auth-header';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || undefined;

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <AuthHeader
          title={t('verifyEmailTitle')}
          subtitle={t('verifyEmailSubtitle')}
          icon={<Mail className="w-8 h-8 text-orange-500" />}
        />
        <VerifyEmailForm initialEmail={emailFromUrl} />
      </div>
    </div>
  );
}
