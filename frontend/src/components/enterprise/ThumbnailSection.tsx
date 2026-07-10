"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils/media";
import { toast } from "sonner";

interface ThumbnailSectionProps {
  thumbnailUrl: string;
  onThumbnailChange: (url: string) => void;
}

export function ThumbnailSection({
  thumbnailUrl,
  onThumbnailChange,
}: ThumbnailSectionProps) {
  const t = useTranslations("Dashboard.enterprise");
  const [isUploading, setIsUploading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [urlInput, setUrlInput] = useState(thumbnailUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setHasError(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post("/upload/thumbnail", formData);
      const url = response.data.url as string;
      onThumbnailChange(url);
      setUrlInput(url);
      toast.success(t("thumbnailUploaded") || "Thumbnail uploaded");
    } catch (error: any) {
      toast.error(t("thumbnailUploadFailed") || "Failed to upload thumbnail", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearThumbnail = () => {
    onThumbnailChange("");
    setUrlInput("");
    setHasError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showPreview = urlInput || thumbnailUrl;

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">
        {t("thumbnail") || "Thumbnail"}
      </Label>
      <p className="text-xs text-slate-500">
        {t("thumbnailHint") ||
          "Upload an image or paste an image URL. Recommended: 1200×630px"}
      </p>

      {/* Preview area */}
      {showPreview && !hasError ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-600 bg-slate-800">
          <img
            src={getMediaUrl(urlInput || thumbnailUrl)}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
            onError={() => {
              setHasError(true);
              onThumbnailChange("");
              setUrlInput("");
            }}
          />
          <button
            type="button"
            onClick={clearThumbnail}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            aria-label="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative w-full aspect-video rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/50 flex flex-col items-center justify-center gap-2">
          {hasError ? (
            <>
              <ImageIcon className="w-8 h-8 text-red-500" />
              <p className="text-sm text-red-400">
                {t("thumbnailLoadFailed") || "Image failed to load"}
              </p>
              <button
                type="button"
                onClick={clearThumbnail}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {t("clearThumbnail") || "Clear and try again"}
              </button>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-slate-500" />
              <p className="text-sm text-slate-500">
                {t("noThumbnail") || "No thumbnail"}
              </p>
            </>
          )}
        </div>
      )}

      {/* Upload & URL controls */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
            id="thumbnail-upload"
          />
          <Button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-10 text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t("uploading") || "Uploading..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {t("uploadImage") || "Upload image"}
              </>
            )}
          </Button>
        </div>
        <div className="flex-2">
          <Input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onThumbnailChange(e.target.value);
            }}
            placeholder={t("imageUrlPlaceholder") || "Or paste image URL..."}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
