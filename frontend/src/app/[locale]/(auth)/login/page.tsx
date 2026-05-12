'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useLoginForm } from '@/hooks/useLoginForm';
import { DumbbellIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { form, isLoading, error, onSubmit, clearServerError } = useLoginForm();
  const { register, formState: { errors } } = form;

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-4" aria-label="Trainly home">
            <DumbbellIcon className="w-10 h-10 text-orange-500" aria-hidden="true" />
            <h1 className="text-5xl font-bold bg-linear-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent cursor-pointer hover:opacity-90 transition-opacity">
              Trainly
            </h1>
          </Link>
          <p className="text-xl text-slate-200 font-medium mt-2">
            {t('loginSubtitle')}
          </p>
        </div>

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
              <Label htmlFor="password">{t('password')}</Label>
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
