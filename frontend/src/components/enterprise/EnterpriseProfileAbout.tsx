"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseProfileAboutProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseProfileAbout({
  enterprise,
}: EnterpriseProfileAboutProps) {
  const t = useTranslations("EnterpriseProfile");

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-24"
    >
      <h2
        id="about-heading"
        className="text-2xl font-bold text-white flex items-center gap-2 mb-6"
      >
        <Info className="w-6 h-6 text-emerald-500" aria-hidden="true" />
        {t("about")}
      </h2>
      {enterprise.description ? (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8 items-start">
          <div className="lg:col-span-3">
            <p className="text-slate-200 leading-relaxed whitespace-pre-line text-lg">
              {enterprise.description}
            </p>
          </div>
          {enterprise.aboutImage && (
            <div className="lg:col-span-2 mt-6 lg:mt-0 hidden md:block">
              <div className="rounded-xl overflow-hidden bg-slate-800">
                <img
                  src={getMediaUrl(enterprise.aboutImage)}
                  alt={`${enterprise.companyName}`}
                  className="w-full max-h-100 object-cover"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-500 italic">{t("noDescription")}</p>
      )}
    </section>
  );
}
