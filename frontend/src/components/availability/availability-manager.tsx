'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { WeeklySchedule } from '@/components/availability/weekly-schedule';
import { ExceptionsList } from '@/components/availability/exceptions-list';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';

export function AvailabilityManager() {
  const t = useTranslations('Dashboard.availability');

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
              <p className="text-slate-400 text-base">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white">{t('weeklySchedule')}</h2>
          </div>
          <p className="text-slate-400 mb-6">{t('weeklyScheduleDescription')}</p>
          
          <WeeklySchedule />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white">{t('exceptions')}</h2>
          </div>
          <p className="text-slate-400 mb-6">{t('exceptionsDescription')}</p>
          
          <ExceptionsList />
        </motion.div>
      </div>

      <BottomNavBar 
        backText={t('backToDashboard')}
        backHref="/dashboard"
      />
    </div>
  );
}
