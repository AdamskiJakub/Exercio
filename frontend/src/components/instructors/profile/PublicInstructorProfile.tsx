'use client';

import { InstructorProfile } from '@/types';
import { useTranslations } from 'next-intl';
import { ProfileFullView } from './ProfileFullView';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';

interface PublicInstructorProfileProps {
  profile: InstructorProfile;
  isPreview?: boolean;
  source?: string | null;
  isOwnProfile?: boolean;
}

export function PublicInstructorProfile({ 
  profile, 
  isPreview = false,
  source,
  isOwnProfile = false
}: PublicInstructorProfileProps) {
  const t = useTranslations('InstructorProfile');

  const getBackHref = () => {
    if (isOwnProfile && source === 'dashboard') {
      return '/dashboard';
    }
    return '/instructors';
  };

  const getBackText = () => {
    if (isOwnProfile && source === 'dashboard') {
      return t('backToDashboard');
    }
    return t('backToListing');
  };

  return (
    <>
      <div className="space-y-6">
        {isPreview && (
          <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
            <p className="text-orange-400 text-sm text-center">
              📝 {t('previewBanner')}
            </p>
          </div>
        )}

        <ProfileFullView profile={profile} />
      </div>

      {!isPreview && (
        <BottomNavBar
          backText={getBackText()}
          backHref={getBackHref()}
        />
      )}
    </>
  );
}
