"use client";

import { useTranslations, useLocale } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getMediaUrl } from "@/lib/utils/media";
import { Calendar, FileText, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { useState, useCallback } from "react";
import { SocialShare } from "./SocialShare";
import type { PostDetailModalProps } from "@/types/enterprise-news";

export function PostDetailModal({
  selectedPost,
  onClose,
}: PostDetailModalProps) {
  const t = useTranslations("EnterpriseProfile");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : undefined;
  const [copied, setCopied] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "dd MMM yyyy", { locale: dateLocale });
    } catch {
      return dateStr;
    }
  };

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[PostDetailModal] Failed to copy link:", err);
    }
  }, []);

  return (
    <Dialog
      open={!!selectedPost}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="bg-slate-900 border border-slate-700/80 text-white w-[calc(100%-2rem)] max-w-2xl sm:max-w-3xl max-h-[85vh] overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label={t("close") || "Close"}
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {selectedPost && (
          <div>
            {selectedPost.thumbnailUrl && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={getMediaUrl(selectedPost.thumbnailUrl)}
                  alt={selectedPost.title || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4 text-sm text-slate-300">
                {selectedPost.createdAt && (
                  <time
                    dateTime={selectedPost.createdAt}
                    className="flex items-center gap-1.5"
                  >
                    <Calendar
                      className="w-4 h-4 text-emerald-500"
                      aria-hidden="true"
                    />
                    {formatDate(selectedPost.createdAt)}
                  </time>
                )}
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FileText
                    className="w-4 h-4 text-emerald-500"
                    aria-hidden="true"
                  />
                  {t("post") || "Post"}
                </span>
              </div>

              {selectedPost.title && (
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-white leading-tight text-left">
                  {selectedPost.title}
                </DialogTitle>
              )}

              {selectedPost.description && (
                <div className="text-slate-200 leading-relaxed whitespace-pre-line text-base">
                  {selectedPost.description}
                </div>
              )}

              <SocialShare copied={copied} onCopyLink={handleCopyLink} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
