"use client";

import { Loader2, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface OGPreview {
  title: string;
  description: string;
  image: string | null;
}

interface LinkPreviewSectionProps {
  url: string;
  onUrlChange: (url: string) => void;
  isFetchingOg: boolean;
  fetchFailed: boolean;
  ogPreview: OGPreview | null;
  isSocialUrl: boolean;
}

const FACEBOOK_DOMAINS = [
  "facebook.com",
  "www.facebook.com",
  "fb.com",
  "m.facebook.com",
  "instagram.com",
  "www.instagram.com",
];

function isSocialMediaUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return FACEBOOK_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain),
    );
  } catch {
    return false;
  }
}

function SocialMediaWarning({ t }: { t: (key: string) => string }) {
  return (
    <div className="mt-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-amber-300 font-medium">
          {t("socialMediaPreviewBlocked") ||
            "Facebook & Instagram often block automatic previews"}
        </p>
        <p className="text-xs text-amber-400/70 mt-1">
          {t("socialMediaPreviewHint") ||
            "Upload a custom thumbnail below so the news item has an image."}
        </p>
      </div>
    </div>
  );
}

function FetchingPreview() {
  return (
    <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600 flex items-center gap-3">
      <Loader2
        className="w-5 h-5 text-slate-400 animate-spin shrink-0"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-400">Fetching preview...</p>
    </div>
  );
}

function FetchFailed({ t }: { t: (key: string) => string }) {
  return (
    <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-start gap-3">
      <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center shrink-0">
        <LinkIcon className="w-5 h-5 text-slate-500" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-400">
          {t("previewFailed") ||
            "Could not fetch preview. Please fill in the details manually."}
        </p>
      </div>
    </div>
  );
}

function OGPreviewCard({ ogPreview }: { ogPreview: OGPreview }) {
  return (
    <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600 flex items-start gap-3">
      <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
        {ogPreview.image ? (
          <img
            src={ogPreview.image}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <LinkIcon className="w-5 h-5 text-slate-500" aria-hidden="true" />
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
  );
}

export function LinkPreviewSection({
  url,
  onUrlChange,
  isFetchingOg,
  fetchFailed,
  ogPreview,
  isSocialUrl,
}: LinkPreviewSectionProps) {
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div className="space-y-2">
      <Label htmlFor="form-url" className="text-base font-medium">
        URL
      </Label>
      <Input
        type="text"
        name="url"
        id="form-url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://..."
        className="h-11"
      />
      {isSocialUrl && <SocialMediaWarning t={t} />}
      {isFetchingOg && <FetchingPreview />}
      {fetchFailed && !isSocialUrl && <FetchFailed t={t} />}
      {ogPreview && <OGPreviewCard ogPreview={ogPreview} />}
    </div>
  );
}
