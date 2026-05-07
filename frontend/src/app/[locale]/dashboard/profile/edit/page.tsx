'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useMyInstructorProfile } from '@/hooks/useMyInstructorProfile';
import { usePublishInstructorProfile } from '@/hooks/usePublishInstructorProfile';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { InstructorProfileForm } from '@/components/instructors/InstructorProfileForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const t = useTranslations('Dashboard');
  const tProfile = useTranslations('InstructorProfile');
  const router = useRouter();
  const { isChecking, user, isAuthenticated } = useAuthGuard({
    requireAuth: true,
    requireRole: 'INSTRUCTOR',
  });
  const { data: profile, isLoading, error } = useMyInstructorProfile({
    enabled: isAuthenticated && user?.role === 'INSTRUCTOR',
  });
  const { mutate: publishProfile, isPending: isPublishing } = usePublishInstructorProfile({ showToast: false });

  // Show loading while checking auth or loading profile
  if (isChecking || isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-400">{t('errorLoadingProfile')}: {error.message}</div>
      </div>
    );
  }

  const handleBackWithoutSaving = () => {
    if (profile && profile.isDraft) {
      // Use existing publish endpoint to remove draft flag
      publishProfile(profile.id, {
        onSuccess: () => {
          toast.success(tProfile('profileVisibleAgain'));
          router.push('/dashboard');
        },
        onError: (error: any) => {
          toast.error(tProfile('errorPublishing'), {
            description: error.response?.data?.message || error.message,
          });
        },
      });
    } else {
      // Just go back if not draft
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-32">
        <div className="text-center space-y-3 pb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            {t('editProfile')}
          </h1>
          <p className="text-slate-400 text-lg">
            {t('profileSubtitle')}
          </p>
        </div>

        {profile?.isDraft && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-8">
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ {tProfile('draftWarning')}
            </p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {profile && user && <InstructorProfileForm profile={profile} user={user} />}
        </div>
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-slate-700 bg-slate-900/98 backdrop-blur-sm shadow-2xl">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleBackWithoutSaving}
              disabled={isPublishing}
              className="flex-1 sm:flex-none border-2 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-500 font-semibold text-base"
            >
              <ArrowLeft className="size-5 mr-2" />
              {isPublishing ? tProfile('cancelling') : tProfile('cancelWithoutSaving')}
            </Button>
            
            <Button
              type="submit"
              form="instructor-profile-form"
              size="lg"
              className="flex-1 sm:flex-none bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base shadow-lg shadow-orange-500/20"
            >
              <Eye className="size-5 mr-2" />
              {tProfile('saveAndPreview')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
