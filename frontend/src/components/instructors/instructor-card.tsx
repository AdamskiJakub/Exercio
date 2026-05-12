'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCategoryById } from '@/lib/config/specializations';
import { getCategoryName } from '@/lib/utils/localization';
import { getTagById, getTagName } from '@/lib/config/tags';
import { MapPinIcon, VideoIcon, UserIcon, StarIcon } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils/media';
import type { InstructorCardProps } from './types';

export function InstructorCard({ instructor }: InstructorCardProps) {
  const locale = useLocale();
  const t = useTranslations('InstructorsPage.card');

  const primaryCategory = getCategoryById(instructor.primarySpecialization);
  const initials = instructor.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Link href={`/${locale}/instructors/${instructor.username}`} className="block group">
      <Card className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all duration-300 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 p-6">
          {/* Avatar Section */}
          <div className="shrink-0">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-slate-700 group-hover:border-orange-500 transition-colors">
              <AvatarImage
                src={getMediaUrl(instructor.photoUrl)}
                alt={instructor.fullName}
              />
              <AvatarFallback className="bg-slate-800 text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-3">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                  {instructor.fullName}
                  {instructor.verified && (
                    <span
                      className="ml-2 text-orange-500"
                      title={t('verified')}
                      aria-label={t('verified')}
                    >
                      ✓
                    </span>
                  )}
                </h3>
                {primaryCategory && (
                  <p className="text-sm text-slate-400 mt-1">
                    {primaryCategory.icon} {getCategoryName(primaryCategory, locale)}
                  </p>
                )}
              </div>

              {/* Price */}
              {instructor.hourlyRate !== null && instructor.hourlyRate !== undefined && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-500">
                    {instructor.hourlyRate} zł
                  </p>
                  <p className="text-xs text-slate-400">{t('perHour')}</p>
                </div>
              )}
            </div>

            {/* Tagline/Short Bio */}
            {instructor.tagline && (
              <p className="text-sm text-slate-300 line-clamp-2">
                {instructor.tagline}
              </p>
            )}

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Rating */}
              {instructor.averageRating && (
                <div className="flex items-center gap-1 text-orange-500">
                  <StarIcon className="w-4 h-4 fill-orange-500" />
                  <span className="font-semibold">
                    {instructor.averageRating.toFixed(1)}
                  </span>
                  {instructor.reviewCount && (
                    <span className="text-slate-400">
                      ({instructor.reviewCount})
                    </span>
                  )}
                </div>
              )}

              {/* Location */}
              {instructor.city && (
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{instructor.city}</span>
                </div>
              )}

              {/* Availability Badge */}
              <Badge
                variant="secondary"
                className="bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                {instructor.availability === 'online' && (
                  <>
                    <VideoIcon className="w-3 h-3 mr-1" />
                    {t('online')}
                  </>
                )}
                {instructor.availability === 'in-person' && (
                  <>
                    <UserIcon className="w-3 h-3 mr-1" />
                    {t('inPerson')}
                  </>
                )}
                {instructor.availability === 'both' && (
                  <>
                    <VideoIcon className="w-3 h-3 mr-1" />
                    {t('both')}
                  </>
                )}
              </Badge>

              {/* Experience */}
              {instructor.yearsExperience && (
                <span className="text-slate-400">
                  {t('yearsExp', { count: instructor.yearsExperience })}
                </span>
              )}
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-2">
              {/* Tags/Skills */}
              <div className="flex flex-wrap gap-2">
                {instructor.tags?.slice(0, 3).map((tagId) => {
                  const tag = getTagById(tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tagId}
                      variant="outline"
                      className="border-slate-700 text-slate-300 text-xs"
                    >
                      {getTagName(tag, locale)}
                    </Badge>
                  );
                })}
              </div>

              <span className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors">
                {t('viewProfile')} →
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
