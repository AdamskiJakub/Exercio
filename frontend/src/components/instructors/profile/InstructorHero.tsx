"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Globe,
  Star,
  BadgeCheck,
  Shield,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/utils/media";
import { useSpecializations, getSpecializationName } from "@/hooks/useConfig";
import { useDisciplines } from "@/hooks/useCatalog";
import { getFullName } from "@/lib/utils/user";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import type { InstructorProfile } from "@/types";
import type { CatalogDiscipline } from "@/lib/catalog-types";
import { useAuthStore } from "@/stores/auth-store";
import { slugifyCity } from "@/lib/seo/slug-utils";
import { FavoriteButton } from "./FavoriteButton";
import { FollowInstructorButton } from "./FollowInstructorButton";

interface InstructorHeroProps {
  profile: InstructorProfile;
  onBookClick: () => void;
  onNearestSlotClick?: (date: string, time: string) => void;
  nearestSlot: { date: string; time: string } | null;
}

export function InstructorHero({
  profile,
  onBookClick,
  onNearestSlotClick,
  nearestSlot,
}: InstructorHeroProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const t = useTranslations("InstructorProfile");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : undefined;
  const { specializations } = useSpecializations();
  const { disciplines } = useDisciplines();

  // Don't show favorite button on own profile
  const isOwnProfile = user?.id === profile.userId;

  const fullName = getFullName(profile.user, "Instructor");
  const primarySpecialization = profile.specializations?.[0];
  const specializationName = primarySpecialization
    ? specializations.find((s) => s.id === primarySpecialization)
    : null;

  // Find the first discipline matching the instructor's primary specialization
  // Some specialization IDs match discipline keys directly (e.g. "personal-training"),
  // others are category IDs (e.g. "martial-arts") that contain multiple disciplines
  const matchingDiscipline: CatalogDiscipline | undefined =
    React.useMemo(() => {
      if (!primarySpecialization || !disciplines.length) return undefined;

      // First try: direct key match (specialization ID === discipline key)
      const directMatch = disciplines.find(
        (d) => d.key === primarySpecialization,
      );
      if (directMatch) return directMatch;

      // Second try: category match (specialization ID === discipline categoryId)
      return disciplines.find(
        (d) => d.categoryId === `cat_${primarySpecialization}`,
      );
    }, [primarySpecialization, disciplines]);

  // Build SEO link: /{locale}/{citySlug}/{disciplineSlug}
  const disciplineSlug =
    locale === "pl"
      ? matchingDiscipline?.slugs.pl
      : matchingDiscipline?.slugs.en;
  const seoLink =
    profile.city && matchingDiscipline && disciplineSlug
      ? `/${locale}/${slugifyCity(profile.city)}/${disciplineSlug}`
      : null;

  const showPrice =
    !profile.hourlyRateHidden && (profile.sessionPrice || profile.hourlyRate);
  const price = profile.sessionPrice || profile.hourlyRate || 0;
  const duration = profile.sessionDuration || 60;

  const memberSince = profile.createdAt
    ? format(parseISO(profile.createdAt), "MMMM yyyy", { locale: dateLocale })
    : null;

  const tagline =
    profile.tagline ||
    (profile.bio ? profile.bio.split("\n")[0].slice(0, 150) : null);

  // Format nearest slot day name
  const nearestSlotDay = nearestSlot
    ? format(parseISO(nearestSlot.date), "EEEE", { locale: dateLocale })
    : null;
  const isNearestSlotTomorrow =
    nearestSlot &&
    format(parseISO(nearestSlot.date), "yyyy-MM-dd") ===
      format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

  return (
    <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 lg:p-10">
        {/* LEFT COLUMN: Avatar & Basic Info */}
        <div className="lg:col-span-3 space-y-5">
          <div className="relative w-full aspect-square max-w-70 mx-auto rounded-2xl overflow-hidden border-4 border-orange-500 bg-slate-700">
            {profile.photoUrl ? (
              <img
                src={getMediaUrl(profile.photoUrl)}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold bg-slate-700">
                {fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* Mobile: Name & Spec (visible only on mobile, hidden on desktop - center column handles desktop) */}
          <div className="text-center space-y-1 lg:hidden">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              {fullName}
              {profile.verified && (
                <BadgeCheck className="size-5 text-orange-500" />
              )}
            </h1>
            {specializationName && (
              <p className="text-sm text-slate-400 font-medium">
                {getSpecializationName(specializationName, locale)}
              </p>
            )}
          </div>

          {/* Key Info */}
          <div className="space-y-3 text-sm">
            {/* Location */}
            {(profile.location || profile.city) && (
              <div className="flex items-center gap-2 text-slate-300 justify-center lg:justify-start">
                <MapPin className="size-4 shrink-0" />
                <span>{profile.location || profile.city}</span>
              </div>
            )}

            {/* Availability type */}
            {profile.availability && (
              <div className="flex justify-center lg:justify-start">
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-slate-200"
                >
                  {profile.availability === "online" && (
                    <>
                      <Globe className="size-3 mr-1" />
                      {t("availabilityOnline")}
                    </>
                  )}
                  {profile.availability === "in-person" && (
                    <>
                      <MapPin className="size-3 mr-1" />
                      {t("availabilityInPerson")}
                    </>
                  )}
                  {profile.availability === "both" && (
                    <>
                      <Globe className="size-3 mr-1" />
                      {t("availabilityBoth")}
                    </>
                  )}
                </Badge>
              </div>
            )}

            {/* Enterprise Organization */}
            {profile.enterpriseMemberships?.[0]?.enterprise &&
              (() => {
                const org = profile.enterpriseMemberships[0].enterprise;
                return (
                  <div className="flex justify-center lg:justify-start">
                    <span
                      onClick={() =>
                        router.push(`/${locale}/enterprise/${org.slug}`)
                      }
                      className="flex flex-col lg:flex-row lg:items-center items-center gap-1 text-slate-300 hover:text-orange-400 transition-colors cursor-pointer group"
                    >
                      <span className="text-sm font-medium text-slate-400">
                        {t("instructorAt")}:
                      </span>
                      <span className="inline-flex items-center gap-2">
                        {org.logoUrl ? (
                          <span className="w-8 h-8 rounded-full overflow-hidden border border-slate-600 bg-white shrink-0 inline-block">
                            <img
                              src={getMediaUrl(org.logoUrl)}
                              alt={org.companyName}
                              className="w-full h-full object-cover"
                            />
                          </span>
                        ) : (
                          <Building2 className="size-5 shrink-0 text-slate-400 group-hover:text-orange-400" />
                        )}
                        <span className="text-base font-semibold text-slate-200">
                          {org.companyName}
                        </span>
                      </span>
                    </span>
                  </div>
                );
              })()}
          </div>
        </div>

        {/* CENTER COLUMN: Name, Rating, Trust Badges, Tagline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Desktop: Name & Spec */}
          <div className="hidden lg:block space-y-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              {fullName}
              {profile.verified && (
                <BadgeCheck className="size-6 text-orange-500" />
              )}
            </h1>
            {specializationName && (
              <p className="text-lg text-slate-400 font-medium">
                {getSpecializationName(specializationName, locale)}
              </p>
            )}
          </div>

          {/* Rating */}
          {profile.averageRating !== null &&
            profile.averageRating !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-5 ${
                        star <= Math.round(profile.averageRating!)
                          ? "fill-orange-500 text-orange-500"
                          : "fill-slate-600 text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-white">
                  {profile.averageRating.toFixed(1)}
                </span>
                {profile.reviewCount !== null &&
                  profile.reviewCount !== undefined && (
                    <span className="text-slate-400">
                      ({profile.reviewCount} {t("reviews")})
                    </span>
                  )}
              </div>
            )}

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3">
            {profile.verified && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                <BadgeCheck className="size-4" />
                <span>{t("verifiedInstructor")}</span>
              </div>
            )}
            {memberSince && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Shield className="size-4" />
                <span>
                  {t("memberSince")} {memberSince}
                </span>
              </div>
            )}
          </div>

          {/* Tagline / Short Bio */}
          {tagline && (
            <div className="border-l-4 border-orange-500/50 pl-4">
              <p className="text-base text-slate-300 leading-relaxed">
                {tagline}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Booking Card (sticky on desktop) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <div className="relative bg-slate-900/80 border-2 border-orange-500/40 rounded-xl p-8 space-y-6 shadow-xl shadow-orange-500/5">
            {/* Price */}
            {showPrice ? (
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2 font-medium uppercase tracking-wide">
                  {t("pricing")}
                </p>
                <p className="text-4xl font-bold text-orange-500">{price} zł</p>
                <p className="text-base text-slate-400 mt-1">
                  / {duration} {t("minutes")}
                </p>
              </div>
            ) : profile.hourlyRateHidden ? (
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2 font-medium uppercase tracking-wide">
                  {t("pricing")}
                </p>
                <p className="text-xl font-bold text-orange-500">
                  {t("contactForPrice")}
                </p>
              </div>
            ) : null}

            {/* Package Deals */}
            {profile.packageDealsEnabled && profile.packageDealsDescription && (
              <>
                <div className="border-t border-slate-700" />
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide font-medium">
                    {t("packageDeals")}
                  </p>
                  <p className="text-orange-400 text-base leading-relaxed whitespace-pre-line">
                    {profile.packageDealsDescription}
                  </p>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-slate-700" />

            {/* Nearest Slot */}
            {nearestSlot && (
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">
                  {t("nearestAvailable")}
                </p>
                <p className="text-lg font-semibold text-white">
                  {isNearestSlotTomorrow ? t("tomorrow") : nearestSlotDay}
                </p>
                <button
                  onClick={() =>
                    onNearestSlotClick?.(nearestSlot.date, nearestSlot.time)
                  }
                  className="text-3xl font-bold text-orange-400 mt-1 hover:text-orange-300 transition-colors cursor-pointer"
                  title={t("chooseTerm")}
                >
                  {nearestSlot.time}
                </button>
              </div>
            )}

            {/* CTA - hidden for enterprise accounts */}
            {profile.isBookingEnabled && user?.role !== "ENTERPRISE" && (
              <Button
                onClick={onBookClick}
                className="cursor-pointer w-full py-6 text-lg font-bold bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg shadow-orange-500/20"
              >
                {t("chooseTerm")}
              </Button>
            )}

            {/* Favorite Button — below CTA (hidden on own profile) */}
            {profile.isBookingEnabled &&
              user?.role !== "ENTERPRISE" &&
              !isOwnProfile && (
                <div className="mt-3">
                  <FavoriteButton instructorProfileId={profile.id} />
                </div>
              )}

            {/* Follow Button — for ENTERPRISE accounts (hidden on own profile) */}
            {user?.role === "ENTERPRISE" && !isOwnProfile && (
              <div className="mt-3">
                <FollowInstructorButton instructorProfileId={profile.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
