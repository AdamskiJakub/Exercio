"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Newspaper } from "lucide-react";
import { parseISO } from "date-fns";
import { useState } from "react";
import { NewsCardImage } from "./NewsCardImage";
import { NewsCardContent } from "./NewsCardContent";
import { PostDetailModal } from "./PostDetailModal";
import type { EnterpriseNews as EnterpriseNewsType } from "@/types/enterprise";
import type {
  NewsFilter,
  EnterpriseNewsProps,
  NewsCardProps,
  FilterTab,
} from "@/types/enterprise-news";

const INITIAL_VISIBLE = 3;

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

export function EnterpriseNews({ news }: EnterpriseNewsProps) {
  const t = useTranslations("EnterpriseProfile");

  const [filter, setFilter] = useState<NewsFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const [selectedPost, setSelectedPost] = useState<EnterpriseNewsType | null>(
    null,
  );

  if (!news || news.length === 0) return null;

  const sortedNews = [...news].sort(
    (a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime(),
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
      <section id="news" className="space-y-6" aria-labelledby="news-heading">
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
              variant="default"
              onClick={() => setShowAll(!showAll)}
              className="px-6 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"
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
