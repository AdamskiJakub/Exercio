"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionInfoProps {
  isSubscribed: boolean;
  subscriptionExpiry: string | null;
  instructorCount: number;
}

export function SubscriptionInfo({
  isSubscribed,
  subscriptionExpiry,
  instructorCount,
}: SubscriptionInfoProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <CreditCard className="w-5 h-5 text-emerald-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("subscription")}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700/30 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            {isSubscribed ? (
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <CheckCircle2
                  className="w-8 h-8 text-emerald-400"
                  aria-hidden="true"
                />
              </div>
            ) : (
              <div className="p-3 bg-slate-600/30 rounded-full">
                <Building2
                  className="w-8 h-8 text-slate-400"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {t("currentPlan")}
          </h3>
          <p className="text-3xl font-bold text-emerald-400 mb-2">
            {isSubscribed ? t("premium") : t("free")}
          </p>
          <p className="text-sm text-slate-400">
            {isSubscribed
              ? t("premiumPlanDescription")
              : t("freePlanDescription")}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">{t("status")}</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isSubscribed ? "bg-emerald-400" : "bg-slate-500"
                }`}
                aria-hidden="true"
              />
              <span
                className={`font-medium ${
                  isSubscribed ? "text-emerald-400" : "text-slate-300"
                }`}
              >
                {isSubscribed ? t("active") : t("inactive")}
              </span>
            </div>
          </div>

          {subscriptionExpiry && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">
                {t("nextBillingDate")}
              </p>
              <p className="font-medium text-slate-200">{subscriptionExpiry}</p>
            </div>
          )}

          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">
              {t("totalInstructors")}
            </p>
            <p className="font-medium text-slate-200">{instructorCount}</p>
          </div>

          <Button
            disabled
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 text-base font-semibold"
          >
            <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
            {isSubscribed ? t("downgrade") : t("upgrade")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
