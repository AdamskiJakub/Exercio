import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BookingCalendar } from '@/components/booking/BookingCalendar';

interface BookingPageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

async function getInstructorProfile(username: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/instructor-profiles/${username}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch instructor profile:', error);
    return null;
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { username } = await params;
  const profile = await getInstructorProfile(username);
  const t = await getTranslations('Booking');

  if (!profile) {
    notFound();
  }

  if (!profile.isBookingEnabled) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {t('bookingNotEnabled')}
            </h1>
            <p className="text-slate-400">
              {t('bookingNotEnabledDescription')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fullName = profile.user?.firstName && profile.user?.lastName
    ? `${profile.user.firstName} ${profile.user.lastName}`
    : profile.user?.username || 'Instructor';
  
  const firstName = profile.user?.firstName || profile.user?.username || 'Instruktor';

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
            <span className="text-white">{t('bookSessionWith')} </span>
            <span className="bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="text-slate-400 text-center">
            {t('selectDateAndTime')}
          </p>
        </div>

        {/* Session Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-2">{t('sessionDuration')}</p>
            <p className="text-2xl font-bold text-orange-500">
              {profile.sessionDuration || 60} min
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-2">{t('sessionPrice')}</p>
            <p className="text-2xl font-bold text-orange-500">
              {profile.sessionPrice || profile.hourlyRate || 0} zł
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-2">{t('minNotice')}</p>
            <p className="text-2xl font-bold text-orange-500">
              {profile.minNoticeHours ? `${Math.floor(profile.minNoticeHours / 24)} ${t('days')}` : t('sameDay')}
            </p>
          </div>
        </div>

        {/* Booking Calendar */}
        <BookingCalendar 
          instructorId={profile.id}
          instructorProfile={profile}
        />
      </div>
    </div>
  );
}
