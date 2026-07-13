"use client";

import { useTranslations } from "next-intl";
import { LinkIcon, Share2, Check } from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/constants/enterprise";
import type { SocialShareProps } from "@/types/enterprise-news";

export function SocialShare({ copied, onCopyLink }: SocialShareProps) {
  const t = useTranslations("EnterpriseProfile");
  const shareUrl =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.href)
      : "";

  return (
    <div className="pt-6 border-t border-slate-800">
      <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
        {t("share") || "Udostępnij"}
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {SOCIAL_PLATFORMS.map((platform) => {
          const shareHref =
            platform.key === "facebookUrl"
              ? `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
              : platform.key === "instagramUrl"
                ? `https://www.instagram.com/`
                : null;
          if (!shareHref) return null;
          return (
            <a
              key={platform.key}
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-500 transition-colors border border-slate-700"
              aria-label={`${platform.label} (${t("opensInNewTab")})`}
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d={platform.path} />
              </svg>
            </a>
          );
        })}

        <button
          onClick={onCopyLink}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg"
          aria-label={
            copied
              ? t("linkCopied") || "Link copied"
              : t("copyLink") || "Copy link"
          }
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>{t("linkCopied") || "Skopiowano!"}</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" aria-hidden="true" />
              {t("copyLink") || "Kopiuj link"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
