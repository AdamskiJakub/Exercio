"use client";

import { useTranslations } from "next-intl";

import { NotFoundContent } from "@/components/not-found-content";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <NotFoundContent
      title={t("title")}
      description={t("description")}
      goHome={t("goHome")}
      browseTrainers={t("browseTrainers")}
    />
  );
}
