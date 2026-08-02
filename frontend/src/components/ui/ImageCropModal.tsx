"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useTranslations } from "next-intl";
import { Loader2, ZoomIn, ZoomOut, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cropImage } from "@/lib/utils/cropImage";

export type CropShape = "rect" | "round";

export interface ImageCropModalProps {
  /** Source image: File, Blob, or URL string. */
  imageSrc: string | Blob;
  /** Aspect ratio of the crop window (width / height). */
  aspectRatio?: number;
  /** When true, derive the crop aspect from the image's natural dimensions. */
  freeAspect?: boolean;
  /** How the image is fitted inside the crop container. */
  objectFit?: "contain" | "cover";
  /** Shape of the crop window. */
  cropShape?: CropShape;
  /** Output width in pixels. */
  outputWidth?: number;
  /** Output height in pixels. Defaults to outputWidth. */
  outputHeight?: number;
  /** Output format. */
  format?: "image/webp" | "image/jpeg" | "image/png";
  /** Called with the final cropped Blob when the user confirms. */
  onConfirm: (blob: Blob) => void | Promise<void>;
  /** Called when the modal is closed without confirming. */
  onCancel: () => void;
  /** Whether the modal is open. */
  open: boolean;
  /** Whether a save operation is in progress. */
  isSaving?: boolean;
}

interface CropContentProps {
  imageSrc: string | Blob;
  aspectRatio: number;
  freeAspect: boolean;
  objectFit: "contain" | "cover";
  cropShape: CropShape;
  outputWidth: number;
  outputHeight: number;
  format: "image/webp" | "image/jpeg" | "image/png";
  isSaving: boolean;
  onConfirm: (blob: Blob) => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Inner component holding the crop state. It is remounted (via `key`) whenever
 * the source image changes, which resets crop/zoom without an effect.
 */
function CropContent({
  imageSrc,
  aspectRatio,
  freeAspect,
  objectFit,
  cropShape,
  outputWidth,
  outputHeight,
  format,
  isSaving,
  onConfirm,
  onCancel,
}: CropContentProps) {
  const t = useTranslations("ImageCrop");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [fitMode, setFitMode] = useState<"contain" | "cover">(objectFit);
  // Natural aspect ratio of the source image (used when freeAspect is true).
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);

  // react-easy-crop requires a URL string. Convert File/Blob to a data URL so
  // there is no object-URL lifecycle to manage (data URLs are self-contained).
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof imageSrc === "string") {
      setImageUrl(imageSrc);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(imageSrc);
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  // When freeAspect is enabled, derive the crop aspect from the image's
  // natural dimensions so the whole image fits inside the crop window.
  useEffect(() => {
    if (!freeAspect || !imageUrl) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setNaturalAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = imageUrl;
  }, [freeAspect, imageUrl]);

  const effectiveAspect =
    freeAspect && naturalAspect ? naturalAspect : aspectRatio;

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const blob = await cropImage(imageSrc, croppedAreaPixels, {
      outputWidth,
      outputHeight,
      format,
    });
    await onConfirm(blob);
  }, [
    croppedAreaPixels,
    imageSrc,
    outputWidth,
    outputHeight,
    format,
    onConfirm,
  ]);

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);

  return (
    <>
      {/* Crop area */}
      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-slate-950">
        {imageUrl ? (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={effectiveAspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit={fitMode}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* Fit mode toggle: contain (whole image) vs cover (fill frame) */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm text-slate-400 shrink-0">
          {t("fit") || "Fit"}
        </span>
        <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800/60">
          <button
            type="button"
            onClick={() => setFitMode("contain")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              fitMode === "contain"
                ? "bg-orange-500/20 text-orange-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("fitContain") || "Whole image"}
          </button>
          <button
            type="button"
            onClick={() => setFitMode("cover")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              fitMode === "cover"
                ? "bg-orange-500/20 text-orange-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("fitCover") || "Fill frame"}
          </button>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-3 px-1">
        <ZoomOut className="size-5 text-slate-400 shrink-0" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-orange-500 cursor-pointer"
          aria-label={t("zoom") || "Zoom"}
        />
        <ZoomIn className="size-5 text-slate-400 shrink-0" />
        <span className="w-12 text-right text-sm text-slate-400 tabular-nums">
          {zoomLabel}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="destructive"
          onClick={onCancel}
          disabled={isSaving}
          className="cursor-pointer"
        >
          <X className="size-4 mr-2" />
          {t("cancel") || "Cancel"}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isSaving || !croppedAreaPixels}
          className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              {t("saving") || "Saving..."}
            </>
          ) : (
            <>
              <Check className="size-4 mr-2" />
              {t("save") || "Save"}
            </>
          )}
        </Button>
      </div>
    </>
  );
}

/**
 * Reusable image crop modal built on react-easy-crop.
 *
 * Use it for avatars (round, square), logos (square), cover photos, event
 * images, etc. — just pass the right props.
 */
export function ImageCropModal({
  imageSrc,
  aspectRatio = 1,
  freeAspect = false,
  objectFit = "contain",
  cropShape = "rect",
  outputWidth = 600,
  outputHeight = outputWidth,
  format = "image/webp",
  onConfirm,
  onCancel,
  open,
  isSaving = false,
}: ImageCropModalProps) {
  const t = useTranslations("ImageCrop");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        className="max-w-lg sm:max-w-xl bg-slate-900 border-2 border-slate-600 shadow-2xl shadow-black/60 ring-1 ring-white/10 text-slate-100"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {t("title") || "Adjust your photo"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {t("description") ||
              "Drag to reposition and use the slider to zoom. The final image will be saved in the selected frame."}
          </DialogDescription>
        </DialogHeader>

        {/* key resets crop/zoom state whenever the source image changes */}
        <CropContent
          key={typeof imageSrc === "string" ? imageSrc : "blob"}
          imageSrc={imageSrc}
          aspectRatio={aspectRatio}
          freeAspect={freeAspect}
          objectFit={objectFit}
          cropShape={cropShape}
          outputWidth={outputWidth}
          outputHeight={outputHeight}
          format={format}
          isSaving={isSaving}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
