"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { useOGPreview } from "@/hooks/useOGPreview";
import { NewsTypeToggle } from "./NewsTypeToggle";
import { LinkPreviewSection } from "./LinkPreviewSection";
import { ThumbnailSection } from "./ThumbnailSection";
import type { EnterpriseNews } from "@/types/enterprise";

interface NewsFormData {
  type: "link" | "post";
  title: string;
  url: string;
  description: string;
  thumbnailUrl: string;
}

interface EnterpriseNewsFormProps {
  editingNews: EnterpriseNews | null;
  isSaving: boolean;
  onSubmit: (data: NewsFormData) => void;
  onCancel: () => void;
}

export function EnterpriseNewsForm({
  editingNews,
  isSaving,
  onSubmit,
  onCancel,
}: EnterpriseNewsFormProps) {
  const t = useTranslations("Dashboard.enterprise");

  const [form, setForm] = useState<NewsFormData>({
    type: editingNews
      ? (editingNews.type as "link" | "post") || "link"
      : "link",
    title: editingNews?.title || "",
    url: editingNews?.url || "",
    description: editingNews?.description || "",
    thumbnailUrl: editingNews?.thumbnailUrl || "",
  });

  const { ogPreview, isFetchingOg, fetchFailed } = useOGPreview(
    form.url,
    form.type,
  );

  // Auto-fill title and description from OG preview (only on first successful fetch for new items)
  const hasAutoFilled = useRef(false);
  useEffect(() => {
    if (
      ogPreview &&
      !hasAutoFilled.current &&
      !editingNews &&
      form.type === "link"
    ) {
      hasAutoFilled.current = true;
      setForm((prev) => ({
        ...prev,
        title: prev.title || ogPreview.title,
        description: prev.description || ogPreview.description,
        thumbnailUrl: prev.thumbnailUrl || ogPreview.image || "",
      }));
    }
  }, [ogPreview, editingNews, form.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const setType = (type: "link" | "post") => {
    hasAutoFilled.current = false;
    setForm((prev) => ({ ...prev, type }));
  };

  const updateField = (field: keyof NewsFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isSocialUrl = form.type === "link" && isSocialMediaUrl(form.url);

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Newspaper className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white">
            {editingNews ? t("editNews") : t("createNews")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label={t("cancel") || "Cancel"}
        >
          <span className="text-sm">{t("cancel") || "Cancel"}</span>
        </button>
      </div>

      <NewsTypeToggle
        type={form.type}
        onChange={setType}
        linkLabel={t("newsTypeLink") || "Link"}
        postLabel={t("newsTypePost") || "Post"}
      />

      {form.type === "link" && (
        <LinkPreviewSection
          url={form.url}
          onUrlChange={(url) => updateField("url", url)}
          isFetchingOg={isFetchingOg}
          fetchFailed={fetchFailed}
          ogPreview={ogPreview}
          isSocialUrl={isSocialUrl}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="form-title" className="text-base font-medium">
          {t("title")}
        </Label>
        <Input
          type="text"
          name="title"
          id="form-title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-description" className="text-base font-medium">
          {t("content") || "Content"}
        </Label>
        <Textarea
          name="description"
          id="form-description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="min-h-25"
          placeholder={
            form.type === "post"
              ? t("postContentPlaceholder") || "Write your post content..."
              : undefined
          }
        />
      </div>

      <ThumbnailSection
        thumbnailUrl={form.thumbnailUrl}
        onThumbnailChange={(url) => updateField("thumbnailUrl", url)}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-8 text-base font-semibold"
        >
          {isSaving ? t("savingNews") : t("publish")}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="destructive"
          className="h-11 px-8"
        >
          {t("cancel") || "Cancel"}
        </Button>
      </div>
    </motion.form>
  );
}

function isSocialMediaUrl(url: string): boolean {
  const FACEBOOK_DOMAINS = [
    "facebook.com",
    "www.facebook.com",
    "fb.com",
    "m.facebook.com",
    "instagram.com",
    "www.instagram.com",
  ];
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return FACEBOOK_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain),
    );
  } catch {
    return false;
  }
}
