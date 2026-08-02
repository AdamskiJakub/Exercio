"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  MapPin,
  Star,
  BadgeCheck,
  Globe,
  Phone,
  ExternalLink,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMediaUrl, normalizeWebsiteUrl } from "@/lib/utils/media";
import { useAuthStore } from "@/stores/auth-store";
import {
  useIsFollowingEnterprise,
  useToggleFollowEnterprise,
} from "@/hooks/useFollow";
import { FollowButton } from "@/components/follow/FollowButton";
import type { EnterpriseProfile } from "@/types/enterprise";
import { FoundingPartnerBadge } from "./FoundingPartnerBadge";

interface EnterpriseHeroProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseHero({ enterprise }: EnterpriseHeroProps) {
  const t = useTranslations("EnterpriseProfile");
  const user = useAuthStore((state) => state.user);
  const canFollow = user?.role === "CLIENT" || user?.role === "INSTRUCTOR";

  const { data: isFollowing, isLoading: isCheckLoading } =
    useIsFollowingEnterprise(enterprise.id);
  const toggleMutation = useToggleFollowEnterprise();

  const [logoError, setLogoError] = useState(false);

  // Reset logo error state when the logo URL changes (e.g., client-side navigation between enterprises)
  useEffect(() => {
    setLogoError(false);
  }, [enterprise.logoUrl]);

  const initials = enterprise.companyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const businessTypeLabel = enterprise.businessType
    ? t(`categories.${enterprise.businessType}`)
    : null;

  const locale = useLocale();
  const openingHours = enterprise.openingHours as Record<string, string> | null;
  const todayKey = new Date()
    .toLocaleDateString(locale, { weekday: "long" })
    .toLowerCase();
  const todayHours = openingHours?.[todayKey]?.trim();

  const logo = (
    <div className="shrink-0">
      <div className="w-28 h-28 md:w-29.5 md:h-29.5 rounded-xl overflow-hidden bg-white shadow-2xl ring-2 ring-white/40">
        {enterprise.logoUrl && !logoError ? (
          <img
            src={getMediaUrl(enterprise.logoUrl)}
            alt={`${enterprise.companyName} logo`}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-slate-700 text-xl sm:text-2xl font-bold rounded-lg"
            role="img"
            aria-label={`${enterprise.companyName} initials`}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );

  const infoBlock = (
    <div className="flex-1 min-w-0 pb-1">
      <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
          {enterprise.companyName}
        </h1>
        {enterprise.verified && (
          <BadgeCheck
            className="size-5 sm:size-6 text-emerald-500 shrink-0 drop-shadow-lg"
            aria-label={t("verified")}
          />
        )}
      </div>
      {enterprise.shortDescription && (
        <p className="text-sm sm:text-base text-slate-200 mt-1 drop-shadow max-w-xl line-clamp-2">
          {enterprise.shortDescription}
        </p>
      )}
      {/* City + category */}
      <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-slate-300 justify-center md:justify-start">
        {enterprise.city && (
          <span className="flex items-center gap-1">
            <MapPin
              className="w-3.5 h-3.5 text-emerald-400"
              aria-hidden="true"
            />
            {enterprise.city}
          </span>
        )}
        {businessTypeLabel && (
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            {businessTypeLabel}
          </span>
        )}
      </div>
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2 mt-2 justify-center md:justify-start">
        {enterprise.foundingPartnerGrantedAt && (
          <FoundingPartnerBadge variant="profile" />
        )}
        {enterprise.instructors && enterprise.instructors.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-slate-200">
            <Users className="w-3 h-3 text-emerald-400" aria-hidden="true" />
            {enterprise.instructors.length}{" "}
            {enterprise.instructors.length === 1
              ? t("instructor")
              : t("instructors")}
          </span>
        )}
        {todayHours && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-slate-200">
            <Clock className="w-3 h-3 text-emerald-400" aria-hidden="true" />
            {t("openUntil")} {todayHours.split("-")[1]?.trim() || todayHours}
          </span>
        )}
        {enterprise.averageRating && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/20 backdrop-blur-sm rounded-full text-xs text-amber-300">
            <Star
              className="w-3 h-3 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            {enterprise.averageRating.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );

  const ctaButtons = (
    <>
      {canFollow && (
        <FollowButton
          isFollowing={isFollowing}
          isLoading={isCheckLoading}
          isPending={toggleMutation.isPending}
          onToggle={() =>
            toggleMutation.mutate({
              enterpriseId: enterprise.id,
              isFollowing: !!isFollowing,
            })
          }
        />
      )}
      {enterprise.phone && (
        <a href={`tel:${enterprise.phone}`}>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg">
            <Phone className="w-4 h-4" aria-hidden="true" />
            {t("call")}
          </Button>
        </a>
      )}
      {enterprise.website && (
        <a
          href={normalizeWebsiteUrl(enterprise.website)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg">
            <Globe className="w-4 h-4" aria-hidden="true" />
            {t("visitWebsite")}
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Button>
        </a>
      )}
    </>
  );

  return (
    <div className="relative" role="region" aria-label={enterprise.companyName}>
      <div className="relative w-full md:aspect-3/1 overflow-hidden bg-slate-800">
        {enterprise.coverUrl ? (
          <img
            src={getMediaUrl(enterprise.coverUrl)}
            alt={`${enterprise.companyName} cover`}
            className="w-full h-auto md:absolute md:inset-0 md:h-full md:w-full"
          />
        ) : (
          <div className="w-full h-full md:absolute md:inset-0 bg-linear-to-br from-slate-700 via-slate-800 to-slate-900" />
        )}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent"
          aria-hidden="true"
        />

        {/* ===== Desktop overlay: logo + info + CTA on the cover ===== */}
        <div className="absolute bottom-0 left-0 right-0 hidden md:block p-6 lg:p-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex items-end justify-between gap-6">
              <div className="flex items-end gap-4 sm:gap-6 min-w-0">
                {logo}
                {infoBlock}
              </div>
              <div className="flex flex-col gap-2 shrink-0">{ctaButtons}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile/tablet: logo overlaps the cover, content below ===== */}
      <div className="lg:hidden">
        {/* Logo pulled up so it overlaps the bottom of the cover */}
        <div className="flex justify-center -mt-14 relative z-10">{logo}</div>
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="flex flex-col items-center text-center">
            {infoBlock}
          </div>
          <div className="flex flex-col gap-2 mt-4">{ctaButtons}</div>
        </div>
      </div>
    </div>
  );
}
