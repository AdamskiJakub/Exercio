"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Upload, X, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUploadProps } from "./types";
import { getMediaUrl, IS_DEVELOPMENT, isVideoUrl } from "@/lib/utils/media";
import { toast } from "sonner";

export function MediaUpload(props: MediaUploadProps) {
  const {
    variant,
    onMediaChange,
    onUpload,
    isUploading,
    label,
    hint,
    acceptVideo = false,
  } = props;
  const currentMediaUrl =
    variant === "avatar" ? props.currentMediaUrl : undefined;
  const currentMediaUrls =
    variant === "gallery" ? props.currentMediaUrls || [] : [];
  const maxFiles = variant === "gallery" ? props.maxFiles || 10 : 1;

  const t = useTranslations("Dashboard.profileForm");
  const [previews, setPreviews] = useState<
    Array<{ url: string; type: "image" | "video"; isBlob?: boolean }>
  >(
    variant === "avatar" && currentMediaUrl
      ? [{ url: currentMediaUrl, type: "image", isBlob: false }]
      : currentMediaUrls.map((url) => ({
          url,
          type: isVideoUrl(url) ? "video" : "image",
          isBlob: false,
        })),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount or when previews change
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.isBlob) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previews]);

  const getAcceptedTypes = () => {
    // HEIC/HEIF added for iOS compatibility
    const imageTypes = "image/jpeg,image/png,image/webp,image/heic,image/heif";
    const videoTypes = "video/mp4,video/webm";
    return acceptVideo ? `${imageTypes},${videoTypes}` : imageTypes;
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return t("maxFileSize");
    }

    // HEIC/HEIF added for iOS compatibility
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm"];

    if (file.type.startsWith("video/")) {
      if (!acceptVideo || !allowedVideoTypes.includes(file.type)) {
        return t("invalidVideoFormat");
      }
      // TODO: Check video duration (requires loading video metadata)
    } else if (!allowedImageTypes.includes(file.type)) {
      return t("invalidImageFormat");
    }

    return null;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
    }

    // For avatar variant, only allow one file
    if (variant === "avatar" && files.length > 1) {
      toast.error(t("onlyOneFile"));
      return;
    }

    // For gallery variant, check max files
    if (variant === "gallery" && previews.length + files.length > maxFiles) {
      toast.error(t("maximumFilesReached"));
      return;
    }

    try {
      // Create previews
      const newPreviews = files.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
        isBlob: true,
      }));

      if (variant === "avatar") {
        setPreviews(newPreviews);
        // Upload single file for avatar
        const uploadResult = await onUpload(files[0]);
        setPreviews([{ url: uploadResult, type: "image", isBlob: false }]);
        onMediaChange(uploadResult);
      } else {
        setPreviews([...previews, ...newPreviews]);
        // Upload multiple files for gallery
        const uploadResult = await onUpload(files);
        const newUrls = [...currentMediaUrls, ...uploadResult];
        setPreviews(
          newUrls.map((url) => ({
            url,
            type: isVideoUrl(url) ? "video" : "image",
            isBlob: false,
          })),
        );
        onMediaChange(newUrls);
      }
    } catch (error) {
      // Revert previews on error
      if (variant === "avatar") {
        setPreviews(
          currentMediaUrl
            ? [{ url: currentMediaUrl, type: "image", isBlob: false }]
            : [],
        );
      } else {
        setPreviews(
          currentMediaUrls.map((url) => ({
            url,
            type:
              url.endsWith(".mp4") || url.endsWith(".webm") ? "video" : "image",
            isBlob: false,
          })),
        );
      }
      // Show error to user
      const message =
        error instanceof Error ? error.message : t("uploadError");
      toast.error(message);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index?: number) => {
    if (variant === "avatar") {
      // Revoke blob URL if it exists
      if (previews[0]?.isBlob) {
        URL.revokeObjectURL(previews[0].url);
      }
      setPreviews([]);
      onMediaChange("");
    } else if (index !== undefined) {
      // Revoke blob URL if it exists
      if (previews[index]?.isBlob) {
        URL.revokeObjectURL(previews[index].url);
      }
      const newPreviews = previews.filter((_, i) => i !== index);
      const newUrls = currentMediaUrls.filter((_, i) => i !== index);
      setPreviews(newPreviews);
      onMediaChange(newUrls);
    }
  };

  if (variant === "avatar") {
    return (
      <div className="space-y-3">
        <label className="text-base font-semibold text-slate-200">
          {label}
        </label>
        {hint && <p className="text-sm text-slate-400">{hint}</p>}

        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 mt-2">
          {previews[0] ? (
            <div className="relative size-32 rounded-lg overflow-hidden border-2 border-slate-600 bg-slate-800/50 shrink-0 mx-auto sm:mx-0">
              <img
                src={
                  previews[0].isBlob
                    ? previews[0].url
                    : getMediaUrl(previews[0].url)
                }
                alt="Profile preview"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="size-32 rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/30 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <Upload className="size-8 text-slate-500" />
            </div>
          )}

          <div className="flex flex-col gap-2.5 flex-1 w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedTypes()}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold cursor-pointer h-11 sm:h-10"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 sm:size-4 mr-2 shrink-0 animate-spin" />
                  <span className="truncate">{t("uploading")}</span>
                </>
              ) : previews[0] ? (
                <>
                  <Upload className="size-4 sm:size-4 mr-2 shrink-0" />
                  <span className="truncate">{t("changePhoto")}</span>
                </>
              ) : (
                <>
                  <Upload className="size-4 sm:size-4 mr-2 shrink-0" />
                  <span className="truncate">{t("selectPhoto")}</span>
                </>
              )}
            </Button>

            {previews[0] && (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={() => handleRemove()}
                disabled={isUploading}
                className="w-full cursor-pointer h-11 sm:h-10"
              >
                <X className="size-4 sm:size-4 mr-2 shrink-0" />
                <span className="truncate">{t("removePhoto")}</span>
              </Button>
            )}

            <p className="text-xs text-slate-400">
              {t("maxFileSize")} •{" "}
              {acceptVideo
                ? t("acceptedFormatsWithVideo")
                : t("acceptedFormats")}
              {acceptVideo && (
                <>
                  <br />
                  {t("videoMaxDuration")}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Gallery variant
  return (
    <div className="space-y-2">
      <label className="text-base font-semibold text-slate-200">{label}</label>
      {hint && <p className="text-sm text-slate-400">{hint}</p>}

      <div className="grid grid-cols-3 gap-4 pb-4 mt-2">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-600 bg-slate-800/50 group"
          >
            {preview.type === "video" ? (
              <div className="relative size-full">
                <video
                  src={getMediaUrl(preview.url)}
                  className="size-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="size-8 text-white" />
                </div>
              </div>
            ) : (
              <img
                src={preview.isBlob ? preview.url : getMediaUrl(preview.url)}
                alt={`Gallery ${index + 1}`}
                className="size-full object-cover"
              />
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              disabled={isUploading}
              className="absolute top-2 right-2 size-6 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label={t("removeMedia")}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        {previews.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-2"
          >
            {isUploading ? (
              <Loader2 className="size-6 sm:size-8 text-slate-500 animate-spin" />
            ) : (
              <>
                <Upload className="size-5 sm:size-6 text-slate-500" />
                <span className="text-[10px] sm:text-xs text-slate-500 text-center leading-tight">
                  {t("selectMedia")}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
        multiple
      />

      <p className="text-xs text-slate-500">
        {t("maxFileSize")} •{" "}
        {acceptVideo ? t("acceptedFormatsWithVideo") : t("acceptedFormats")}
        {acceptVideo && <> • {t("videoMaxDuration")}</>}
      </p>
    </div>
  );
}
