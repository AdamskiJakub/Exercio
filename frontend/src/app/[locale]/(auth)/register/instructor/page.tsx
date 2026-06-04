'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Dumbbell } from 'lucide-react';
import { useRegisterInstructorForm } from '@/hooks/useRegisterInstructorForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuthHeader } from '@/components/ui/auth-header';

export default function RegisterInstructorPage() {
  const t = useTranslations('auth');
  const { form, isLoading, error, onSubmit } = useRegisterInstructorForm();
  const { register, formState: { errors } } = form;

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <AuthHeader
          title={`${t('createAccount')} - ${t('instructorRole')}`}
          subtitle={t('instructorRoleDesc')}
          icon={<Dumbbell className="w-10 h-10 text-purple-500" />}
        />

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Form */}
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t('firstName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  placeholder={t('firstNamePlaceholder')}
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message as string}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t('lastName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  placeholder={t('lastNamePlaceholder')}
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message as string}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder={t('emailPlaceholder')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message as string}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t('phone')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="123456789"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                />
                <p className="text-xs text-gray-500">{t('phoneRequiredForInstructor')}</p>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message as string}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('password')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder={t('passwordHint')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message as string}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('confirmPassword')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-purple-500 to-purple-600 text-white font-semibold hover:from-purple-600 hover:to-purple-700"
            >
              {isLoading ? t('creatingAccount') : t('createAccount')}
            </Button>
          </form>

          {/* Footer links */}
          <div className="space-y-3 mt-6 text-center">
            <Link 
              href="/register/client"
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors block"
            >
              {t('registerAsClientInstead')}
            </Link>

            <Link 
              href="/register"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors block"
            >
              ← {t('backToRoleSelection')}
            </Link>

            <p className="text-sm text-slate-400">
              {t('haveAccount')}{' '}
              <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                {t('loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
