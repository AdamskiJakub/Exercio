import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function CookiesPage() {
  const t = useTranslations("Cookies");

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-6">{t("title")}</h1>
      <p className="text-slate-300 mb-10 leading-relaxed">{t("intro")}</p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {t("whatAreCookies")}
        </h2>
        <p className="text-slate-300 leading-relaxed">
          {t("whatAreCookiesDesc")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {t("howWeUse")}
        </h2>
        <p className="text-slate-300 mb-4 leading-relaxed">
          {t("howWeUseDesc")}
        </p>
        <ul className="space-y-3 text-slate-300">
          <li className="flex items-start gap-3">
            <span className="text-orange-500 mt-1 shrink-0">•</span>
            <span>{t("purposeNecessary")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-500 mt-1 shrink-0">•</span>
            <span>{t("purposeFunctional")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-500 mt-1 shrink-0">•</span>
            <span>{t("purposeAnalytics")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-500 mt-1 shrink-0">•</span>
            <span>{t("purposeMarketing")}</span>
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {t("manageConsent")}
        </h2>
        <p className="text-slate-300 mb-4 leading-relaxed">
          {t("manageConsentDesc")}
        </p>
        <ul className="space-y-3 text-slate-300">
          <li className="flex items-start gap-3">
            <span className="text-orange-500 mt-1 shrink-0">•</span>
            <span>{t("manageAcceptAll")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-500 mt-1 shrink-0">•</span>
            <span>{t("manageAcceptNecessary")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-500 mt-1 shrink-0">•</span>
            <span>{t("manageCustomize")}</span>
          </li>
        </ul>
        <p className="text-slate-300 mt-4 leading-relaxed">
          {t("manageChange")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {t("thirdParty")}
        </h2>
        <p className="text-slate-300 leading-relaxed">{t("thirdPartyDesc")}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {t("security")}
        </h2>
        <p className="text-slate-300 leading-relaxed">{t("securityDesc")}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {t("contact")}
        </h2>
        <p className="text-slate-300 leading-relaxed">{t("contactDesc")}</p>
      </section>

      <p className="text-slate-500 text-sm mt-12 border-t border-slate-800 pt-6">
        {t("lastUpdated")}
      </p>
    </div>
  );
}
