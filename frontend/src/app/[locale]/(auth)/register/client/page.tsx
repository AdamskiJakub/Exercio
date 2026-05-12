'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useRegisterClientForm } from '@/hooks/useRegisterClientForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function RegisterClientPage() {
  const t = useTranslations('auth');
  const { form, isLoading, error, onSubmit } = useRegisterClientForm();
  const { register, formState: { errors } } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-gradient-trainly mb-2 cursor-pointer hover:opacity-90 transition-opacity">
              Trainly
            </h1>
          </Link>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-white">
              {t('createAccount')} - {t('clientRole')}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              {t('haveAccount')}{' '}
              <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400 transition-colors">
                {t('loginLink')}
              </Link>
            </p>
          </div>

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
                  {t('firstName')} <span className="text-red-400">*</span>
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
                  {t('lastName')} <span className="text-red-400">*</span>
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
                <Label htmlFor="email">{t('email')}</Label>
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
                  {t('phone')} <span className="text-gray-500 font-normal">({t('phoneHint')})</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="123456789"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message as string}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
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
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
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
              className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600"
            >
              {isLoading ? t('creatingAccount') : t('createAccount')}
            </Button>

            <div className="text-center">
              <Link 
                href="/register/instructor"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {t('areYouInstructor')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
