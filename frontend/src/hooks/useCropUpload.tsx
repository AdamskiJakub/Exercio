"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImageCropModal, type CropShape } from "@/components/ui/ImageCropModal";
import { ImageCropModalFree } from "@/components/ui/ImageCropModalFree";
import {
  blobToFile,
  isHeic,
  matchesAspectRatio,
  processImage,
} from "@/lib/utils/cropImage";
import { toast } from "sonner";

export interface CropUploadConfig {
  /** Use the free-form resizable crop (react-image-crop) for covers/backgrounds. */
  freeCrop?: boolean;
  /** Aspect ratio of the crop window (width / height). */
  aspectRatio?: number;
  /** Shape of the crop window (fixed-aspect modal only). */
  cropShape?: CropShape;
  /** How the image is fitted inside the crop container (fixed-aspect modal). */
  objectFit?: "contain" | "cover";
  /** Derive the crop aspect from the image's natural dimensions (fixed-aspect). */
  freeAspect?: boolean;
  /** Output width in pixels. */
  outputWidth?: number;
  /** Output height in pixels. Defaults to outputWidth. */
  outputHeight?: number;
  /**
   * Smart crop: if the uploaded/pasted image already matches the target aspect
   * ratio (within tolerance), skip the crop modal and just resize + compress
   * before uploading. Only used for free-form crops (covers/thumbnails).
   */
  smartAspect?: boolean;
  /** Aspect-ratio tolerance for smartAspect (e.g. 0.1 = ±10%). */
  smartTolerance?: number;
}

interface UseCropUploadOptions {
  /** Upload a File/Blob and return the resulting URL. */
  uploadFile: (file: File) => Promise<string>;
  /** Called whenever a new URL is set (after upload or URL paste). */
  onUrlChange: (url: string) => void;
  /** Crop configuration. */
  crop: CropUploadConfig;
  /** Enable the "paste image URL" flow (fetch → smart-skip or crop). */
  enableUrlCrop?: boolean;
  /** Base filename for uploaded blobs. */
  filename?: string;
  /** Success toast message. */
  successMessage?: string;
  /** Error toast message. */
  errorMessage?: string;
}

interface UseCropUploadReturn {
  /** True while an upload/crop-save is in progress. */
  isUploading: boolean;
  /** Current value of the URL input (only meaningful when enableUrlCrop). */
  urlValue: string;
  /** Set the URL input value directly (e.g. when pre-filling from a saved value). */
  setUrlValue: (url: string) => void;
  /** Open the crop modal for a locally-selected file (handles HEIC bypass). */
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Process a pasted image URL (fetch → smart-skip or open crop modal). */
  handleUrlCrop: (url: string) => void;
  /** Reset the URL input and any pending crop. */
  reset: () => void;
  /** The crop modal element to render in the component's JSX. */
  cropModal: React.ReactNode;
}

/**
 * Shared crop + upload pipeline used by every single-image upload in the app
 * (enterprise logo/cover/about, instructor avatar, news/blog/link thumbnails).
 *
 * Encapsulates the repetitive logic that used to be duplicated across
 * components:
 *   - opening the crop modal for a locally-picked file (with HEIC bypass),
 *   - processing a pasted image URL (fetch → smart-skip or crop),
 *   - confirming the crop → upload the blob → report the new URL,
 *   - rendering the correct crop modal (free-form vs fixed-aspect).
 *
 * Components keep their own layout/preview rendering but delegate all the
 * crop/upload state and handlers here.
 */
export function useCropUpload({
  uploadFile,
  onUrlChange,
  crop,
  enableUrlCrop = false,
  filename = "image",
  successMessage,
  errorMessage,
}: UseCropUploadOptions): UseCropUploadReturn {
  const t = useTranslations("Dashboard.enterprise");
  const [isUploading, setIsUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadBlob = useCallback(
    async (blob: Blob) => {
      const file = blobToFile(blob, filename);
      return uploadFile(file);
    },
    [uploadFile, filename],
  );

  const handleError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : errorMessage || "Upload failed";
      toast.error(errorMessage || "Upload failed", { description: message });
    },
    [errorMessage],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (!file) return;

      // Smart skip: if the image already matches the target ratio, resize +
      // compress and upload directly (no crop modal).
      if (crop.smartAspect && crop.freeCrop && file.type.startsWith("image/")) {
        let matches = false;
        try {
          matches = await matchesAspectRatio(
            file,
            crop.aspectRatio ?? 3,
            crop.smartTolerance ?? 0.1,
          );
        } catch {
          matches = false;
        }
        if (matches) {
          setIsUploading(true);
          try {
            const optimized = await processImage(file, "cover", {
              maxWidth: crop.outputWidth,
              maxHeight: crop.outputHeight,
            });
            const url = await uploadBlob(optimized);
            onUrlChange(url);
            toast.success(successMessage || "Image uploaded");
          } catch (error) {
            handleError(error);
          } finally {
            setIsUploading(false);
          }
          return;
        }
      }

      // HEIC/HEIF cannot be decoded by browsers, so the crop modal would fail
      // to render. Upload them directly instead — the backend converts them.
      if (isHeic(file)) {
        setIsUploading(true);
        try {
          const url = await uploadBlob(file);
          onUrlChange(url);
          toast.success(successMessage || "Image uploaded");
        } catch (error) {
          handleError(error);
        } finally {
          setIsUploading(false);
        }
        return;
      }

      // Open the crop modal for the selected file.
      setCropFile(file);
    },
    [crop, uploadBlob, onUrlChange, successMessage, handleError],
  );

  const handleCropConfirm = useCallback(
    async (blob: Blob) => {
      setIsUploading(true);
      try {
        const url = await uploadBlob(blob);
        onUrlChange(url);
        setUrlValue(url);
        toast.success(successMessage || "Image uploaded");
      } catch (error) {
        handleError(error);
      } finally {
        setIsUploading(false);
        setCropFile(null);
        setCropUrl(null);
      }
    },
    [uploadBlob, onUrlChange, successMessage, handleError],
  );

  const handleCropCancel = useCallback(() => {
    setCropFile(null);
    setCropUrl(null);
  }, []);

  // When the user pastes an image URL, fetch the remote image and either
  // smart-skip the crop if it already matches the target ratio, or open the
  // crop modal so the image is always optimized to the target size.
  const handleUrlCrop = useCallback(
    async (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) {
        onUrlChange("");
        return;
      }

      setIsUploading(true);
      try {
        const response = await fetch(trimmed);
        if (!response.ok) throw new Error("Failed to fetch image");
        const blob = await response.blob();

        // Smart skip: if the remote image already matches the target ratio,
        // resize + compress and upload it directly (no crop modal).
        if (
          crop.smartAspect &&
          crop.freeCrop &&
          (await matchesAspectRatio(
            blob,
            crop.aspectRatio ?? 3,
            crop.smartTolerance ?? 0.1,
          ))
        ) {
          const optimized = await processImage(blob, "cover", {
            maxWidth: crop.outputWidth,
            maxHeight: crop.outputHeight,
          });
          const uploaded = await uploadBlob(optimized);
          onUrlChange(uploaded);
          setUrlValue(uploaded);
          toast.success(successMessage || "Image uploaded");
          return;
        }

        // Otherwise open the crop modal with the remote URL as the source.
        setCropUrl(trimmed);
      } catch {
        // If the URL can't be fetched/loaded as an image (CORS, invalid, etc.),
        // fall back to storing it as-is so the user isn't blocked from saving.
        onUrlChange(trimmed);
        setUrlValue(trimmed);
      } finally {
        setIsUploading(false);
      }
    },
    [crop, uploadBlob, onUrlChange, successMessage],
  );

  const reset = useCallback(() => {
    setUrlValue("");
    setCropFile(null);
    setCropUrl(null);
  }, []);

  const cropModal = crop.freeCrop ? (
    <ImageCropModalFree
      open={!!cropFile || !!cropUrl}
      imageSrc={cropFile ?? cropUrl ?? ""}
      aspectRatio={crop.aspectRatio ?? 3}
      outputWidth={crop.outputWidth ?? 1920}
      outputHeight={crop.outputHeight ?? crop.outputWidth ?? 640}
      format="image/webp"
      isSaving={isUploading}
      onConfirm={handleCropConfirm}
      onCancel={handleCropCancel}
    />
  ) : (
    <ImageCropModal
      open={!!cropFile || !!cropUrl}
      imageSrc={cropFile ?? cropUrl ?? ""}
      aspectRatio={crop.aspectRatio ?? 1}
      freeAspect={crop.freeAspect ?? false}
      objectFit={crop.objectFit ?? "contain"}
      cropShape={crop.cropShape ?? "rect"}
      outputWidth={crop.outputWidth ?? 600}
      outputHeight={crop.outputHeight ?? crop.outputWidth ?? 600}
      format="image/webp"
      isSaving={isUploading}
      onConfirm={handleCropConfirm}
      onCancel={handleCropCancel}
    />
  );

  return {
    isUploading,
    urlValue,
    setUrlValue,
    handleFileChange,
    handleUrlCrop,
    reset,
    cropModal,
  };
}
