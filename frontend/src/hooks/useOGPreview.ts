"use client";

import { useState, useEffect } from "react";

interface OGPreview {
  title: string;
  description: string;
  image: string;
  url: string;
}

export function useOGPreview(url: string, type: "link" | "post") {
  const [ogPreview, setOgPreview] = useState<OGPreview | null>(null);
  const [isFetchingOg, setIsFetchingOg] = useState(false);

  useEffect(() => {
    if (type !== "link" || !url) {
      setOgPreview(null);
      return;
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl || !trimmedUrl.startsWith("http")) {
      setOgPreview(null);
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);
      setOgPreview({
        title: parsedUrl.hostname,
        description: trimmedUrl,
        image: "",
        url: trimmedUrl,
      });
    } catch {
      setOgPreview(null);
    }
  }, [url, type]);

  return { ogPreview, isFetchingOg };
}
