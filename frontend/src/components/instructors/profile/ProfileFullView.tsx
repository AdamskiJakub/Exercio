'use client';

import { useState } from 'react';
import { InstructorProfile } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, Star, Clock, Award, Target, Languages as LanguagesIcon, Play } from 'lucide-react';
import { getSpecializationName } from '@/lib/config/specializations';
import { getTagName, getTagById } from '@/lib/config/tags';
import { getGoalName, getGoalById } from '@/lib/config/goals';
import { getMediaUrl, isVideoUrl } from '@/lib/utils/media';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ContactSection } from '@/components/instructors/profile/ContactSection';

interface ProfileFullViewProps {
  profile: InstructorProfile;
}

export function ProfileFullView({ profile }: ProfileFullViewProps) {
  const locale = useLocale();
  const t = useTranslations('InstructorProfile');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const fullName = profile.user?.firstName && profile.user?.lastName
    ? `${profile.user.firstName} ${profile.user.lastName}`
    : profile.user?.username || 'Unknown Instructor';

  const primarySpecialization = profile.specializations?.[0];
  const additionalSpecializations = profile.specializations?.slice(1) || [];

  // Combine photoUrl and gallery for lightbox
  const allMedia = [
    ...(profile.photoUrl ? [profile.photoUrl] : []),
    ...(profile.gallery || [])
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
      {/* Main Content Area - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8">
        
        {/* LEFT COLUMN: Avatar & Basic Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Kwadratowe zdjęcie zamiast kółka */}
          <div 
            className={`relative w-full aspect-square max-w-70 mx-auto rounded-2xl overflow-hidden border-4 border-orange-500 bg-slate-700 ${
              profile.photoUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
            }`}
            onClick={() => profile.photoUrl && openLightbox(0)}
          >
            {profile.photoUrl ? (
              <img 
                src={getMediaUrl(profile.photoUrl)} 
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold bg-slate-700">
                {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
          </div>

          {/* Name & Primary Spec */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              {fullName}
              {profile.verified && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">
                  ✓
                </Badge>
              )}
            </h1>
            {primarySpecialization && (
              <p className="text-sm text-slate-400 font-medium">
                {getSpecializationName(primarySpecialization, locale)}
              </p>
            )}
          </div>

          {/* Key Stats */}
          <div className="space-y-3 text-sm">
            {/* Rating */}
            {profile.averageRating !== null && profile.averageRating !== undefined && (
              <div className="flex items-center gap-2 text-orange-500 justify-center">
                <Star className="size-5 fill-orange-500" />
                <span className="font-bold text-lg">{profile.averageRating.toFixed(1)}</span>
                {profile.reviewCount !== null && profile.reviewCount !== undefined && (
                  <span className="text-slate-400">({profile.reviewCount})</span>
                )}
              </div>
            )}

            {/* Location */}
            {profile.city && (
              <div className="flex items-center gap-2 text-slate-300 justify-center">
                <MapPin className="size-4" />
                <span>{profile.city}</span>
              </div>
            )}

            {/* Availability */}
            {profile.availability && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                  {profile.availability === 'online' && (
                    <>
                      <Globe className="size-3 mr-1" />
                      {t('availabilityOnline')}
                    </>
                  )}
                  {profile.availability === 'in-person' && (
                    <>
                      <MapPin className="size-3 mr-1" />
                      {t('availabilityInPerson')}
                    </>
                  )}
                  {profile.availability === 'both' && (
                    <>
                      <Globe className="size-3 mr-1" />
                      {t('availabilityBoth')}
                    </>
                  )}
                </Badge>
              </div>
            )}

            {/* Experience */}
            {profile.yearsExperience !== null && profile.yearsExperience !== undefined && (
              <div className="flex items-center gap-2 text-slate-300 justify-center">
                <Clock className="size-4" />
                <span>{t('yearsExperience', { count: profile.yearsExperience })}</span>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Description & Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tagline */}
          {profile.tagline && (
            <div>
              <p className="text-lg text-slate-300 italic">"{profile.tagline}"</p>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="size-5 text-orange-500" />
                <h2 className="text-xl font-bold text-white">{t('aboutMe')}</h2>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Additional Specializations */}
          {additionalSpecializations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                {t('additionalSpecializations')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {additionalSpecializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="bg-slate-700 text-slate-200">
                    {getSpecializationName(spec, locale)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {profile.goals && profile.goals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="size-5 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  {t('iHelpYouAchieve')}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goalId) => {
                  const goal = getGoalById(goalId);
                  return goal ? (
                    <Badge key={goalId} variant="outline" className="border-orange-500/50 text-orange-400">
                      {goal.icon} {getGoalName(goal, locale)}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LanguagesIcon className="size-5 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  {t('languages')}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="bg-slate-700 text-slate-200">
                    {lang.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <ContactSection profile={profile} />
        </div>

        {/* RIGHT COLUMN: Price & Tags */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price Card */}
          {!profile.hourlyRateHidden && profile.hourlyRate !== null && profile.hourlyRate !== undefined ? (
            <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-6 text-center">
              <p className="text-sm text-orange-400 mb-2 font-semibold uppercase tracking-wide">
                {t('hourlyRate')}
              </p>
              <p className="text-4xl font-bold text-orange-500">
                {profile.hourlyRate} zł
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {t('perHour')}
              </p>
            </div>
          ) : profile.hourlyRateHidden ? (
            <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-6 text-center">
              <p className="text-sm text-orange-400 mb-2 font-semibold uppercase tracking-wide">
                {t('hourlyRate')}
              </p>
              <p className="text-xl font-bold text-orange-500">
                {t('contactForPricing')}
              </p>
            </div>
          ) : null}

          {/* Package Deals Card */}
          {profile.packageDealsEnabled && profile.packageDealsDescription && (
            <div className="bg-green-500/10 border-2 border-green-500/50 rounded-xl p-6">
              <p className="text-sm text-green-400 mb-3 font-semibold uppercase tracking-wide flex items-center gap-2">
                <span>📦</span> {t('packageDeals')}
              </p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                {profile.packageDealsDescription}
              </p>
            </div>
          )}

          {/* Tags */}
          {profile.tags && profile.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                {t('skillsExpertise')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tagId) => {
                  const tag = getTagById(tagId);
                  return tag ? (
                    <Badge key={tagId} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {getTagName(tag, locale)}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section - Full Width at Bottom */}
      {profile.gallery && profile.gallery.length > 0 && (
        <div className="border-t border-slate-700 p-8 bg-slate-900/30">
          <h2 className="text-xl font-bold text-white mb-4">{t('gallery')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.gallery.map((url, idx) => {
              const galleryIndex = profile.photoUrl ? idx + 1 : idx; // Offset if photoUrl exists
              const isVideo = isVideoUrl(url);
              
              return (
                <div 
                  key={idx} 
                  className="aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity relative"
                  onClick={() => openLightbox(galleryIndex)}
                >
                  {isVideo ? (
                    <>
                      {/* Video with first frame as poster */}
                      <video 
                        src={getMediaUrl(url)} 
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                        <div className="bg-white/90 rounded-full p-3">
                          <Play className="size-8 text-slate-900 fill-slate-900" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img 
                      src={getMediaUrl(url)} 
                      alt={t('galleryImage', { number: idx + 1 })}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={allMedia}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
