"use client";

import { useTranslations } from "next-intl";
import { EnterpriseHero } from "./EnterpriseHero";
import { EnterpriseInstructors } from "./EnterpriseInstructors";
import { EnterpriseNews } from "./EnterpriseNews";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseProfilePageProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseProfilePage({
  enterprise,
}: EnterpriseProfilePageProps) {
  const t = useTranslations("EnterpriseProfile");

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <EnterpriseHero enterprise={enterprise} />

        {/* Instructors Section */}
        {enterprise.instructors && enterprise.instructors.length > 0 && (
          <EnterpriseInstructors instructors={enterprise.instructors} />
        )}

        {/* News Section */}
        {enterprise.news && enterprise.news.length > 0 && (
          <EnterpriseNews news={enterprise.news} />
        )}

        {/* Amenities */}
        {enterprise.amenities && enterprise.amenities.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">{t("amenities")}</h2>
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
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">{t("gallery")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {enterprise.gallery.map((url, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-800"
                >
                  <img
                    src={url}
                    alt={`${enterprise.companyName} gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNavBar backText={t("backToListing")} backHref="/instructors" />
    </div>
  );
}
