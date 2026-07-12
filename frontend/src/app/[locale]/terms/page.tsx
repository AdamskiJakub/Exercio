import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { termsContent } from "@/content/terms";
import { termsContentEn } from "@/content/terms-en";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function TermsPage() {
  const t = useTranslations("Terms");
  const locale = useLocale();
  const content = locale === "en" ? termsContentEn : termsContent;

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">{t("title")}</h1>
      <MarkdownRenderer content={content} />
    </div>
  );
}
