"use client";

import { useTranslations } from "next-intl";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

interface NewsCardContentProps {
  createdAt: string | null;
  title: string | null;
  description: string | null;
  isLink: boolean;
}

export function NewsCardContent({
  createdAt,
  title,
  description,
  isLink,
}: NewsCardContentProps) {
  const t = useTranslations("EnterpriseProfile");
  const dateLocale = "pl" === "pl" ? pl : undefined;

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "dd MMM yyyy", { locale: dateLocale });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-5 space-y-3 flex-1 flex flex-col">
      {createdAt && (
        <time className="text-xs text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          {formatDate(createdAt)}
        </time>
      )}
      {title && (
        <h3 className="text-white font-semibold group-hover:text-emerald-500 transition-colors line-clamp-2 leading-snug">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed flex-1">
          {description}
        </p>
      )}
      <div className="pt-2">
        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 text-sm pointer-events-none">
          {isLink ? (
            <>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              {t("visitWebsite")}
            </>
          ) : (
            <>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              {t("readMore")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
