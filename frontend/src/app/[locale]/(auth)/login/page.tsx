'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { AuthHeader } from '@/components/ui/auth-header';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { form, isLoading, error, onSubmit, clearServerError } = useLoginForm();
  const { register, formState: { errors } } = form;

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <AuthHeader
          title={t('login')}
          subtitle={t('loginSubtitle')}
        />

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                {...register('email', {
                  onChange: clearServerError,
                })}
                id="email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && errors.email.message && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input
                {...register('password', {
                  onChange: clearServerError,
                })}
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && errors.password.message && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
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
              {isLoading ? t('loggingIn') : t('login')}
            </Button>
          </form>

          {/* Social Login Buttons - MOVED TO BOTTOM */}
          <div className="mt-6">
            <SocialLoginButtons />
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-300 text-base">
              {t('noAccount')}{' '}
              <Link
                href="/register"
                className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
              >
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
