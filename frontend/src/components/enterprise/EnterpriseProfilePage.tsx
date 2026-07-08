"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { EnterpriseHero } from "./EnterpriseHero";
import { EnterpriseInstructors } from "./EnterpriseInstructors";
import { EnterpriseNews } from "./EnterpriseNews";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { getMediaUrl } from "@/lib/utils/media";
import type { EnterpriseProfile } from "@/types/enterprise";
import {
  Clock,
  MapPin,
  Star,
  Users,
  Award,
  Target,
  CheckCircle2,
} from "lucide-react";

interface EnterpriseProfilePageProps {
  enterprise: EnterpriseProfile;
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export function EnterpriseProfilePage({
  enterprise,
}: EnterpriseProfilePageProps) {
  const t = useTranslations("EnterpriseProfile");
  const searchParams = useSearchParams();
  const fromDashboard = searchParams.get("from") === "dashboard";

  const openingHours = enterprise.openingHours as Record<string, string> | null;
  const highlights = enterprise.highlights as
    | { label: string; value: string }[]
    | null;

  const hasHours =
    openingHours && Object.values(openingHours).some((v) => v?.trim());

  const highlightIcons = [Star, Users, Award, Target, CheckCircle2];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Cover Photo Hero */}
      {enterprise.coverUrl && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-128 overflow-hidden">
          <img
            src={getMediaUrl(enterprise.coverUrl)}
            alt={`${enterprise.companyName} cover`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section (logo, name, description, contact) */}
        <EnterpriseHero enterprise={enterprise} />

        {/* Highlights / Stats */}
        {highlights && highlights.length > 0 && (
          <section className="space-y-4" aria-labelledby="highlights-heading">
            <h2
              id="highlights-heading"
              className="text-2xl font-bold text-white flex items-center gap-2"
            >
              <Award className="w-6 h-6 text-emerald-400" />
              {t("highlights")}
            </h2>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              role="list"
              aria-label={t("highlights")}
            >
              {highlights.map((item, index) => {
                const Icon = highlightIcons[index % highlightIcons.length];
                return (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center hover:border-emerald-500/30 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {item.value}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Opening Hours */}
        {hasHours && (
          <section className="space-y-4" aria-labelledby="hours-heading">
            <h2
              id="hours-heading"
              className="text-2xl font-bold text-white flex items-center gap-2"
            >
              <Clock className="w-6 h-6 text-emerald-400" />
              {t("openingHours")}
            </h2>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden max-w-md">
              {DAYS_OF_WEEK.map((day, index) => {
                const hours = openingHours?.[day];
                const today = new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                });
                const isToday = today.toLowerCase() === t(day).toLowerCase();
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between px-5 py-3 ${
                      index < DAYS_OF_WEEK.length - 1
                        ? "border-b border-slate-700/50"
                        : ""
                    } ${isToday ? "bg-emerald-500/5" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isToday ? "text-emerald-400" : "text-slate-300"
                      }`}
                    >
                      {t(day)}
                      {isToday && (
                        <span className="ml-2 text-xs text-emerald-500">
                          <span
                            aria-hidden="true"
                            className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 align-middle"
                          />
                          ({t("today")})
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        hours?.trim()
                          ? "text-slate-300"
                          : "text-slate-500 italic"
                      }`}
                    >
                      {hours?.trim() || t("closed")}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Full Description */}
        {enterprise.description && (
          <section className="space-y-4" aria-labelledby="description-heading">
            <h2
              id="description-heading"
              className="text-2xl font-bold text-white"
            >
              {t("about")}
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {enterprise.description}
            </p>
          </section>
        )}

        {/* Amenities */}
        {enterprise.amenities && enterprise.amenities.length > 0 && (
          <section className="space-y-4" aria-labelledby="amenities-heading">
            <h2
              id="amenities-heading"
              className="text-2xl font-bold text-white"
            >
              {t("amenities")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {enterprise.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="bg-slate-800/50 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {enterprise.gallery && enterprise.gallery.length > 0 && (
          <section className="space-y-4" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="text-2xl font-bold text-white">
              {t("gallery")}
            </h2>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              role="list"
              aria-label={t("gallery")}
            >
              {enterprise.gallery.map((url, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-800 group"
                >
                  <img
                    src={getMediaUrl(url)}
                    alt={`${enterprise.companyName} gallery ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Instructors Section */}
        {enterprise.instructors && enterprise.instructors.length > 0 && (
          <EnterpriseInstructors instructors={enterprise.instructors} />
        )}

        {/* News Section */}
        {enterprise.news && enterprise.news.length > 0 && (
          <EnterpriseNews news={enterprise.news} />
        )}
      </div>

      <BottomNavBar
        backText={fromDashboard ? t("backToDashboard") : t("backToListing")}
        backHref={fromDashboard ? "/dashboard" : "/instructors"}
      />
    </div>
  );
}
