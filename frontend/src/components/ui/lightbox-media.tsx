'use client';

import { getMediaUrl, isVideoUrl } from '@/lib/utils/media';

interface LightboxMediaProps {
  src: string;
  alt: string;
  onContentClick?: (e: React.MouseEvent) => void;
}

export function LightboxMedia({ src, alt, onContentClick }: LightboxMediaProps) {
  const isVideo = isVideoUrl(src);
  const mediaUrl = getMediaUrl(src);

  // Early return if no valid URL
  if (!mediaUrl) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContentClick?.(e);
  };

  if (isVideo) {
    return (
      <video
        src={mediaUrl}
        controls
        autoPlay
        onClick={handleClick}
        className="max-w-[80vw] max-h-[80vh] object-contain"
      />
    );
  }

  return (
    <img
      src={mediaUrl}
      alt={alt}
      onClick={handleClick}
      className="max-w-[80vw] max-h-[80vh] object-contain"
    />
  );
}
