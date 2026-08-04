"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type CropShape } from "@/components/ui/ImageCropModal";
import { useCropUpload } from "@/hooks/useCropUpload";
import { Image, Upload, Loader2, Plus, X } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";
import type { MediaField, GalleryField } from "@/types/enterprise";

interface CropConfig {
  aspectRatio?: number;
  freeAspect?: boolean;
  objectFit?: "contain" | "cover";
  /** Use the free-form resizable crop (react-image-crop) for covers/backgrounds. */
  freeCrop?: boolean;
  cropShape?: CropShape;
  outputWidth?: number;
  outputHeight?: number;
  /**
   * Smart crop: if the uploaded image already matches the target aspect ratio
   * (within tolerance), skip the crop modal and just resize + compress. Only
   * used for free-form crops (covers) where a panoramic image needs no manual
   * cropping.
   */
  smartAspect?: boolean;
  /** Aspect-ratio tolerance for smartAspect (e.g. 0.1 = ±10%). */
  smartTolerance?: number;
}

interface EnterpriseProfileMediaProps {
  logo: MediaField;
  cover: MediaField;
  aboutImage: MediaField;
  gallery: GalleryField;
  /**
   * Called when an existing image is replaced by a new one. The caller should
   * defer the R2 deletion until the profile is saved, so a cancelled form or a
   * failed save never destroys a file the DB still references.
   */
  onPendingDelete?: (url: string) => void;
}

function MediaPreview({
  url,
  onRemove,
  label,
}: {
  url: string;
  onRemove: () => void;
  label: string;
}) {
  const [imgError, setImgError] = useState(false);
  const t = useTranslations("Dashboard.enterprise");

  return (
    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-slate-600 relative group">
      {imgError ? (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
          <Image className="w-6 h-6 text-slate-600" aria-hidden="true" />
        </div>
      ) : (
        <img
          src={getMediaUrl(url)}
          alt={label}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label={`${label} — ${t("remove")}`}
      >
        <X className="w-3 h-3 text-white" aria-hidden="true" />
      </button>
    </div>
  );
}

function MediaUploadRow({
  field,
  inputId,
  accept,
  uploadLabel,
  previewLabel,
  showPreview,
  crop,
  onPendingDelete,
}: {
  field: MediaField;
  inputId: string;
  accept: string;
  uploadLabel: string;
  previewLabel: string;
  showPreview?: boolean;
  crop?: CropConfig;
  onPendingDelete?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("Dashboard.enterprise");

  const { isUploading, handleFileChange, handleUrlCrop, cropModal } =
    useCropUpload({
      uploadFile: async (file) => {
        if (!field.onUploadFile) throw new Error("Upload not available");
        return field.onUploadFile(file);
      },
      onUrlChange: (url) => {
        // If an image was already set, defer deleting the old one from R2 until
        // the profile is saved (the caller collects it via onPendingDelete).
        if (field.url && field.url !== url) {
          onPendingDelete?.(field.url);
        }
        field.onUrlChange(url);
      },
      crop: crop ?? {
        aspectRatio: 1,
        outputWidth: 600,
        outputHeight: 600,
      },
      enableUrlCrop: true,
      filename: inputId,
      errorMessage: t("uploadFailed"),
    });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (crop && field.onUploadFile) {
      handleFileChange(e);
    } else {
      field.onChange(e);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-base font-medium">
        {uploadLabel}
      </Label>
      <div className="flex gap-2">
        <Input
          type="text"
          name={inputId}
          id={inputId}
          value={field.url}
          onChange={(e) => field.onUrlChange(e.target.value)}
          onBlur={(e) => handleUrlCrop(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleUrlCrop(e.currentTarget.value);
            }
          }}
          className="h-11 flex-1 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50"
          placeholder={`https://example.com/${inputId}`}
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onFileChange}
          className="hidden"
          disabled={field.isUploading || isUploading}
        />
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={field.isUploading || isUploading}
          className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer"
          aria-label={t("uploadFromComputer")}
        >
          {field.isUploading || isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="w-4 h-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      {showPreview !== false && field.url && (
        <MediaPreview
          url={field.url}
          onRemove={field.onRemove}
          label={previewLabel}
        />
      )}

      {crop && cropModal}
    </div>
  );
}

export function EnterpriseProfileMedia({
  logo,
  cover,
  aboutImage,
  gallery,
  onPendingDelete,
}: EnterpriseProfileMediaProps) {
  const t = useTranslations("Dashboard.enterprise");
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const handleAddGalleryImage = () => {
    const url = newGalleryUrl.trim();
    if (!url) return;
    gallery.onAdd(url);
    setNewGalleryUrl("");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 pt-4 border-t border-slate-700">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <Image className="w-5 h-5 text-amber-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {t("visuals") || "Visuals"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MediaUploadRow
          field={logo}
          inputId="logoUrl"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          uploadLabel={t("logoUrl") || "Logo"}
          previewLabel={t("logoPreview") || "Logo preview"}
          onPendingDelete={onPendingDelete}
          crop={{
            aspectRatio: 1,
            cropShape: "rect",
            outputWidth: 600,
            outputHeight: 600,
          }}
        />
        <MediaUploadRow
          field={cover}
          inputId="coverUrl"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          uploadLabel={t("coverUrl") || "Cover Photo"}
          previewLabel={t("coverPreview") || "Cover preview"}
          onPendingDelete={onPendingDelete}
          crop={{
            // Free-form resizable crop (react-image-crop) — the user grabs the
            // corners/edges to choose exactly which portion of the cover to keep.
            freeCrop: true,
            aspectRatio: 3,
            outputWidth: 1920,
            outputHeight: 640,
            // Smart cover: if the uploaded image is already close to 3:1
            // (a ready-made banner), skip the crop modal and just resize +
            // compress. Only phone photos / wrong ratios get the crop tool.
            smartAspect: true,
            smartTolerance: 0.1,
          }}
        />
      </div>

      <div className="space-y-2 mt-4">
        <MediaUploadRow
          field={aboutImage}
          inputId="aboutImage"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          uploadLabel={t("aboutImage") || "About Section Image"}
          previewLabel={t("aboutImagePreview") || "About section image preview"}
          onPendingDelete={onPendingDelete}
          crop={{
            // Portrait crop to match the tall "About Us" column (2 of 5 cols).
            aspectRatio: 3 / 4,
            cropShape: "rect",
            outputWidth: 900,
            outputHeight: 1200,
          }}
        />
        <p className="text-sm text-slate-400">
          {t("aboutImageDescription") ||
            "This image will be displayed in the 'About Us' section of your public profile."}
        </p>
      </div>

      <div className="space-y-3 mt-4">
        <Label className="text-base font-medium">
          {t("gallery") || "Gallery"}
        </Label>
        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="url"
            value={newGalleryUrl}
            onChange={(e) => setNewGalleryUrl(e.target.value)}
            className="h-11 flex-1 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50"
            placeholder={t("galleryUrlPlaceholder") || "Add image URL..."}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGalleryImage();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddGalleryImage}
            disabled={!newGalleryUrl.trim()}
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer"
            aria-label={t("addGalleryImage") || "Add gallery image"}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={gallery.onChange}
            className="hidden"
            disabled={gallery.isUploading}
            multiple
          />
          <Button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={gallery.isUploading}
            className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer"
            aria-label={t("uploadGallery") || "Upload images from computer"}
          >
            {gallery.isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {gallery.items.length > 0 && (
          <div
            className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2"
            role="list"
            aria-label={t("gallery") || "Gallery"}
          >
            {gallery.items.map((url, index) => (
              <div
                key={index}
                role="listitem"
                className="relative group aspect-square rounded-lg overflow-hidden border border-slate-600"
              >
                <img
                  src={getMediaUrl(url)}
                  alt={`${t("galleryImage") || "Gallery image"} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => gallery.onRemove(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label={`${t("removeGalleryImage") || "Remove image"} ${index + 1}`}
                >
                  <X className="w-3 h-3 text-white" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
