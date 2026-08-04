"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCropUpload } from "@/hooks/useCropUpload";
import { deleteUploadedFile } from "@/hooks/useFileUpload";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils/media";
import { toast } from "sonner";

interface ThumbnailSectionProps {
  thumbnailUrl: string;
  onThumbnailChange: (url: string) => void;
}

// Thumbnails are displayed at 16:9 (1200×630 recommended).
const THUMB_ASPECT = 16 / 9;
const THUMB_WIDTH = 1200;
const THUMB_HEIGHT = 630;

export function ThumbnailSection({
  thumbnailUrl,
  onThumbnailChange,
}: ThumbnailSectionProps) {
  const t = useTranslations("Dashboard.enterprise");
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Tracks the thumbnail URL whose R2 deletion has already been scheduled when
  // the user replaces it by typing a raw URL. Prevents deleting on every
  // keystroke while still cleaning up the old file once the value changes.
  const replacedRef = useRef<string | null>(null);

  const {
    isUploading,
    urlValue,
    setUrlValue,
    handleFileChange,
    handleUrlCrop,
    reset,
    cropModal,
  } = useCropUpload({
    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post("/upload/thumbnail", formData);
      return response.data.url as string;
    },
    onUrlChange: (url) => {
      // If a thumbnail was already set, delete the old one from R2 on replace
      if (thumbnailUrl && thumbnailUrl !== url) {
        void deleteUploadedFile(thumbnailUrl);
      }
      onThumbnailChange(url);
    },
    crop: {
      freeCrop: true,
      aspectRatio: THUMB_ASPECT,
      outputWidth: THUMB_WIDTH,
      outputHeight: THUMB_HEIGHT,
      smartAspect: true,
      smartTolerance: 0.1,
    },
    enableUrlCrop: true,
    filename: "thumbnail",
    successMessage: t("thumbnailUploaded") || "Thumbnail uploaded",
    errorMessage: t("thumbnailUploadFailed") || "Failed to upload thumbnail",
  });

  const clearThumbnail = () => {
    if (thumbnailUrl) void deleteUploadedFile(thumbnailUrl);
    replacedRef.current = null;
    onThumbnailChange("");
    setUrlValue("");
    reset();
    setHasError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showPreview = urlValue || thumbnailUrl;

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
            src={getMediaUrl(urlValue || thumbnailUrl)}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
            onError={() => {
              setHasError(false);
              onThumbnailChange("");
              setUrlValue("");
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
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileChange}
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
            value={urlValue}
            onChange={(e) => {
              const next = e.target.value;
              setUrlValue(next);
              onThumbnailChange(next);
              // The raw URL path bypasses the crop pipeline, so delete the old
              // thumbnail once when the value actually changes (not on every
              // keystroke).
              if (
                thumbnailUrl &&
                thumbnailUrl !== next &&
                replacedRef.current !== thumbnailUrl
              ) {
                replacedRef.current = thumbnailUrl;
                void deleteUploadedFile(thumbnailUrl);
              }
            }}
            onBlur={(e) => handleUrlCrop(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlCrop(e.currentTarget.value);
              }
            }}
            placeholder={t("imageUrlPlaceholder") || "Or paste image URL..."}
            className="h-10 text-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50"
          />
        </div>
      </div>

      {cropModal}
    </div>
  );
}
