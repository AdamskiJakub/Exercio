import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthHeader } from "@/components/ui/auth-header";
import { RoleCard } from "@/components/auth/RoleCard";
import { UserRound, Dumbbell, Building2 } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return {
    title: t("registerAs"),
    description: t("chooseRoleDescription"),
  };
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        <AuthHeader
          title={t("registerAs")}
          subtitle={t("chooseRoleDescription")}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {/* CLIENT CARD */}
          <RoleCard
            href="/register/client"
            ariaLabel={t("registerAsClient")}
            icon={UserRound}
            iconColor="text-violet-500"
            iconBgColor="bg-violet-500/10"
            title={t("clientRole")}
            description={t("clientRoleDesc")}
            features={[
              { text: t("clientFeature1"), accentColor: "text-violet-500" },
              { text: t("clientFeature2"), accentColor: "text-violet-500" },
              { text: t("clientFeature3"), accentColor: "text-violet-500" },
            ]}
            buttonText={t("registerAsClient")}
            hoverBorderColor="hover:border-violet-500"
            buttonGradient="from-violet-600 to-purple-600"
            buttonHoverGradient="group-hover:from-violet-700 group-hover:to-purple-700"
            hoverShadowColor="hover:shadow-violet-500/25"
            badge={t("clientBadge")}
            badgeColor="text-violet-400"
            badgeBgColor="bg-violet-500/10"
          />

          {/* INSTRUCTOR CARD */}
          <RoleCard
            href="/register/instructor"
            ariaLabel={t("registerAsInstructor")}
            icon={Dumbbell}
            iconColor="text-orange-500"
            iconBgColor="bg-orange-500/10"
            title={t("instructorRole")}
            description={t("instructorRoleDesc")}
            features={[
              { text: t("instructorFeature1"), accentColor: "text-orange-500" },
              { text: t("instructorFeature2"), accentColor: "text-orange-500" },
              { text: t("instructorFeature3"), accentColor: "text-orange-500" },
            ]}
            buttonText={t("registerAsInstructor")}
            hoverBorderColor="hover:border-orange-500"
            buttonGradient="from-orange-500 to-red-500"
            buttonHoverGradient="group-hover:from-orange-600 group-hover:to-red-600"
            hoverShadowColor="hover:shadow-orange-500/25"
            badge={t("instructorBadge")}
            badgeColor="text-orange-400"
            badgeBgColor="bg-orange-500/10"
          >
            {/* Instructor benefit callout */}
            <div className="mb-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-sm font-semibold text-orange-300 mb-1">
                  {t("instructorBenefitTitle")}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t("instructorBenefitDesc")}
                </p>
              </div>
            </div>
          </RoleCard>

          {/* ENTERPRISE / "DLA FIRM" CARD */}
          <RoleCard
            href="/partner"
            ariaLabel={t("forBusinesses")}
            icon={Building2}
            iconColor="text-emerald-500"
            iconBgColor="bg-emerald-500/10"
            title={t("forBusinesses")}
            description={t("forBusinessesDesc")}
            features={[
              { text: t("businessFeature1"), accentColor: "text-emerald-500" },
              { text: t("businessFeature2"), accentColor: "text-emerald-500" },
              { text: t("businessFeature3"), accentColor: "text-emerald-500" },
            ]}
            buttonText={t("checkOffer")}
            hoverBorderColor="hover:border-emerald-500"
            buttonGradient="from-emerald-600 to-teal-600"
            buttonHoverGradient="group-hover:from-emerald-700 group-hover:to-teal-700"
            hoverShadowColor="hover:shadow-emerald-500/25"
            badge={t("businessBadge")}
            badgeColor="text-emerald-400"
            badgeBgColor="bg-emerald-500/10"
          >
            {/* Partner benefit callout */}
            <div className="mb-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <p className="text-sm font-semibold text-emerald-300 mb-2">
                  {t("businessBenefitTitle")}
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-1.5 text-sm text-slate-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                    <span>{t("businessBenefit1")}</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-sm text-slate-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                    <span>{t("businessBenefit2")}</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-sm text-slate-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                    <span>{t("businessBenefit3")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </RoleCard>
        </div>

        {/* Bottom: only login link */}
        <div className="text-center pt-2">
          <p className="text-slate-300 text-base">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
            >
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
