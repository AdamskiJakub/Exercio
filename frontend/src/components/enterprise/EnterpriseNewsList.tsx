"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Newspaper,
  ExternalLink,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnterpriseNews } from "@/types/enterprise";

interface EnterpriseNewsListProps {
  newsList: EnterpriseNews[];
  deleteConfirmId: string | null;
  onEdit: (news: EnterpriseNews) => void;
  onDelete: (newsId: string) => void;
  onDeleteConfirm: (newsId: string | null) => void;
  onCreateNew: () => void;
}

export function EnterpriseNewsList({
  newsList,
  deleteConfirmId,
  onEdit,
  onDelete,
  onDeleteConfirm,
  onCreateNew,
}: EnterpriseNewsListProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Megaphone className="w-5 h-5 text-emerald-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("news")}
          <span className="text-sm font-normal text-slate-400 ml-2">
            ({newsList.length})
          </span>
        </h2>
      </div>

      {newsList.length > 0 ? (
        <div className="space-y-4" role="list" aria-label={t("news")}>
          {newsList.map((news) => (
            <div
              key={news.id}
              role="listitem"
              className="flex items-start justify-between p-4 bg-slate-700/30 rounded-lg"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  {/* Type badge */}
                  {news.type === "post" ? (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {t("newsTypePost") || "Post"}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {t("newsTypeLink") || "Link"}
                    </span>
                  )}
                  <h3 className="text-base font-medium text-slate-200 truncate">
                    {news.title || "Untitled"}
                  </h3>
                  {news.url && news.type === "link" && (
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                      aria-label={`${news.title || "Link"} — ${t("opensInNewTab") || "opens in new tab"}`}
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
                {news.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                    {news.description}
                  </p>
                )}
                {/* Link preview for link type */}
                {news.url && news.type === "link" && (
                  <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-start gap-2 max-w-md">
                    <LinkIcon
                      className="w-3 h-3 text-slate-500 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-slate-500 truncate">
                      {news.url}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  {new Date(news.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onEdit(news)}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  aria-label={t("editNews")}
                >
                  <Edit className="w-4 h-4" aria-hidden="true" />
                </button>
                {deleteConfirmId === news.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDelete(news.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      aria-label={t("confirmDeleteNews")}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onDeleteConfirm(null)}
                      className="p-2 text-slate-400 hover:text-slate-300 transition-colors text-xs"
                      aria-label={t("cancel") || "Cancel delete"}
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onDeleteConfirm(news.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    aria-label={t("deleteNews")}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Newspaper
            className="w-12 h-12 text-slate-600 mx-auto mb-3"
            aria-hidden="true"
          />
          <p className="text-slate-300 mb-2">{t("noNews")}</p>
          <p className="text-sm text-slate-400 mb-4">
            {t("noNewsDescription")}
          </p>
          <Button
            onClick={onCreateNew}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            {t("createNews")}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
