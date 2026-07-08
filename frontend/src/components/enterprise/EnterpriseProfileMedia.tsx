"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image, Upload, Loader2, Plus, X } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";

interface EnterpriseProfileMediaProps {
  logoUrl: string;
  coverUrl: string;
  gallery: string[];
  isUploadingLogo: boolean;
  isUploadingCover: boolean;
  isUploadingGallery: boolean;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoUrlChange: (value: string) => void;
  onCoverUrlChange: (value: string) => void;
  onAddGalleryImage: (url: string) => void;
  onRemoveGalleryImage: (index: number) => void;
  onRemoveLogo: () => void;
  onRemoveCover: () => void;
}

export function EnterpriseProfileMedia({
  logoUrl,
  coverUrl,
  gallery,
  isUploadingLogo,
  isUploadingCover,
  isUploadingGallery,
  onLogoChange,
  onCoverChange,
  onGalleryUpload,
  onLogoUrlChange,
  onCoverUrlChange,
  onAddGalleryImage,
  onRemoveGalleryImage,
  onRemoveLogo,
  onRemoveCover,
}: EnterpriseProfileMediaProps) {
  const t = useTranslations("Dashboard.enterprise");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const handleAddGalleryImage = () => {
    const url = newGalleryUrl.trim();
    if (!url) return;
    onAddGalleryImage(url);
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

      {/* Logo & Cover */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="space-y-2">
          <Label htmlFor="logoUrl" className="text-base font-medium">
            {t("logoUrl") || "Logo"}
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              name="logoUrl"
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => onLogoUrlChange(e.target.value)}
              className="h-11 flex-1"
              placeholder="https://example.com/logo.png"
            />
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onLogoChange}
              className="hidden"
              disabled={isUploadingLogo}
            />
            <Button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
              className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
              aria-label={t("uploadLogo") || "Upload logo from computer"}
            >
              {isUploadingLogo ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          {logoUrl && (
            <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-slate-600 relative group">
              <img
                src={getMediaUrl(logoUrl)}
                alt={t("logoPreview") || "Logo preview"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={onRemoveLogo}
                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t("removeLogo") || "Remove logo"}
              >
                <X className="w-3 h-3 text-white" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Cover */}
        <div className="space-y-2">
          <Label htmlFor="coverUrl" className="text-base font-medium">
            {t("coverUrl") || "Cover Photo"}
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              name="coverUrl"
              id="coverUrl"
              value={coverUrl}
              onChange={(e) => onCoverUrlChange(e.target.value)}
              className="h-11 flex-1"
              placeholder="https://example.com/cover.jpg"
            />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onCoverChange}
              className="hidden"
              disabled={isUploadingCover}
            />
            <Button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
              aria-label={t("uploadCover") || "Upload cover from computer"}
            >
              {isUploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          {coverUrl && (
            <div className="mt-2 w-full h-20 rounded-lg overflow-hidden border border-slate-600 relative group">
              <img
                src={getMediaUrl(coverUrl)}
                alt={t("coverPreview") || "Cover preview"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={onRemoveCover}
                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t("removeCover") || "Remove cover"}
              >
                <X className="w-3 h-3 text-white" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
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
            accept="image/jpeg,image/png,image/webp"
            onChange={onGalleryUpload}
            className="hidden"
            disabled={isUploadingGallery}
            multiple
          />
          <Button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isUploadingGallery}
            className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
            aria-label={t("uploadGallery") || "Upload images from computer"}
          >
            {isUploadingGallery ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {gallery.length > 0 && (
          <div
            className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2"
            role="list"
            aria-label={t("gallery") || "Gallery"}
          >
            {gallery.map((url, index) => (
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
                  onClick={() => onRemoveGalleryImage(index)}
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
