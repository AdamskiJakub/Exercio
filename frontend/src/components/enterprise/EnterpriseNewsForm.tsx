"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Newspaper, Link as LinkIcon, FileText, ImageIcon } from "lucide-react";
import { useOGPreview } from "@/hooks/useOGPreview";
import type { EnterpriseNews } from "@/types/enterprise";

interface NewsFormData {
  type: "link" | "post";
  title: string;
  url: string;
  description: string;
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
  });

  const { ogPreview } = useOGPreview(form.url, form.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const setType = (type: "link" | "post") => {
    setForm((prev) => ({ ...prev, type }));
  };

  const updateField = (field: keyof NewsFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

      {/* Post Type Toggle */}
      <div
        className="flex gap-3"
        role="radiogroup"
        aria-label={t("newsType") || "News type"}
      >
        <button
          type="button"
          role="radio"
          aria-checked={form.type === "link"}
          onClick={() => setType("link")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            form.type === "link"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500"
          }`}
        >
          <LinkIcon className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            {t("newsTypeLink") || "Link"}
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={form.type === "post"}
          onClick={() => setType("post")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            form.type === "post"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500"
          }`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            {t("newsTypePost") || "Post"}
          </span>
        </button>
      </div>

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

      {form.type === "link" && (
        <div className="space-y-2">
          <Label htmlFor="form-url" className="text-base font-medium">
            URL
          </Label>
          <Input
            type="url"
            name="url"
            id="form-url"
            value={form.url}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder="https://..."
            className="h-11"
          />
          {/* Link Preview */}
          {ogPreview && (
            <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600 flex items-start gap-3">
              <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                {ogPreview.image ? (
                  <img
                    src={ogPreview.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LinkIcon
                    className="w-5 h-5 text-slate-500"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {ogPreview.title}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {ogPreview.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

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
          variant="outline"
          className="border-slate-600 text-slate-300 h-11 px-8"
        >
          {t("cancel") || "Cancel"}
        </Button>
      </div>
    </motion.form>
  );
}
