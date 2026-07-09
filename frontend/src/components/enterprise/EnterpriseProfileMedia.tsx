"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image, Upload, Loader2, Plus, X } from "lucide-react";
import { getMediaUrl, isVideoUrl } from "@/lib/utils/media";
import type { MediaField, GalleryField } from "@/types/enterprise";

interface EnterpriseProfileMediaProps {
  logo: MediaField;
  cover: MediaField;
  aboutImage: MediaField;
  gallery: GalleryField;
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
        className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`${label} — remove`}
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
}: {
  field: MediaField;
  inputId: string;
  accept: string;
  uploadLabel: string;
  previewLabel: string;
  showPreview?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

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
          className="h-11 flex-1"
          placeholder={`https://example.com/${inputId}`}
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={field.onChange}
          className="hidden"
          disabled={field.isUploading}
        />
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={field.isUploading}
          className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
          aria-label={`Upload ${uploadLabel} from computer`}
        >
          {field.isUploading ? (
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
    </div>
  );
}

export function EnterpriseProfileMedia({
  logo,
  cover,
  aboutImage,
  gallery,
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
          accept="image/jpeg,image/png,image/webp"
          uploadLabel={t("logoUrl") || "Logo"}
          previewLabel={t("logoPreview") || "Logo preview"}
        />
        <MediaUploadRow
          field={cover}
          inputId="coverUrl"
          accept="image/jpeg,image/png,image/webp"
          uploadLabel={t("coverUrl") || "Cover Photo"}
          previewLabel={t("coverPreview") || "Cover preview"}
        />
      </div>

      <div className="space-y-2 mt-4">
        <MediaUploadRow
          field={aboutImage}
          inputId="aboutImage"
          accept="image/jpeg,image/png,image/webp"
          uploadLabel={t("aboutImage") || "About Section Image"}
          previewLabel={t("aboutImagePreview") || "About section image preview"}
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
            className="h-11 flex-1"
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
            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
            aria-label={t("addGalleryImage") || "Add gallery image"}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={gallery.onChange}
            className="hidden"
            disabled={gallery.isUploading}
            multiple
          />
          <Button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={gallery.isUploading}
            className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
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
                {isVideoUrl(url) ? (
                  <video
                    src={getMediaUrl(url)}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={getMediaUrl(url)}
                    alt={`${t("galleryImage") || "Gallery image"} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => gallery.onRemove(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
