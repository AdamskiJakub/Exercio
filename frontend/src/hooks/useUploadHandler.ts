import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Generic hook for handling file uploads in form state.
 * Eliminates duplicated upload handler patterns.
 */
export function useUploadHandler(
  uploadFn: (file: File) => Promise<string>,
  setForm: React.Dispatch<React.SetStateAction<any>>,
  field: string,
  options?: {
    onSuccess?: (url: string) => void;
    successMessage?: string;
    errorMessage?: string;
    isMultiFile?: boolean;
  },
) {
  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      try {
        if (options?.isMultiFile) {
          const fileArray = Array.from(files);
          const urls = await Promise.all(fileArray.map(uploadFn));
          setForm((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), ...urls],
          }));
        } else {
          const url = await uploadFn(files[0]);
          setForm((prev: any) => ({
            ...prev,
            [field]: url,
          }));
          options?.onSuccess?.(url);
        }
        toast.success(options?.successMessage || "Upload successful");
      } catch {
        toast.error(options?.errorMessage || "Upload failed");
      }
    },
    [uploadFn, setForm, field, options],
  );

  return handleUpload;
}
