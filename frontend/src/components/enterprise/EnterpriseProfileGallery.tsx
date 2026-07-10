"use client";

import { useTranslations } from "next-intl";
import { Image as ImageIcon } from "lucide-react";
import { getMediaUrl, isVideoUrl } from "@/lib/utils/media";
import type { EnterpriseProfile } from "@/types/enterprise";

interface EnterpriseProfileGalleryProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseProfileGallery({
  enterprise,
}: EnterpriseProfileGalleryProps) {
  const t = useTranslations("EnterpriseProfile");

  if (!enterprise.gallery || enterprise.gallery.length === 0) return null;

  return (
    <section id="gallery" aria-labelledby="gallery-heading">
      <h2
        id="gallery-heading"
        className="text-2xl font-bold text-white flex items-center gap-2 mb-6"
      >
        <ImageIcon className="w-6 h-6 text-emerald-500" aria-hidden="true" />
        {t("gallery")}
      </h2>
      <div
        className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
        role="list"
        aria-label={t("gallery")}
      >
        {enterprise.gallery.map((url, index) => (
          <div
            key={index}
            className="break-inside-avoid rounded-xl overflow-hidden bg-slate-800 group shadow-sm"
            role="listitem"
          >
            {isVideoUrl(url) ? (
              <video
                src={getMediaUrl(url)}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={getMediaUrl(url)}
                alt={`${enterprise.companyName} gallery ${index + 1}`}
                loading="lazy"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
