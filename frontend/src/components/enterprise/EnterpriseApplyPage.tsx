"use client";

import { useTranslations } from "next-intl";
import { EnterpriseApplyForm } from "./EnterpriseApplyForm";
import {
  Building2,
  Users,
  Image,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/utils/api-url";

const benefits = [
  {
    icon: <Building2 className="w-6 h-6 text-emerald-500" aria-hidden="true" />,
    titleKey: "benefits.instructors.title",
    descKey: "benefits.instructors.description",
  },
  {
    icon: <Users className="w-6 h-6 text-emerald-500" aria-hidden="true" />,
    titleKey: "benefits.visibility.title",
    descKey: "benefits.visibility.description",
  },
  {
    icon: <Image className="w-6 h-6 text-emerald-500" aria-hidden="true" />,
    titleKey: "benefits.management.title",
    descKey: "benefits.management.description",
  },
  {
    icon: <Search className="w-6 h-6 text-emerald-500" aria-hidden="true" />,
    titleKey: "benefits.brand.title",
    descKey: "benefits.brand.description",
  },
];

async function fetchFoundingPartnerCount(): Promise<{
  count: number;
  limit: number;
}> {
  const res = await fetch(`${API_BASE_URL}/enterprise/founding-partners/count`);
  if (!res.ok) {
    throw new Error("Failed to fetch Founding Partner count");
  }
  return res.json();
}

export function EnterpriseApplyPage() {
  const t = useTranslations("EnterpriseApply");
  const epT = useTranslations("EnterpriseProfile");

  const {
    data: fpCount,
    isLoading: fpCountLoading,
    isError: fpCountError,
  } = useQuery({
    queryKey: ["founding-partner-count"],
    queryFn: fetchFoundingPartnerCount,
    refetchInterval: 60_000,
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Content */}
          <section className="space-y-10" aria-labelledby="benefits-heading">
            {/* Benefits */}
            <div>
              <h2
                id="benefits-heading"
                className="text-2xl font-bold text-white mb-6"
              >
                {t("whyEnterprise")}
              </h2>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex gap-4 bg-slate-900/30 border border-slate-800 rounded-xl p-5"
                  >
                    <div className="shrink-0 mt-1">{benefit.icon}</div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">
                        {t(benefit.titleKey)}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {t(benefit.descKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Founding Partners Program */}
            <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-linear-to-br from-amber-950/40 via-slate-900 to-orange-950/40 p-6">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="text-amber-400 text-sm" aria-hidden="true">
                    ◆
                  </span>
                  <span className="text-amber-300 text-xs font-medium">
                    {epT("foundingPartner")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {t("founderProgramTitle")}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t("founderProgramDesc")}
                </p>

                {/* Founding Partner Counter */}
                {fpCountLoading && (
                  <div className="mt-4 flex items-center gap-3 bg-slate-900/50 border border-amber-500/20 rounded-lg px-4 py-3">
                    <div className="w-5 h-5 rounded-full bg-slate-700 animate-pulse" />
                    <div className="h-4 w-40 bg-slate-700 rounded animate-pulse" />
                  </div>
                )}
                {fpCountError && (
                  <div className="mt-4 flex items-center gap-3 bg-slate-900/50 border border-red-500/20 rounded-lg px-4 py-3">
                    <p className="text-sm text-slate-400">
                      {t("error.foundingPartnerCount")}
                    </p>
                  </div>
                )}
                {fpCount && !fpCountLoading && !fpCountError && (
                  <div className="mt-4 flex items-center gap-3 bg-slate-900/50 border border-amber-500/20 rounded-lg px-4 py-3">
                    <span
                      className="text-amber-400 text-lg shrink-0"
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-amber-300">
                        {epT("foundingPartnerCount", {
                          count: fpCount.count,
                          limit: fpCount.limit,
                        })}
                      </p>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1.5 max-w-40">
                        <div
                          className="bg-linear-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((fpCount.count / fpCount.limit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {t("howItWorks.title")}
              </h3>
              <ol className="space-y-3">
                {[1, 2, 3, 4].map((step) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-300">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold">
                      {step}
                    </span>
                    <span>{t(`howItWorks.step${step}`)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Right: Form */}
          <div>
            <EnterpriseApplyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
