"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getMediaUrl } from "@/lib/utils/media";
import {
  Calendar,
  Newspaper,
  Link as LinkIcon,
  FileText,
  Share2,
  Check,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { useState, useCallback } from "react";
import { SOCIAL_PLATFORMS } from "@/constants/enterprise";
import { NewsCardImage } from "./NewsCardImage";
import { NewsCardContent } from "./NewsCardContent";
import type { EnterpriseNews as EnterpriseNewsType } from "@/types/enterprise";
import type {
  NewsFilter,
  EnterpriseNewsProps,
  NewsCardProps,
  SocialShareProps,
  PostDetailModalProps,
  FilterTab,
} from "@/types/enterprise-news";

const INITIAL_VISIBLE = 6;

function NewsCard({ item, onSelect, isLink = false }: NewsCardProps) {
  const t = useTranslations("EnterpriseProfile");

  const cardContent = (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
      <NewsCardImage
        thumbnailUrl={item.thumbnailUrl}
        title={item.title}
        isLink={isLink}
      />
      <NewsCardContent
        createdAt={item.createdAt}
        title={item.title}
        description={item.description}
        isLink={isLink}
      />
    </Card>
  );

  if (isLink) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
        aria-label={`${item.title || t("news")} — ${t("opensInNewTab")}`}
        role="listitem"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(item);
        }
      }}
      role="button"
      tabIndex={0}
      className="block w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg cursor-pointer"
      aria-label={item.title || t("news")}
    >
      {cardContent}
    </div>
  );
}

function SocialShare({ copied, onCopyLink }: SocialShareProps) {
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

function PostDetailModal({ selectedPost, onClose }: PostDetailModalProps) {
  const t = useTranslations("EnterpriseProfile");
  const dateLocale = "pl" === "pl" ? pl : undefined;
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
    } catch {
      // clipboard write not available
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
        className="bg-slate-900 border border-slate-700/80 text-white max-w-2xl max-h-[85vh] overflow-y-auto p-0 mx-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800"
        showCloseButton={false}
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

export function EnterpriseNews({ news }: EnterpriseNewsProps) {
  const t = useTranslations("EnterpriseProfile");

  const [filter, setFilter] = useState<NewsFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const [selectedPost, setSelectedPost] = useState<EnterpriseNewsType | null>(
    null,
  );

  if (!news || news.length === 0) return null;

  const sortedNews = [...news].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const filteredNews =
    filter === "all"
      ? sortedNews
      : sortedNews.filter((item) => item.type === filter);

  const visibleNews = showAll
    ? filteredNews
    : filteredNews.slice(0, INITIAL_VISIBLE);
  const hasMore = filteredNews.length > INITIAL_VISIBLE;

  const postCount = sortedNews.filter((n) => n.type === "post").length;
  const linkCount = sortedNews.filter((n) => n.type === "link").length;

  const filters: FilterTab[] = [
    {
      value: "all",
      label: t("allNews") || "Wszystko",
      count: sortedNews.length,
    },
    { value: "post", label: t("posts") || "Posty", count: postCount },
    { value: "link", label: t("links") || "Linki", count: linkCount },
  ];

  return (
    <>
      <section className="space-y-6" aria-labelledby="news-heading">
        <h2
          id="news-heading"
          className="text-2xl font-bold text-white flex items-center gap-2"
        >
          <Calendar className="w-6 h-6 text-emerald-500" aria-hidden="true" />
          {t("news")}
        </h2>

        {sortedNews.length > 0 && (
          <div
            className="flex gap-2 flex-wrap"
            role="tablist"
            aria-label={t("news")}
          >
            {filters.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => {
                  setFilter(f.value);
                  setShowAll(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f.value
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-70">({f.count})</span>
              </button>
            ))}
          </div>
        )}

        {visibleNews.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label={t("news")}
          >
            {visibleNews.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                isLink={item.type === "link"}
                onSelect={setSelectedPost}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Newspaper
              className="w-12 h-12 text-slate-700 mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-slate-500">
              {filter === "post"
                ? t("noPosts") || "Brak postów"
                : filter === "link"
                  ? t("noLinks") || "Brak linków"
                  : t("noNews") || "Brak aktualności"}
            </p>
          </div>
        )}

        {hasMore && (
          <div className="text-center pt-2">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="px-6"
              aria-label={
                showAll
                  ? t("showLess") || "Show less"
                  : t("showMore", {
                      count: filteredNews.length - INITIAL_VISIBLE,
                    }) || "Show more"
              }
            >
              {showAll
                ? t("showLess") || "Pokaż mniej"
                : t("showMore", {
                    count: filteredNews.length - INITIAL_VISIBLE,
                  }) ||
                  `Pokaż więcej (${filteredNews.length - INITIAL_VISIBLE})`}
            </Button>
          </div>
        )}
      </section>

      <PostDetailModal
        selectedPost={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
