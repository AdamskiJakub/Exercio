"use client";

import { useTranslations } from "next-intl";
import { EnterpriseApplyForm } from "./EnterpriseApplyForm";
import { Building2, Users, Star, Shield } from "lucide-react";

export function EnterpriseApplyPage() {
  const t = useTranslations("EnterpriseApply");

  const benefits = [
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: t("benefits.instructors.title"),
      description: t("benefits.instructors.description"),
    },
    {
      icon: <Star className="w-6 h-6 text-orange-500" />,
      title: t("benefits.visibility.title"),
      description: t("benefits.visibility.description"),
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-500" />,
      title: t("benefits.management.title"),
      description: t("benefits.management.description"),
    },
    {
      icon: <Building2 className="w-6 h-6 text-orange-500" />,
      title: t("benefits.brand.title"),
      description: t("benefits.brand.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t("title")}</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Benefits */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">
              {t("whyEnterprise")}
            </h2>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5"
                >
                  <div className="shrink-0 mt-1">{benefit.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {t("howItWorks.title")}
              </h3>
              <ol className="space-y-3">
                {[1, 2, 3, 4].map((step) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-300">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs font-bold">
                      {step}
                    </span>
                    <span>{t(`howItWorks.step${step}`)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <EnterpriseApplyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
