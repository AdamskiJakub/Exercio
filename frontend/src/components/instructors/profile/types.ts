import type { InstructorProfile } from '@/types';

export interface PublicInstructorProfileProps {
  profile: InstructorProfile;
  isPreview?: boolean;
  source?: string | null;
  isOwnProfile?: boolean;
}

export interface ProfileFullViewProps {
  profile: InstructorProfile;
}

export interface ContactSectionProps {
  profile: InstructorProfile;
}

export const NAV_SOURCE = {
  DASHBOARD: 'dashboard',
  LISTING: 'listing',
} as const;

export type NavSource = typeof NAV_SOURCE[keyof typeof NAV_SOURCE];
