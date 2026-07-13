"use client";

import { InstructorProfile } from "@/types";
import { useTranslations } from "next-intl";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOCIAL_PLATFORMS } from "@/constants/enterprise";

interface ContactSectionProps {
  profile: InstructorProfile;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const t = useTranslations("InstructorProfile");

  const hasSocialLinks =
    profile.instagramUrl || profile.facebookUrl || profile.whatsappUrl;

  if (
    !profile.showPhone &&
    !profile.showEmail &&
    !profile.contactMessage &&
    !hasSocialLinks
  ) {
    return null;
  }

  const userPhone = profile.user?.phone;
  const userEmail = profile.user?.email;

  // Filter SOCIAL_PLATFORMS to only include the ones relevant for instructors
  const instructorSocialPlatforms = SOCIAL_PLATFORMS.filter((p) =>
    ["instagramUrl", "facebookUrl", "whatsappUrl"].includes(p.key),
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="size-5 text-orange-500" />
          {t("contact.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Contact Message */}
        {profile.contactMessage && (
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed italic">
              &ldquo;{profile.contactMessage}&rdquo;
            </p>
          </div>
        )}

        {/* Phone */}
        {profile.showPhone && userPhone && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
              <Phone className="size-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">
                {t("contact.phone")}
              </p>
              <a
                href={`tel:${userPhone}`}
                className="text-slate-200 hover:text-orange-500 transition-colors font-medium"
              >
                {userPhone}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {profile.showEmail && userEmail && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
              <Mail className="size-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">
                {t("contact.email")}
              </p>
              <a
                href={`mailto:${userEmail}`}
                className="text-slate-200 hover:text-orange-500 transition-colors font-medium break-all"
              >
                {userEmail}
              </a>
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {hasSocialLinks && (
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">
              {t("contact.socialMedia")}
            </p>
            <div className="flex flex-wrap gap-3">
              {instructorSocialPlatforms.map((platform) => {
                const url = profile[platform.key as keyof InstructorProfile] as
                  | string
                  | null;
                if (!url) return null;

                return (
                  <a
                    key={platform.key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-300 hover:bg-orange-600/20 hover:text-orange-500 transition-all hover:scale-110"
                    aria-label={`${platform.label} (${t("contact.opensInNewTab")})`}
                  >
                    <svg
                      className="w-5 h-5"
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
          </div>
        )}

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          {profile.showEmail && userEmail && (
            <a
              href={`mailto:${userEmail}`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-lg"
            >
              <Mail className="size-5" />
              {t("contact.sendEmail")}
            </a>
          )}

          {profile.showPhone && userPhone && (
            <a
              href={`tel:${userPhone}`}
              className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-lg"
            >
              <Phone className="size-5" />
              {t("contact.callNow")}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
