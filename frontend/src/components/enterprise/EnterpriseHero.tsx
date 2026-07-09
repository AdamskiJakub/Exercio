"use client";

import { useTranslations } from "next-intl";
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
import { getMediaUrl } from "@/lib/utils/media";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseHeroProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseHero({ enterprise }: EnterpriseHeroProps) {
  const t = useTranslations("EnterpriseProfile");

  const initials = enterprise.companyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const businessTypeLabel = enterprise.businessType
    ? t(`categories.${enterprise.businessType}`)
    : null;

  const openingHours = enterprise.openingHours as Record<string, string> | null;
  const todayKey = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const todayHours = openingHours?.[todayKey]?.trim();

  return (
    <div className="relative" role="region" aria-label={enterprise.companyName}>
      {/* Full-width cover — 420px height */}
      <div className="relative w-full h-105 overflow-hidden">
        {enterprise.coverUrl ? (
          <img
            src={getMediaUrl(enterprise.coverUrl)}
            alt={`${enterprise.companyName} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-700 via-slate-800 to-slate-900" />
        )}
        {/* Dark gradient overlay at the bottom */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent"
          aria-hidden="true"
        />

        {/* Bottom info block — inside the hero, aligned with content container */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-end justify-between gap-6">
              {/* LEFT: logo + company info */}
              <div className="flex items-end gap-4 sm:gap-6 min-w-0">
                {/* Logo — white background card, bigger to match heading height */}
                <div className="shrink-0">
                  <div className="w-24 h-24 sm:w-29.5 sm:h-29.5 rounded-xl overflow-hidden bg-white p-1.5 shadow-2xl ring-2 ring-white/40">
                    {enterprise.logoUrl ? (
                      <img
                        src={getMediaUrl(enterprise.logoUrl)}
                        alt={`${enterprise.companyName} logo`}
                        className="w-full h-full object-contain rounded-lg"
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

                {/* Name + description + badges */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
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
                  <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-slate-300">
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
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {enterprise.instructors &&
                      enterprise.instructors.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-slate-200">
                          <Users
                            className="w-3 h-3 text-emerald-400"
                            aria-hidden="true"
                          />
                          {enterprise.instructors.length}{" "}
                          {enterprise.instructors.length === 1
                            ? t("instructor")
                            : t("instructors")}
                        </span>
                      )}
                    {todayHours && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-slate-200">
                        <Clock
                          className="w-3 h-3 text-emerald-400"
                          aria-hidden="true"
                        />
                        {t("openUntil")}{" "}
                        {todayHours.split("-")[1]?.trim() || todayHours}
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
              </div>

              {/* RIGHT: CTA buttons */}
              <div className="hidden sm:flex flex-col gap-2 shrink-0">
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
                    href={enterprise.website}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA buttons (visible only on small screens) */}
      <div className="max-w-7xl mx-auto px-8 sm:hidden mt-4">
        <div className="flex flex-col gap-2">
          {enterprise.phone && (
            <a href={`tel:${enterprise.phone}`}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                <Phone className="w-4 h-4" aria-hidden="true" />
                {t("call")}
              </Button>
            </a>
          )}
          {enterprise.website && (
            <a
              href={enterprise.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                <Globe className="w-4 h-4" aria-hidden="true" />
                {t("visitWebsite")}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
