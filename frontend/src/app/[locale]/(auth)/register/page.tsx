"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthHeader } from "@/components/ui/auth-header";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-4xl w-full mx-auto space-y-10">
        {/* Header */}
        <AuthHeader
          title={t("registerAs")}
          subtitle={t("chooseRoleDescription")}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/register/client" aria-label={t("registerAsClient")}>
            <div
              className="group cursor-pointer rounded-lg border-2 border-slate-700 p-8 transition-all hover:border-orange-500 hover:shadow-xl bg-slate-800/50 backdrop-blur-sm h-full"
              role="button"
              tabIndex={0}
            >
              <div className="text-center">
                <div className="text-5xl mb-4" aria-hidden="true">
                  👤
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {t("clientRole")}
                </h3>
                <p className="text-slate-300 mb-6">{t("clientRoleDesc")}</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span className="text-slate-300">{t("clientFeature1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span className="text-slate-300">{t("clientFeature3")}</span>
                </li>
              </ul>

              <div className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-md font-medium transition-all group-hover:from-orange-600 group-hover:to-red-600 cursor-pointer text-center shadow-lg">
                {t("registerAsClient")}
              </div>
            </div>
          </Link>

          {/* INSTRUCTOR CARD */}
          <a
            href={`/${locale}/register/instructor?intent=instructor`}
            aria-label={t("registerAsInstructor")}
            className="block"
          >
            <div
              className="group cursor-pointer rounded-lg border-2 border-slate-700 p-8 transition-all hover:border-purple-500 hover:shadow-xl bg-slate-800/50 backdrop-blur-sm relative overflow-hidden h-full"
              role="button"
              tabIndex={0}
            >
              <div className="text-center">
                <div className="text-5xl mb-4" aria-hidden="true">
                  💪
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {t("instructorRole")}
                </h3>
                <p className="text-slate-300 mb-6">{t("instructorRoleDesc")}</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span className="text-slate-300">
                    {t("instructorFeature1")}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span className="text-slate-300">
                    {t("instructorFeature3")}
                  </span>
                </li>
              </ul>

              <div className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-md font-medium transition-all group-hover:from-purple-700 group-hover:to-indigo-700 cursor-pointer text-center shadow-lg">
                {t("registerAsInstructor")}
              </div>
            </div>
          </a>
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
