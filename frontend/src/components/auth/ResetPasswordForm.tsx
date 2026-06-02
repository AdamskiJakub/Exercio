'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useResetPasswordForm } from '@/hooks/useResetPasswordForm';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const { form, email, isLoading, error, success, onSubmit } = useResetPasswordForm();
  const { register, formState: { errors } } = form;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!email) {
    return null; // Will redirect via useEffect in hook
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
      {success ? (
        <div className="text-center space-y-4">
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 text-sm">{t('passwordResetSuccess')}</p>
            <p className="text-slate-400 text-xs mt-2">{t('redirectingToLogin')}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          {/* Email display (readonly) */}
          <div className="space-y-2">
            <Label>{t('email')}</Label>
            <div className="text-slate-300 text-sm bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600">
              {email}
            </div>
            <p className="text-xs text-slate-400">{t('codeSentToEmail')}</p>
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
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <div className="relative">
              <Input
                {...register('newPassword')}
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                aria-invalid={errors.newPassword ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                {...register('confirmPassword')}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
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
            {isLoading ? t('resettingPassword') : t('resetPassword')}
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
