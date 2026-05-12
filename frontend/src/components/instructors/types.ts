import type { InstructorListing } from '@/types';
import type { InstructorFilters } from '@/types/filters';

export interface InstructorCardProps {
  instructor: InstructorListing;
}

export interface InstructorSearchBarProps {
  city: string;
  specialization: string;
  search: string;
  onCityChange: (city: string) => void;
  onSpecializationChange: (specialization: string) => void;
  onSearchChange: (search: string) => void;
}

export interface FiltersSidebarProps {
  filters: InstructorFilters;
  updateFilter: <K extends keyof InstructorFilters>(
    key: K,
    value: InstructorFilters[K]
  ) => void;
  toggleTag: (tagId: string) => void;
  toggleGoal: (goalId: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export interface ResultsSectionProps {
  instructors: InstructorListing[];
  filters: InstructorFilters;
  updateFilter: <K extends keyof InstructorFilters>(
    key: K,
    value: InstructorFilters[K]
  ) => void;
}

// Base props shared by both variants
interface BaseMediaUploadProps {
  isUploading: boolean;
  label: string;
  hint?: string;
  acceptVideo?: boolean;
}

// Avatar variant - single file upload
interface AvatarMediaUploadProps extends BaseMediaUploadProps {
  variant: 'avatar';
  currentMediaUrl?: string | null;
  onMediaChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}

// Gallery variant - multiple file upload
interface GalleryMediaUploadProps extends BaseMediaUploadProps {
  variant: 'gallery';
  currentMediaUrls?: string[];
  maxFiles?: number;
  onMediaChange: (urls: string[]) => void;
  onUpload: (files: File[]) => Promise<string[]>;
}

// Discriminated union type
export type MediaUploadProps = AvatarMediaUploadProps | GalleryMediaUploadProps;
