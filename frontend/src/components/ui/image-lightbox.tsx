'use client';

import { useEffect, useState, useCallback } from 'react';
import { Portal } from './portal';
import { LightboxControls } from './lightbox-controls';
import { LightboxMedia } from './lightbox-media';
import { useEscapeKey } from '@/lib/hooks';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initialIndex when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Use shared hooks for Escape key
  useEscapeKey(() => {
    if (isOpen) onClose();
  }, isOpen);

  // Handle arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handlePrevious, handleNext]);

  // Early return AFTER all hooks
  if (!isOpen || images.length === 0) return null;

  return (
    <Portal>
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
        className="fixed inset-0 flex items-center justify-center bg-black/95"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      >
        <LightboxControls
          onClose={onClose}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentIndex={currentIndex}
          total={images.length}
        />
        
        <LightboxMedia
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
        />
      </div>
    </Portal>
  );
}
