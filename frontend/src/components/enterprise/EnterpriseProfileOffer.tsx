"use client";

import { useTranslations } from "next-intl";
import { Building2, Users, BookOpen, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";
import { resolvePreset } from "@/constants/enterprise";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseProfileOfferProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseProfileOffer({
  enterprise,
}: EnterpriseProfileOfferProps) {
  const t = useTranslations("EnterpriseProfile");
  const tp = useTranslations("Dashboard.enterprise");

  const hasOffer =
    enterprise.businessType ||
    (enterprise.targetAudience && enterprise.targetAudience.length > 0) ||
    (enterprise.languages && enterprise.languages.length > 0) ||
    (enterprise.disciplines && enterprise.disciplines.length > 0);

  if (!hasOffer) return null;

  return (
    <section
      id="offer"
      aria-labelledby="offer-heading"
      className="scroll-mt-24"
    >
      <h2
        id="offer-heading"
        className="text-2xl font-bold text-white flex items-center gap-2 mb-6"
      >
        <Building2 className="w-6 h-6 text-emerald-500" aria-hidden="true" />
        {t("offer")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {enterprise.businessType && (
          <Card className="bg-slate-900/50 border-slate-800 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 mt-0.5">
              <Building2
                className="w-5 h-5 text-emerald-500"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {t("businessType")}
              </p>
              <p className="text-sm text-slate-300 mt-0.5">
                {t(`categories.${enterprise.businessType}`)}
              </p>
            </div>
          </Card>
        )}
        {enterprise.targetAudience && enterprise.targetAudience.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {t("targetAudience")}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {enterprise.targetAudience.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-200"
                  >
                    {resolvePreset(item, "targetAudiencePresets", tp)}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}
        {enterprise.disciplines && enterprise.disciplines.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen
                className="w-5 h-5 text-emerald-500"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {t("disciplines")}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {enterprise.disciplines.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-200"
                  >
                    {resolvePreset(item, "disciplinesPresets", tp)}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}
        {enterprise.languages && enterprise.languages.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0 mt-0.5">
              <Languages
                className="w-5 h-5 text-emerald-500"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {t("languages")}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {enterprise.languages.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-200"
                  >
                    {resolvePreset(item, "languagesPresets", tp)}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
