export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOptions {
  /** Output width in pixels (e.g. 600). */
  outputWidth?: number;
  /** Output height in pixels. Defaults to outputWidth (square). */
  outputHeight?: number;
  /** Output format. Defaults to "image/webp". */
  format?: "image/webp" | "image/jpeg" | "image/png";
  /** JPEG/WebP quality 0-1. Defaults to 0.85. */
  quality?: number;
}

/**
 * Load an image source (File, Blob, or URL string) into an HTMLImageElement.
 */
export function loadImage(src: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof src === "string" ? src : URL.createObjectURL(src);

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (typeof src !== "string") {
        URL.revokeObjectURL(url);
      }
      resolve(image);
    };
    image.onerror = () => {
      if (typeof src !== "string") {
        URL.revokeObjectURL(url);
      }
      reject(new Error("Failed to load image"));
    };
    image.src = url;
  });
}

/**
 * Convert a File/Blob to a data URL, downscaling it to fit within a maximum
 * dimension first. Downscaling before encoding is critical on mobile: phone
 * photos are often 4000x3000+ (several MB), and encoding the raw file to a
 * base64 data URL produces a huge string that react-easy-crop struggles to
 * decode on Android — the crop modal appears to hang with a spinner and no
 * image. By capping the working size we keep the modal responsive while the
 * final crop output is still generated at full quality by `cropImage`.
 *
 * @param file - Source image file/blob.
 * @param maxDim - Maximum width/height in pixels (default 2048). High enough
 *   to keep 1920px cover crops sharp, low enough to keep the data URL small
 *   enough for mobile to decode quickly.
 * @returns A data URL string of the downscaled image.
 */
export function fileToDataUrl(file: Blob, maxDim = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read image"));
        return;
      }
      const img = new Image();
      // Request CORS so that cross-origin images (e.g. a URL pasted into the
      // crop modal) don't taint the canvas. Without this, canvas.toDataURL
      // below would throw a SecurityError for cross-origin sources.
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        if (scale >= 1) {
          // Small enough already — use the original data URL.
          resolve(reader.result as string);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context is not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Preserve transparency when downscaling — JPEG would flatten the alpha
        // channel to a black background. Both PNG and WebP can carry an alpha
        // channel (e.g. transparent logos), so keep their native format. Only
        // opaque formats (JPEG/JPG) are re-encoded as JPEG.
        const mime = file.type.toLowerCase();
        const keepAlpha = mime === "image/png" || mime === "image/webp";
        const outType = keepAlpha
          ? mime === "image/webp"
            ? "image/webp"
            : "image/png"
          : "image/jpeg";
        // toDataURL throws a synchronous SecurityError if the canvas is tainted
        // (cross-origin image without CORS). img.onerror can't catch it, so
        // wrap it and reject explicitly to avoid a permanently pending promise.
        try {
          resolve(canvas.toDataURL(outType, 0.9));
        } catch {
          reject(new Error("Failed to read image (cross-origin blocked)"));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a cropped image Blob from a source image and a crop area.
 *
 * @param imageSrc - File, Blob, or URL of the source image.
 * @param cropArea - The crop area (in source-image pixel coordinates)
 *   as returned by react-easy-crop's `onCropComplete` (the `croppedAreaPixels`).
 * @param options - Output size/format options.
 */
export async function cropImage(
  imageSrc: string | Blob,
  cropArea: CropArea,
  options: CropOptions = {},
): Promise<Blob> {
  const {
    outputWidth = 600,
    outputHeight = outputWidth,
    format = "image/webp",
    quality = 0.85,
  } = options;

  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not supported");
  }

  // Draw the cropped region scaled to the output size.
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  // Convert canvas to blob.
  const formats = Array.from(new Set([format, "image/jpeg", "image/png"]));

  let blob: Blob | null = null;
  let lastError: Error | null = null;

  for (const fmt of formats) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, fmt, quality);
    });
    if (blob) {
      return blob;
    }
  }

  throw new Error("Failed to generate image");
}

/**
 * Convert a Blob to a File with a given filename.
 */
export function blobToFile(blob: Blob, filename: string): File {
  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/jpeg"
        ? "jpg"
        : "webp";
  return new File([blob], `${filename}.${ext}`, { type: blob.type });
}

/**
 * Shared client-side image optimization pipeline.
 *
 * Every image uploaded to Exercio goes through this so that R2 only ever
 * stores optimized files (WebP, reasonable dimensions) instead of raw
 * multi-megabyte phone photos. This mirrors how Instagram/Facebook/Airbnb
 * handle uploads: resize → compress → upload, never the reverse.
 *
 * The crop modals already resize to small output dimensions, so this is
 * primarily used for gallery images (which are uploaded raw today) and for
 * the "smart cover" flow (a panoramic image that needs no cropping).
 */
export type ImageProcessType =
  | "avatar"
  | "logo"
  | "cover"
  | "about"
  | "gallery";

export interface ImageProcessConfig {
  /** Max output width in pixels. */
  maxWidth: number;
  /** Max output height in pixels. */
  maxHeight: number;
  /** Whether to preserve the source aspect ratio (fit within maxWidth/maxHeight). */
  preserveAspect: boolean;
  /** WebP/JPEG quality 0-1. */
  quality: number;
}

const IMAGE_PROCESS_CONFIGS: Record<ImageProcessType, ImageProcessConfig> = {
  avatar: {
    maxWidth: 600,
    maxHeight: 600,
    preserveAspect: false,
    quality: 0.85,
  },
  logo: { maxWidth: 600, maxHeight: 600, preserveAspect: false, quality: 0.9 },
  cover: {
    maxWidth: 1800,
    maxHeight: 600,
    preserveAspect: false,
    quality: 0.85,
  },
  about: {
    maxWidth: 900,
    maxHeight: 1200,
    preserveAspect: false,
    quality: 0.85,
  },
  gallery: {
    maxWidth: 1800,
    maxHeight: 1800,
    preserveAspect: true,
    quality: 0.82,
  },
};

export interface ProcessImageOptions {
  /** Output format. Defaults to "image/webp". */
  format?: "image/webp" | "image/jpeg" | "image/png";
  /** Override the per-type quality (0-1). */
  quality?: number;
  /** Override the per-type max dimensions. */
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Resize + compress an image file to the target dimensions for its type.
 * Returns a File ready for upload. Falls back to JPEG/PNG on browsers that
 * cannot encode WebP (e.g. iOS Safari).
 */
export async function processImage(
  file: File | Blob,
  type: ImageProcessType,
  options: ProcessImageOptions = {},
): Promise<File> {
  const cfg = IMAGE_PROCESS_CONFIGS[type];
  const format = options.format ?? "image/webp";
  const quality = options.quality ?? cfg.quality;
  const maxWidth = options.maxWidth ?? cfg.maxWidth;
  const maxHeight = options.maxHeight ?? cfg.maxHeight;
  const baseName =
    file instanceof File ? file.name.replace(/\.[^.]+$/, "") : type;

  const image = await loadImage(file);

  let outW = image.naturalWidth;
  let outH = image.naturalHeight;

  if (cfg.preserveAspect) {
    // Fit within maxWidth/maxHeight, preserving aspect ratio.
    const scale = Math.min(maxWidth / outW, maxHeight / outH, 1);
    outW = Math.max(1, Math.round(outW * scale));
    outH = Math.max(1, Math.round(outH * scale));
  } else {
    // Fixed target box (cover-style): scale to fill, then center-crop.
    const scale = Math.max(maxWidth / outW, maxHeight / outH);
    const scaledW = Math.round(outW * scale);
    const scaledH = Math.round(outH * scale);
    const sx = (scaledW - maxWidth) / 2;
    const sy = (scaledH - maxHeight) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context is not supported");
    }
    ctx.drawImage(
      image,
      sx,
      sy,
      maxWidth,
      maxHeight,
      0,
      0,
      maxWidth,
      maxHeight,
    );
    return encodeCanvasToFile(canvas, format, quality, baseName);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not supported");
  }
  ctx.drawImage(image, 0, 0, outW, outH);
  return encodeCanvasToFile(canvas, format, quality, baseName);
}

/**
 * Encode a canvas to a File, trying the requested format first and falling
 * back to JPEG/PNG on browsers that cannot encode WebP (e.g. iOS Safari).
 */
async function encodeCanvasToFile(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number,
  filename: string,
): Promise<File> {
  const formats = Array.from(new Set([format, "image/jpeg", "image/png"]));

  for (const fmt of formats) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, fmt, quality);
    });
    if (blob) {
      return blobToFile(blob, filename.replace(/\.[^.]+$/, ""));
    }
  }

  throw new Error("Failed to generate image");
}

/**
 * Detect whether an image already matches a target aspect ratio (within a
 * tolerance). Used by the "smart cover" flow: if a panoramic image is already
 * close to the cover ratio, we skip cropping and just resize + compress.
 *
 * @param aspectRatio - Target width/height ratio (e.g. 3 for a 3:1 cover).
 * @param tolerance - Allowed relative deviation (e.g. 0.1 = ±10%).
 */
export async function matchesAspectRatio(
  file: File | Blob,
  aspectRatio: number,
  tolerance = 0.1,
): Promise<boolean> {
  const image = await loadImage(file);
  const ratio = image.naturalWidth / image.naturalHeight;
  return Math.abs(ratio - aspectRatio) / aspectRatio <= tolerance;
}
