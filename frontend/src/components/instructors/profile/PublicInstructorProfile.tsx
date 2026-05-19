'use client';

import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';
import { ProfileFullView } from './ProfileFullView';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { PublicInstructorProfileProps, NAV_SOURCE } from './types';

export function PublicInstructorProfile({ 
  profile, 
  isPreview = false,
  source,
  isOwnProfile = false
}: PublicInstructorProfileProps) {
  const t = useTranslations('InstructorProfile');
  
  const getBackHref = () => {
    if (isOwnProfile && source === NAV_SOURCE.DASHBOARD) {
      return '/dashboard';
    }
    return '/instructors';
  };

  const getBackText = () => {
    if (isOwnProfile && source === NAV_SOURCE.DASHBOARD) {
      return t('backToDashboard');
    }
    return t('backToListing');
  };

  const shouldShowBookingButton = 
    profile.isBookingEnabled && 
    profile.user?.username &&
    (!isOwnProfile || source === NAV_SOURCE.DASHBOARD);

  const handleBookingClick = () => {
    if (!profile.user?.username) {
      console.error('Cannot navigate to booking: username is missing');
      return;
    }
    // TODO: Add /instructors/[username]/book route to src/i18n/routing.ts
    // For now, use direct navigation to avoid TypeScript error
    const locale = window.location.pathname.split('/')[1];
    window.location.href = `/${locale}/instructors/${profile.user.username}/book`;
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
          actionButton={
            shouldShowBookingButton
              ? {
                  text: t('contact.bookSession'),
                  icon: <Calendar className="size-5" />,
                  variant: 'primary',
                  onClick: handleBookingClick,
                }
              : undefined
          }
        />
      )}
    </>
  );
}
