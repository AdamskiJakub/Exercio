import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthHeader } from "@/components/ui/auth-header";
import { RoleCard } from "@/components/auth/RoleCard";
import {
  UserRound,
  Dumbbell,
  Building2,
  Shield,
  Users,
  CheckCircle,
} from "lucide-react";
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
      <div className="max-w-5xl w-full mx-auto space-y-10">
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
            href={`/${locale}/register/instructor?intent=instructor`}
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
          />

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
          />
        </div>

        {/* WHY TRAINLY SECTION */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white text-center mb-6">
            {t("whyTrainlyTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Shield
                  className="w-5 h-5 text-emerald-500"
                  aria-hidden="true"
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t("whyTrainlyFeature1")}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Users
                  className="w-5 h-5 text-emerald-500"
                  aria-hidden="true"
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t("whyTrainlyFeature2")}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <CheckCircle
                  className="w-5 h-5 text-emerald-500"
                  aria-hidden="true"
                />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t("whyTrainlyFeature3")}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div>
            <p className="text-slate-300 mb-2">{t("notReadyToRegister")}</p>
            <Link
              href="/instructors"
              className="text-orange-500 hover:text-orange-400 font-semibold transition-colors text-lg"
            >
              {t("browseAsGuest")} →
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-700">
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
    </div>
  );
}
