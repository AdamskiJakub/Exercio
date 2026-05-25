'use client';

import { useMyInstructorProfile } from '@/hooks/useMyInstructorProfile';
import { useMyBookings } from '@/hooks/useMyBookings';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { titleVariants } from '@/lib/animations';
import { NAV_SOURCE } from '@/components/instructors/profile/types';
import { 
  Star, 
  Users, 
  Calendar, 
  TrendingUp, 
  Edit, 
  Eye,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Bell
} from 'lucide-react';
import { getMediaUrl } from '@/lib/utils/media';
import { StatsCard } from './StatsCard';
import { DashboardCard } from './DashboardCard';
import { EmptyStateCard } from './EmptyStateCard';
import { PendingBookingsCount } from '@/components/bookings/PendingBookingsCount';
import { BookingsList } from '@/components/bookings/BookingsList';

export function InstructorDashboard() {
  const t = useTranslations('Dashboard.instructor');
  const { data: profile, isLoading } = useMyInstructorProfile();
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings('instructor');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Filter upcoming bookings (pending or confirmed, in the future)
  const now = new Date();
  const upcomingBookings = bookings?.filter(booking => 
    (booking.status === 'PENDING' || booking.status === 'CONFIRMED') &&
    new Date(booking.startTime) > now
  ) || [];

  const stats = {
    averageRating: profile?.averageRating || 0,
    totalReviews: profile?.reviewCount || 0,
    totalSessions: 0, // TODO: Get from bookings
    activeClients: 0, // TODO: Get from bookings
  };

  return (
    <div className="space-y-4">
      {/* Welcome Header - Clean Design with Animation */}
      <div className="text-center space-y-6 py-8">
        {profile?.photoUrl && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={getMediaUrl(profile.photoUrl)}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-2xl"
            />
          </motion.div>
        )}
        <div className="space-y-3">
          <motion.h1 
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold text-gradient-trainly"
          >
            {t('welcomeBack')}, {profile?.user?.firstName || profile?.user?.username || 'Instructor'}!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            {t('manageProfile')}
          </motion.p>
        </div>
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link
            href="/dashboard/profile/edit"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Edit className="w-5 h-5" />
            {t('editProfile')}
          </Link>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Settings className="w-5 h-5" />
            {t('accountSettings')}
          </Link>
          <Link
            href="/dashboard/calendar"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Clock className="w-5 h-5" />
            {t('calendar')}
          </Link>
        </motion.div>
      </div>

      {/* Profile Status */}
      {profile && (
        <DashboardCard
          title={t('profileStatus')}
          delay={0}
          hoverable={true}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {profile.isDraft ? (
                <>
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-500 font-medium">{t('draft')}</span>
                  <span className="text-slate-400 text-sm ml-2">— {t('draftDescription')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-500 font-medium">{t('published')}</span>
                  <span className="text-slate-400 text-sm ml-2">— {t('publishedDescription')}</span>
                </>
              )}
            </div>
            <Link
              href={`/instructors/${profile?.user?.username || ''}?from=${NAV_SOURCE.DASHBOARD}` as any}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <Eye className="w-4 h-4" />
              {t('viewPublicProfile')}
            </Link>
          </div>
        </DashboardCard>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Star}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-500/10"
          title={t('averageRating')}
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          subtitle={`${stats.totalReviews} ${t('reviews')}`}
          delay={1}
        />
        <StatsCard
          icon={Calendar}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
          title={t('totalSessions')}
          value={stats.totalSessions}
          subtitle={t('allTime')}
          delay={2}
        />
        <StatsCard
          icon={Users}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
          title={t('activeClients')}
          value={stats.activeClients}
          subtitle={t('thisMonth')}
          delay={3}
        />
        <StatsCard
          icon={TrendingUp}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
          title={t('profileViews')}
          value="—"
          subtitle={t('thisMonth')}
          delay={4}
        />
      </div>

      {/* Upcoming Bookings & Reviews - Swapped Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard
          icon={Calendar}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-500/10"
          title={
            <div className="flex items-center justify-between w-full">
              <span>{t('upcomingBookings')}</span>
              <PendingBookingsCount />
            </div>
          }
          delay={5}
        >
          {bookingsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : upcomingBookings.length > 0 ? (
            <BookingsList bookings={upcomingBookings} role="instructor" />
          ) : (
            <EmptyStateCard
              icon={FileText}
              title={t('noUpcomingBookings')}
              description={t('bookingsComingSoon')}
            />
          )}
        </DashboardCard>

        <DashboardCard
          icon={Star}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-500/10"
          title={t('recentReviews')}
          delay={6}
        >
          <EmptyStateCard
            icon={Star}
            title={t('noReviewsYet')}
            description={t('reviewsComingSoon')}
          />
        </DashboardCard>
      </div>
    </div>
  );
}
