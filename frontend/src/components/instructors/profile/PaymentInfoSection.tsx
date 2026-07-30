"use client";

import { InstructorProfile } from "@/types";
import { useTranslations } from "next-intl";
import { CreditCard, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_ICONS,
} from "@/constants/payment";

interface PaymentInfoSectionProps {
  profile: InstructorProfile;
}

export function PaymentInfoSection({ profile }: PaymentInfoSectionProps) {
  const t = useTranslations("InstructorProfile.payment");
  const tCommon = useTranslations("Common.paymentMethods");

  const hasPaymentMethods =
    profile.paymentMethods && profile.paymentMethods.length > 0;
  const hasPaymentInfo = profile.paymentInfo;

  if (!hasPaymentMethods && !hasPaymentInfo) {
    return null;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CreditCard className="size-5 text-orange-500" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Methods */}
        {hasPaymentMethods && (
          <div>
            <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">
              {t("acceptedMethods")}
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHOD_OPTIONS.filter((option) =>
                profile.paymentMethods?.includes(option.value),
              ).map((option) => {
                const Icon = PAYMENT_METHOD_ICONS[option.value];
                return (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 rounded-full text-sm text-slate-200"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/10">
                      <Icon className="size-3.5 text-orange-500" />
                    </div>
                    {tCommon(option.labelKey)}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Payment Info */}
        {hasPaymentInfo && (
          <div>
            <p className="flex items-center gap-2 text-base font-medium text-slate-200 mb-3">
              <FileText className="size-4 text-orange-500" />
              {t("additionalInfo")}
            </p>
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                {profile.paymentInfo}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
