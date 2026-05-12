'use client';

import { useTransition } from 'react';
import { useRouter, usePathname, type Locale } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LocaleSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (nextLocale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className="text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 rounded-lg px-3 h-9 text-2xl transition-all outline-none"
          aria-label={`${t('changeLanguage')}: ${locale === 'pl' ? t('polish') : t('english')}`}
        >
          {locale === 'pl' ? '🇵🇱' : '🇬🇧'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-2 border-slate-700 shadow-xl">
        <DropdownMenuItem 
          onClick={() => onSelectChange('pl')}
          className="cursor-pointer text-slate-300"
          role="menuitem"
        >
          <span className="mr-2" aria-hidden="true">🇵🇱</span> {t('polish')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSelectChange('en')}
          className="cursor-pointer text-slate-300"
          role="menuitem"
        >
          <span className="mr-2" aria-hidden="true">🇬🇧</span> {t('english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
