'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface LightboxControlsProps {
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  total?: number;
  showNavigation?: boolean;
}

export function LightboxControls({
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  total,
  showNavigation = true,
}: LightboxControlsProps) {
  return (
    <>
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <X className="size-6" />
      </Button>

      {/* Counter */}
      {showNavigation && currentIndex !== undefined && total !== undefined && total > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white text-sm font-medium">
          {currentIndex + 1} / {total}
        </div>
      )}

      {/* Navigation buttons */}
      {showNavigation && total && total > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="size-8" />
          </Button>
        </>
      )}
    </>
  );
}
