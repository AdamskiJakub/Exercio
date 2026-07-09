"use client";

import { useTranslations } from "next-intl";
import {
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Clock,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK, SOCIAL_PLATFORMS } from "@/constants/enterprise";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseProfileSidebarProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseProfileSidebar({
  enterprise,
}: EnterpriseProfileSidebarProps) {
  const t = useTranslations("EnterpriseProfile");

  const openingHours = enterprise.openingHours as Record<string, string> | null;
  const hasHours =
    openingHours && Object.values(openingHours).some((v) => v?.trim());

  const googleMapsSearchUrl = enterprise.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${enterprise.address}${enterprise.city ? `, ${enterprise.city}` : ""}`,
      )}`
    : null;

  return (
    <aside className="mt-12 lg:mt-0 lg:sticky lg:top-24 lg:self-start space-y-6">
      {/* Contact */}
      <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-500" aria-hidden="true" />
          {t("contact")}
        </h3>

        <div className="space-y-3">
          {enterprise.phone && (
            <a
              href={`tel:${enterprise.phone}`}
              className="flex items-center gap-3 text-slate-300 hover:text-emerald-500 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600/30 transition-colors">
                <Phone
                  className="w-4 h-4 text-emerald-500"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-medium">{enterprise.phone}</span>
            </a>
          )}
          {enterprise.email && (
            <a
              href={`mailto:${enterprise.email}`}
              className="flex items-center gap-3 text-slate-300 hover:text-emerald-500 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600/30 transition-colors">
                <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium break-all">
                {enterprise.email}
              </span>
            </a>
          )}
          {enterprise.website && (
            <a
              href={enterprise.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-slate-300 hover:text-emerald-500 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600/30 transition-colors">
                <Globe
                  className="w-4 h-4 text-emerald-500"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-medium truncate">
                {enterprise.website}
              </span>
              <ExternalLink
                className="w-3 h-3 shrink-0 ml-auto text-slate-500"
                aria-hidden="true"
              />
            </a>
          )}
        </div>

        {/* Social links */}
        {SOCIAL_PLATFORMS.some(
          (platform) => enterprise[platform.key as keyof EnterpriseProfile],
        ) && (
          <div className="flex gap-2 pt-3 border-t border-slate-800">
            {SOCIAL_PLATFORMS.map((platform) => {
              const url = enterprise[
                platform.key as keyof EnterpriseProfile
              ] as string | null;
              if (!url) return null;
              return (
                <a
                  key={platform.key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-500 transition-colors"
                  aria-label={`${platform.label} (${t("opensInNewTab")})`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={platform.path} />
                  </svg>
                </a>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          {enterprise.email ? (
            <a href={`mailto:${enterprise.email}`}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-sm cursor-pointer">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                {t("contactUs")}
              </Button>
            </a>
          ) : enterprise.phone ? (
            <a href={`tel:${enterprise.phone}`}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-sm cursor-pointer">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                {t("contactUs")}
              </Button>
            </a>
          ) : (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-sm cursor-pointer">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              {t("contactUs")}
            </Button>
          )}
        </div>
      </Card>

      {/* Opening Hours */}
      {hasHours && (
        <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            {t("openingHours")}
          </h3>
          <div className="space-y-1">
            {DAYS_OF_WEEK.map((day) => {
              const hours = openingHours?.[day];
              const today = new Date().toLocaleDateString("en-US", {
                weekday: "long",
              });
              const isToday = today.toLowerCase() === t(day).toLowerCase();
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                    isToday
                      ? "bg-emerald-600/10 text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {t(day)}
                    {isToday && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider text-emerald-500">
                        ({t("today")})
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-sm ${
                      hours?.trim() ? "font-medium" : "text-slate-500 italic"
                    }`}
                  >
                    {hours?.trim() || t("closed")}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Location */}
      {(enterprise.address || enterprise.city) && (
        <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            {t("ourLocation")}
          </h3>

          <div className="space-y-1">
            {enterprise.address && (
              <p className="text-sm text-slate-300">
                {enterprise.address}
                {enterprise.postalCode && `, ${enterprise.postalCode}`}
              </p>
            )}
            {enterprise.city && (
              <p className="text-sm text-slate-300">{enterprise.city}</p>
            )}
          </div>

          {googleMapsSearchUrl && (
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              {t("showOnMap")}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          )}
        </Card>
      )}
    </aside>
  );
}
