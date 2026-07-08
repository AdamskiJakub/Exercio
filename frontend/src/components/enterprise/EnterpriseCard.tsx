"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPinIcon, StarIcon, Building2, Users } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";
import { useTags, getTagName } from "@/hooks/useConfig";
import type { EnterpriseListing } from "@/types/enterprise";

interface EnterpriseCardProps {
  enterprise: EnterpriseListing;
  disableLink?: boolean;
}

export function EnterpriseCard({
  enterprise,
  disableLink = false,
}: EnterpriseCardProps) {
  const locale = useLocale();
  const t = useTranslations("EnterpriseCard");
  const { tags } = useTags();

  const initials = enterprise.companyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const cardContent = (
    <Card className="bg-slate-900/30 border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-6 p-6">
        {/* Logo Section */}
        <div className="shrink-0">
          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors rounded-xl">
            <AvatarImage
              src={getMediaUrl(enterprise.logoUrl)}
              alt={enterprise.companyName}
            />
            <AvatarFallback className="bg-emerald-900/30 text-emerald-300 text-2xl font-bold rounded-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                {enterprise.companyName}
                {enterprise.verified && (
                  <span
                    className="text-emerald-400"
                    title={t("verified")}
                    aria-label={t("verified")}
                  >
                    ✓
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {enterprise.category && (
                  <p className="text-sm text-slate-400">
                    {t(`categories.${enterprise.category}`)}
                  </p>
                )}
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs"
                >
                  {t("partner")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Short Description */}
          {enterprise.shortDescription && (
            <p className="text-sm text-slate-300 line-clamp-2">
              {enterprise.shortDescription}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Rating */}
            {enterprise.averageRating && (
              <div className="flex items-center gap-1 text-emerald-400">
                <StarIcon className="w-4 h-4 fill-emerald-400" />
                <span className="font-semibold">
                  {enterprise.averageRating.toFixed(1)}
                </span>
                {enterprise.reviewCount && (
                  <span className="text-slate-400">
                    ({enterprise.reviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Instructor count */}
            {enterprise.instructorCount !== undefined && (
              <div className="flex items-center gap-1 text-slate-400">
                <Users className="w-4 h-4" />
                <span>
                  {enterprise.instructorCount}{" "}
                  {enterprise.instructorCount === 1
                    ? t("instructor")
                    : t("instructors")}
                </span>
              </div>
            )}

            {/* Location */}
            {enterprise.city && (
              <div className="flex items-center gap-1 text-slate-400">
                <MapPinIcon className="w-4 h-4" />
                <span>{enterprise.city}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {enterprise.tags?.slice(0, 3).map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
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

          {!disableLink && (
            <div className="flex justify-end">
              <span className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                {t("viewProfile")} →
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (disableLink) {
    return <div className="block">{cardContent}</div>;
  }

  return (
    <Link
      href={`/${locale}/enterprise/${enterprise.slug}`}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
    >
      {cardContent}
    </Link>
  );
}
