'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSpecializations, getSpecializationName } from '@/hooks/useConfig';
import type { InstructorSearchBarProps } from './types';

export function InstructorSearchBar({
  city,
  specialization,
  search,
  onCityChange,
  onSpecializationChange,
  onSearchChange,
}: InstructorSearchBarProps) {
  const t = useTranslations('HomePage');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { specializations, loading } = useSpecializations();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
      <Input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t('hero.searchPlaceholder')}
        aria-label={t('hero.searchLabel')}
        className="h-12 text-base bg-slate-800/50 border-2 border-slate-700 text-white placeholder-slate-400 focus-visible:border-orange-500"
      />
    </div>
      <div className="flex-1">
        <Input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder={t('hero.citySearchPlaceholder')}
          aria-label={t('hero.citySearchLabel')}
          className="h-12 text-base bg-slate-800/50 border-2 border-slate-700 text-white placeholder-slate-400 focus-visible:border-orange-500"
        />
      </div>

      <div className="flex-1">
        <Select value={specialization} onValueChange={onSpecializationChange} disabled={loading}>
          <SelectTrigger
            className="h-12 text-base bg-slate-800/50 border-2 border-slate-700 text-white focus-visible:border-orange-500 w-full px-4"
            aria-label={t('hero.specializationLabel')}
          >
            <SelectValue placeholder={loading ? tCommon('loading') : t('hero.specializationPlaceholder')} />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="bg-slate-900 border-slate-700 w-(--radix-select-trigger-width)"
            sideOffset={8}
          >
            {specializations.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                className="text-base text-white hover:bg-slate-800 focus:bg-slate-800 cursor-pointer py-3"
              >
                {category.icon} {getSpecializationName(category, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
