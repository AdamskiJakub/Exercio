'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { UserMenu } from './user-menu';
import { useAuthStore } from '@/stores/auth-store';
import { DumbbellIcon } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('Common');
  const { isAuthenticated } = useAuthStore();
  
  return (
    <nav className="border-b border-slate-800 bg-slate-900  backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">

          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label={t('homeAriaLabel')}>
            <DumbbellIcon className="w-8 h-8 text-orange-500" aria-hidden="true" />
            <span className="text-3xl font-bold bg-linear-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Trainly
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-base px-6 py-6"
                  asChild
                  aria-label={t('login')}
                >
                  <Link href="/login">{t('login')}</Link>
                </Button>
                
                <Button 
                  size="lg"
                  className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-base px-8 py-6 font-semibold"
                  asChild
                  aria-label={t('register')}
                >
                  <Link href="/register">{t('register')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
