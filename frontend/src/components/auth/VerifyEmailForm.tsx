'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useVerifyEmailForm } from '@/hooks/useVerifyEmailForm';

interface VerifyEmailFormProps {
  initialEmail?: string;
}

export function VerifyEmailForm({ initialEmail }: VerifyEmailFormProps) {
  const t = useTranslations('auth');
  const { form, isLoading, error, success, isResending, onSubmit, handleResendCode } = useVerifyEmailForm(initialEmail);
  const { register, formState: { errors } } = form;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
      {success ? (
        <div className="text-center space-y-4">
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 text-sm">{t('emailVerified')}</p>
            <p className="text-slate-400 text-xs mt-2">{t('redirectingToLogin')}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Code Field */}
          <div className="space-y-2">
            <Label htmlFor="code">{t('verificationCode')}</Label>
            <Input
              {...register('code')}
              id="code"
              type="text"
              placeholder={t('enterCode')}
              maxLength={6}
              aria-invalid={errors.code ? 'true' : 'false'}
              className="text-center text-2xl tracking-widest font-mono"
            />
            {errors.code && (
              <p className="text-sm text-red-500">
                {errors.code.message}
              </p>
            )}
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-sm text-orange-500 hover:text-orange-400 disabled:opacity-50"
              >
                {isResending ? t('resendingCode') : t('resendCode')}
              </button>
            </div>
          </div>

          {/* Server Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600"
          >
            {isLoading ? t('verifying') : t('verifyEmail')}
          </Button>
        </form>
      )}

      {/* Back to Login */}
      <div className="mt-6">
        <Button
          variant="outline-slate"
          size="default"
          asChild
          className="w-full"
        >
          <Link href="/login">
            <ArrowLeft className="size-4 mr-2 shrink-0" />
            <span>{t('backToLogin')}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
