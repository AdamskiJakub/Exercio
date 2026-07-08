"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { getMediaUrl } from "@/lib/utils/media";
import type { EnterpriseNews as EnterpriseNewsType } from "@/types/enterprise";

interface EnterpriseNewsProps {
  news: EnterpriseNewsType[];
}

export function EnterpriseNews({ news }: EnterpriseNewsProps) {
  const t = useTranslations("EnterpriseProfile");
  const locale = "pl";
  const dateLocale = locale === "pl" ? pl : undefined;

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="news-heading">
      <h2
        id="news-heading"
        className="text-2xl font-bold text-white flex items-center gap-2"
      >
        <Calendar className="w-6 h-6 text-emerald-500" aria-hidden="true" />
        {t("news")}
      </h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
      >
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
            aria-label={`${item.title || t("news")} — ${t("opensInNewTab")}`}
            role="listitem"
          >
            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden h-full">
              {item.thumbnailUrl && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={getMediaUrl(item.thumbnailUrl)}
                    alt={item.title || t("newsThumbnail")}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                {item.platform && (
                  <Badge
                    variant="outline"
                    className="border-slate-700 text-slate-400 text-xs"
                  >
                    {item.platform}
                  </Badge>
                )}
                {item.title && (
                  <h3 className="text-white font-semibold group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-emerald-500 pt-2">
                  <span>{t("readMore")}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}
