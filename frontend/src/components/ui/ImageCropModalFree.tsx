"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useTranslations } from "next-intl";
import { Loader2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cropImage } from "@/lib/utils/cropImage";

export interface ImageCropModalFreeProps {
  /** Source image: File, Blob, or URL string. */
  imageSrc: string | Blob;
  /** Initial aspect ratio of the crop window (width / height). */
  aspectRatio?: number;
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

/**
 * Free-form crop modal built on react-image-crop.
 *
 * Unlike the fixed-aspect react-easy-crop modal, this lets the user grab the
 * corners/edges of the crop window to freely resize it and drag it around the
 * image. Ideal for large cover/background photos where the user needs full
 * control over which portion of the image is kept.
 */
export function ImageCropModalFree({
  imageSrc,
  aspectRatio = 3,
  outputWidth = 1920,
  outputHeight = 640,
  format = "image/webp",
  onConfirm,
  onCancel,
  open,
  isSaving = false,
}: ImageCropModalFreeProps) {
  const t = useTranslations("ImageCrop");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [displaySize, setDisplaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Convert File/Blob to a data URL so react-image-crop can display it.
  // Also reset any crop/size state from a previous image so stale values
  // (captured at the previous onLoad) never leak into a new source image.
  useEffect(() => {
    let cancelled = false;
    setCrop(undefined);
    setCompletedCrop(null);
    setNaturalSize(null);
    setDisplaySize(null);
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

  // Initialize the crop window once the image loads, centered with the
  // requested aspect ratio.
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      imgRef.current = img;
      const { width, height } = img;
      // The <img> is scaled down to fit the modal (max-h-80 w-auto), so the
      // displayed size differs from the natural size. react-image-crop's
      // PixelCrop is in displayed-image coordinates, but cropImage expects
      // natural source-image coordinates — we must scale between the two.
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setDisplaySize({ width, height });
      const initial = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspectRatio, width, height),
        width,
        height,
      );
      setCrop(initial);
      setCompletedCrop(null);
    },
    [aspectRatio],
  );

  const handleConfirm = useCallback(async () => {
    if (!completedCrop?.width || !completedCrop.height) return;
    if (!naturalSize || !displaySize) return;

    try {
      // Scale the crop window from displayed-image pixels to natural pixels.
      const scaleX = naturalSize.width / displaySize.width;
      const scaleY = naturalSize.height / displaySize.height;
      const naturalCrop: PixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
        unit: "px",
      };

      // This is a free-form crop, so the user may resize the window to any
      // aspect ratio. Derive the output dimensions from the crop's own aspect
      // ratio (scaled to fit within the requested max output size) instead of
      // forcing the fixed outputWidth/outputHeight — otherwise a non-3:1 crop
      // would be stretched/distorted to the fixed cover ratio.
      const cropAspect = naturalCrop.width / naturalCrop.height;
      let outW = outputWidth;
      let outH = outputHeight;
      if (cropAspect >= 1) {
        // Landscape or square: width is the limiting dimension.
        outH = Math.round(outW / cropAspect);
      } else {
        // Portrait: height is the limiting dimension.
        outH = outputHeight;
        outW = Math.round(outH * cropAspect);
      }

      const blob = await cropImage(imageSrc, naturalCrop, {
        outputWidth: outW,
        outputHeight: outH,
        format,
      });
      await onConfirm(blob);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("error") || "Failed to save image";
      toast.error(message);
    }
  }, [
    completedCrop,
    naturalSize,
    displaySize,
    imageSrc,
    outputWidth,
    outputHeight,
    format,
    onConfirm,
    t,
  ]);

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
            {t("freeDescription") ||
              "Drag the corners or edges of the frame to resize it, and drag inside to move it."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full max-h-80 overflow-auto rounded-xl bg-slate-950">
          {imageUrl ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
              keepSelection
              className="max-h-80"
            >
              <img
                src={imageUrl}
                alt=""
                onLoad={onImageLoad}
                className="max-h-80 w-auto"
              />
            </ReactCrop>
          ) : (
            <div className="flex items-center justify-center h-72">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          )}
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
            disabled={
              isSaving || !completedCrop?.width || !completedCrop.height
            }
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
      </DialogContent>
    </Dialog>
  );
}
