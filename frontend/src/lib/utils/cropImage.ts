/**
 * Crop an image using the crop area provided by react-easy-crop and
 * produce a final Blob ready for upload.
 *
 * This is the "Opcja A" architecture: the crop happens client-side, the
 * canvas generates a final (already-cropped) image, and that image is
 * uploaded to R2. No crop metadata is stored — the uploaded file is the
 * final avatar/logo.
 */

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
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to generate image"));
        }
      },
      format,
      quality,
    );
  });

  return blob;
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
