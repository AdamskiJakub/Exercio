"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  MapPin,
  Globe,
  Star,
  BadgeCheck,
  Building2,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/utils/media";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseHeroProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseHero({ enterprise }: EnterpriseHeroProps) {
  const t = useTranslations("EnterpriseProfile");
  const locale = useLocale();

  const initials = enterprise.companyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden"
      role="region"
      aria-label={`${enterprise.companyName} — ${t("contact")}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 lg:p-10">
        {/* LEFT COLUMN: Logo & Basic Info */}
        <div className="lg:col-span-3 space-y-5">
          <div className="relative w-full aspect-square max-w-70 mx-auto rounded-2xl overflow-hidden border-4 border-emerald-500 bg-slate-700">
            {enterprise.logoUrl ? (
              <img
                src={getMediaUrl(enterprise.logoUrl)}
                alt={`${enterprise.companyName} logo`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-6xl font-bold bg-slate-700"
                role="img"
                aria-label={`${enterprise.companyName} initials`}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Mobile: Name & Category (visible only on mobile) */}
          <div className="text-center space-y-1 lg:hidden">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Building2
                className="size-6 text-emerald-500"
                aria-hidden="true"
              />
              {enterprise.companyName}
              {enterprise.verified && (
                <BadgeCheck
                  className="size-5 text-emerald-500"
                  aria-label={t("verified")}
                />
              )}
            </h1>
            {enterprise.category && (
              <p className="text-sm text-slate-400 font-medium">
                {t(`categories.${enterprise.category}`)}
              </p>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Main Info */}
        <div className="lg:col-span-6 space-y-5">
          {/* Desktop: Name & Category (hidden on mobile) */}
          <div className="hidden lg:block space-y-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Building2
                className="size-8 text-emerald-500"
                aria-hidden="true"
              />
              {enterprise.companyName}
              {enterprise.verified && (
                <BadgeCheck
                  className="size-6 text-emerald-500"
                  aria-label={t("verified")}
                />
              )}
            </h1>
            {enterprise.category && (
              <p className="text-base text-slate-400 font-medium">
                {t(`categories.${enterprise.category}`)}
              </p>
            )}
          </div>

          {/* Short Description */}
          {enterprise.shortDescription && (
            <p className="text-lg text-slate-300 leading-relaxed">
              {enterprise.shortDescription}
            </p>
          )}

          {/* Full Description */}
          {enterprise.description && (
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line line-clamp-4">
              {enterprise.description}
            </p>
          )}

          {/* Metadata */}
          <div
            className="flex flex-wrap items-center gap-4 text-sm"
            role="list"
          >
            {/* Rating */}
            {enterprise.averageRating && (
              <div
                className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full"
                role="listitem"
              >
                <Star className="w-4 h-4 fill-emerald-500" aria-hidden="true" />
                <span
                  className="font-semibold"
                  aria-label={`${t("rating")}: ${enterprise.averageRating.toFixed(1)}`}
                >
                  {enterprise.averageRating.toFixed(1)}
                </span>
                {enterprise.reviewCount && (
                  <span className="text-slate-400">
                    ({enterprise.reviewCount} {t("reviews")})
                  </span>
                )}
              </div>
            )}

            {/* Location */}
            {enterprise.city && (
              <div
                className="flex items-center gap-1.5 text-slate-400"
                role="listitem"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>{enterprise.city}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {enterprise.tags && enterprise.tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-label={t("tags")}
            >
              {enterprise.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-slate-700/50 text-slate-300"
                  role="listitem"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Contact & Actions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900/50 rounded-xl p-5 space-y-3 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              {t("contact")}
            </h3>

            {enterprise.email && (
              <a
                href={`mailto:${enterprise.email}`}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                aria-label={`${t("email")}: ${enterprise.email}`}
              >
                <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                {enterprise.email}
              </a>
            )}

            {enterprise.phone && (
              <a
                href={`tel:${enterprise.phone}`}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                aria-label={`${t("phone")}: ${enterprise.phone}`}
              >
                <Phone
                  className="w-4 h-4 text-emerald-500"
                  aria-hidden="true"
                />
                {enterprise.phone}
              </a>
            )}

            {enterprise.website && (
              <a
                href={enterprise.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                aria-label={`${t("website")}: ${enterprise.website} (${t("opensInNewTab")})`}
              >
                <ExternalLink
                  className="w-4 h-4 text-emerald-500"
                  aria-hidden="true"
                />
                {t("website")}
              </a>
            )}

            {enterprise.address && (
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin
                  className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {enterprise.address}
                  {enterprise.postalCode && `, ${enterprise.postalCode}`}
                </span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(enterprise.facebookUrl ||
            enterprise.instagramUrl ||
            enterprise.youtubeUrl ||
            enterprise.tiktokUrl) && (
            <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                {t("social")}
              </h3>
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label={t("social")}
              >
                {enterprise.facebookUrl && (
                  <a
                    href={enterprise.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    aria-label={`Facebook (${t("opensInNewTab")})`}
                    role="listitem"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {enterprise.instagramUrl && (
                  <a
                    href={enterprise.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    aria-label={`Instagram (${t("opensInNewTab")})`}
                    role="listitem"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                )}
                {enterprise.youtubeUrl && (
                  <a
                    href={enterprise.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    aria-label={`YouTube (${t("opensInNewTab")})`}
                    role="listitem"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {enterprise.tiktokUrl && (
                  <a
                    href={enterprise.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    aria-label={`TikTok (${t("opensInNewTab")})`}
                    role="listitem"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
