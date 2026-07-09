"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";

interface OGPreview {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface OGPreviewResponse {
  success: boolean;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  url?: string;
}

export function useOGPreview(url: string, type: "link" | "post") {
  const [ogPreview, setOgPreview] = useState<OGPreview | null>(null);
  const [isFetchingOg, setIsFetchingOg] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (type !== "link" || !url) {
      setOgPreview(null);
      setFetchFailed(false);
      return;
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl || !trimmedUrl.startsWith("http")) {
      setOgPreview(null);
      setFetchFailed(false);
      return;
    }

    // Validate URL
    try {
      new URL(trimmedUrl);
    } catch {
      setOgPreview(null);
      setFetchFailed(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsFetchingOg(true);
    setFetchFailed(false);

    apiClient
      .post<OGPreviewResponse>(
        "/og-preview",
        { url: trimmedUrl },
        { signal: controller.signal },
      )
      .then((res) => {
        if (res.data.success) {
          setOgPreview({
            title: res.data.title || "",
            description: res.data.description || "",
            image: res.data.image || "",
            url: res.data.url || trimmedUrl,
          });
          setFetchFailed(false);
        } else {
          setOgPreview(null);
          setFetchFailed(true);
        }
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setOgPreview(null);
        setFetchFailed(true);
      })
      .finally(() => {
        setIsFetchingOg(false);
      });

    return () => {
      controller.abort();
    };
  }, [url, type]);

  return { ogPreview, isFetchingOg, fetchFailed };
}
