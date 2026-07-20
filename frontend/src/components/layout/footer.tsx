"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import logoSrc from "public/logo.svg";
import { footerLinks, socialLinks } from "@/lib/utils/footer-links";

export function Footer() {
  const t = useTranslations("Footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-slate-900 border-t border-slate-800"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src={logoSrc}
                alt=""
                className="w-7 h-7 text-orange-500"
                aria-hidden="true"
              />
              <span className="text-2xl font-bold text-white">Exercio</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          <nav aria-labelledby="footer-platform-heading">
            <h3
              id="footer-platform-heading"
              className="text-white font-semibold text-base mb-4"
            >
              {t("platform.title")}
            </h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-orange-500 text-sm transition-colors"
                  >
                    {t(link.translationKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-support-heading">
            <h3
              id="footer-support-heading"
              className="text-white font-semibold text-base mb-4"
            >
              {t("support.title")}
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/contact#") ? (
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-orange-500 text-sm transition-colors"
                    >
                      {t(link.translationKey)}
                    </a>
                  ) : (
                    <Link
                      href={link.href as any}
                      className="text-slate-400 hover:text-orange-500 text-sm transition-colors"
                    >
                      {t(link.translationKey)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal-heading">
            <h3
              id="footer-legal-heading"
              className="text-white font-semibold text-base mb-4"
            >
              {t("legal.title")}
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-orange-500 text-sm transition-colors"
                  >
                    {t(link.translationKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} Exercio. {t("allRightsReserved")}
            </p>

            <div
              className="flex items-center gap-4"
              role="navigation"
              aria-label="Social media links"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-500 transition-colors"
                  aria-label={`Visit us on ${social.name}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
