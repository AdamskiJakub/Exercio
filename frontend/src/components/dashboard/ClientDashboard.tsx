'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { motion } from 'framer-motion';
import { titleVariants } from '@/lib/animations';
import { 
  Calendar, 
  Heart, 
  MessageSquare, 
  Star, 
  Search,
  FileText,
  TrendingUp,
  Settings
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { DashboardCard } from './DashboardCard';
import { EmptyStateCard } from './EmptyStateCard';

export function ClientDashboard() {
  const t = useTranslations('Dashboard.client');
  const { user } = useAuthStore();

  // Placeholder stats - will be real data when we add bookings
  const stats = {
    upcomingBookings: 0,
    completedSessions: 0,
    favoriteTrainers: 0,
  };

  return (
    <div className="space-y-4">
      {/* Welcome Header - Clean Design with Animation */}
      <div className="text-center space-y-6 py-8">
        <div className="space-y-3">
          <motion.h1 
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold text-gradient-trainly"
          >
            {t('welcomeBack')}{user?.firstName ? `, ${user.firstName}` : ''}!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            {t('findAndBook')}
          </motion.p>
        </div>
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Settings className="w-5 h-5" />
            {t('accountSettings')}
          </Link>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Calendar}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
          title={t('upcomingBookings')}
          value={stats.upcomingBookings}
          subtitle={t('nextWeek')}
          delay={0}
        />
        <StatsCard
          icon={TrendingUp}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
          title={t('completedSessions')}
          value={stats.completedSessions}
          subtitle={t('allTime')}
          delay={1}
        />
        <StatsCard
          icon={Heart}
          iconColor="text-pink-500"
          iconBgColor="bg-pink-500/10"
          title={t('favoriteTrainers')}
          value={stats.favoriteTrainers}
          subtitle={t('saved')}
          delay={2}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming Sessions */}
        <DashboardCard
          icon={Calendar}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
          title={t('upcomingSessions')}
          delay={3}
        >
          <EmptyStateCard
            icon={Calendar}
            title={t('noUpcomingSessions')}
            description={t('sessionsComingSoon')}
          />
        </DashboardCard>

        {/* Reviews to Give */}
        <DashboardCard
          icon={Star}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-500/10"
          title={t('reviewsToGive')}
          delay={4}
        >
          <EmptyStateCard
            icon={Star}
            title={t('noSessionsToReview')}
            description={t('reviewsComingSoon')}
          />
        </DashboardCard>

        {/* Messages */}
        <DashboardCard
          icon={MessageSquare}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
          title={t('messages')}
          delay={5}
        >
          <EmptyStateCard
            icon={MessageSquare}
            title={t('noMessages')}
            description={t('messagesComingSoon')}
          />
        </DashboardCard>

        {/* Find Trainers CTA - Moved to bottom right */}
        <DashboardCard
          icon={Search}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-500/10"
          title={t('findTrainers')}
          delay={6}
        >
          <>
            <p className="text-slate-400 mb-auto">
              {t('browseDescription')}
            </p>
            <Link
              href="/instructors"
              className="inline-block px-6 py-3 text-center bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all mt-4"
            >
              {t('browseTrainers')}
            </Link>
          </>
        </DashboardCard>
      </div>

      {/* History */}
      <DashboardCard
        icon={FileText}
        iconColor="text-slate-400"
        title={t('bookingHistory')}
        delay={7}
      >
        <EmptyStateCard
          icon={FileText}
          title={t('noHistory')}
          description={t('historyDescription')}
        />
      </DashboardCard>
    </div>
  );
}
