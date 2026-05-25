'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { InstructorProfile } from '@/types';
import { PublicInstructorProfile } from '@/components/instructors/profile/PublicInstructorProfile';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getFullName } from '@/lib/utils/user';

export default function InstructorPublicProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = params?.username as string;
  const source = searchParams.get('from');
  const { user, isAuthenticated } = useAuthStore();
  const t = useTranslations('Booking');
  const tProfile = useTranslations('InstructorProfile');

  const { data: profile, isLoading, error } = useQuery<InstructorProfile>({
    queryKey: ['instructor', username],
    queryFn: async () => {
      const response = await apiClient.get(`/instructor-profiles/${username}`);
      return response.data;
    },
    enabled: !!username,
  });

  useEffect(() => {
    if (profile?.isDraft) {
      router.push('/instructors');
    }
  }, [profile, router]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">{tProfile('instructorNotFound')}</h1>
          <p className="text-slate-400">{tProfile('instructorNotFoundDescription')}</p>
          <button
            onClick={() => router.push('/instructors')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
          >
            {tProfile('backToInstructors')}
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = isAuthenticated && user?.role === 'INSTRUCTOR' && profile.user?.id === user.id;
  const fullName = getFullName(profile.user, 'Instructor');
  const roleLabel = profile.user?.role === 'INSTRUCTOR' ? t('instructorRole') : t('specialistRole');

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      {/* Page Title */}
      <div className="container mx-auto px-4 pt-12 pb-8 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          <span className="bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            {t('profileTitle')} {roleLabel}
          </span>
          {' '}
          <span className="text-white">{fullName}</span>
        </h1>
      </div>

      <div className="container mx-auto px-4 pb-4 max-w-6xl">
        <PublicInstructorProfile 
          profile={profile} 
          isPreview={false} 
          source={source}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
}
