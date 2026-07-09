"use client";

import { FileText, Link as LinkIcon } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";

interface NewsCardImageProps {
  thumbnailUrl: string | null;
  title: string | null;
  isLink: boolean;
}

export function NewsCardImage({
  thumbnailUrl,
  title,
  isLink,
}: NewsCardImageProps) {
  if (thumbnailUrl) {
    return (
      <div className="aspect-video overflow-hidden">
        <img
          src={getMediaUrl(thumbnailUrl)}
          alt={title || ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
      {isLink ? (
        <LinkIcon className="w-10 h-10 text-slate-700" aria-hidden="true" />
      ) : (
        <FileText className="w-10 h-10 text-slate-700" aria-hidden="true" />
      )}
    </div>
  );
}
