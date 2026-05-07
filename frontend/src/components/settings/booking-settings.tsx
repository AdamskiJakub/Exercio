'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Clock, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { SESSION_DURATION_OPTIONS, MIN_NOTICE_HOURS_OPTIONS } from '@/constants/availability';
import { BookingSettingsProps } from '@/types/booking-settings';

export function BookingSettings({
  profileId,
  initialSettings,
}: BookingSettingsProps) {
  const t = useTranslations('Dashboard.settings.bookings');

  const [settings, setSettings] = useState({
    isBookingEnabled: initialSettings?.isBookingEnabled ?? false,
    sessionDuration: initialSettings?.sessionDuration ?? 60,
    sessionPrice: initialSettings?.sessionPrice ?? null,
    minNoticeHours: initialSettings?.minNoticeHours ?? 48,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch(
        `/instructor-profiles/${profileId}`,
        settings
      );

      toast.success(t('saveSuccess'));
    } catch (error: any) {
      toast.error(t('saveError'), {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-500/10 rounded-lg">
          <Calendar className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('title')}
          </h2>
          <p className="text-slate-400">{t('description')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable Bookings Toggle */}
        <label 
          htmlFor="bookings-enabled"
          className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="space-y-1 flex-1">
            <span className="text-white font-semibold text-base block">
              {t('enableBookings')}
            </span>
            <p className="text-sm text-slate-400">
              {t('enableBookingsDescription')}
            </p>
          </div>
          <Checkbox
            id="bookings-enabled"
            checked={settings.isBookingEnabled}
            onCheckedChange={(checked: boolean) =>
              setSettings({ ...settings, isBookingEnabled: checked })
            }
            className="h-5 w-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 cursor-pointer"
          />
        </label>

        {/* Session Duration */}
        <div className="space-y-3">
          <Label htmlFor="sessionDuration" className="text-white font-semibold text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            {t('sessionDuration')}
          </Label>
          <Select
            value={settings.sessionDuration.toString()}
            onValueChange={(value) =>
              setSettings({ ...settings, sessionDuration: parseInt(value) })
            }
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-900 hover:border-slate-600 transition-colors h-11 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              {SESSION_DURATION_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value.toString()}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-400 leading-relaxed">{t('sessionDurationHint')}</p>
        </div>

        {/* Session Price */}
        <div className="space-y-3">
          <Label htmlFor="sessionPrice" className="text-white font-semibold text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            {t('sessionPrice')}
          </Label>
          <div className="relative">
            <Input
              id="sessionPrice"
              type="number"
              min="0"
              step="10"
              placeholder="150"
              value={settings.sessionPrice ?? ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="bg-slate-900/50 border-slate-700 text-white pr-16 h-11 text-base hover:bg-slate-900 hover:border-slate-600 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
              PLN
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{t('sessionPriceHint')}</p>
        </div>

        {/* Minimum Notice Hours */}
        <div className="space-y-3">
          <Label htmlFor="minNoticeHours" className="text-white font-semibold text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            {t('minNoticeHours')}
          </Label>
          <Select
            value={settings.minNoticeHours.toString()}
            onValueChange={(value) =>
              setSettings({ ...settings, minNoticeHours: parseInt(value) })
            }
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-900 hover:border-slate-600 transition-colors h-11 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              {MIN_NOTICE_HOURS_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value.toString()}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                >
                  {option.key === 'noMinimum' ? t('noMinimum') : option.key === 'week' ? t('week') : t('hours', { count: option.count })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-400 leading-relaxed">{t('minNoticeHoursHint')}</p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 text-white h-11 px-8 py-2.5 text-base font-semibold"
        >
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>
    </motion.div>
  );
}
