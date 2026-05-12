'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { InstructorProfileFormData } from '@/lib/validations/schemas/instructor-profile';
import { useTranslations } from 'next-intl';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface ContactSettingsSectionProps {
  form: UseFormReturn<InstructorProfileFormData>;
  userPhone?: string | null;
  userEmail: string;
}

export function ContactSettingsSection({ 
  form, 
  userPhone,
  userEmail 
}: ContactSettingsSectionProps) {
  const t = useTranslations('Dashboard.profileForm');

  return (
    <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
          <MessageCircle className="size-5 text-orange-500" />
          {t('contactSettings.title')}
        </h3>
        <p className="text-xs text-slate-400">
          {t('contactSettings.description')}
        </p>
      </div>

      {/* Show Phone Toggle */}
      {userPhone ? (
        <label className="flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700 bg-slate-900/50">
          <Controller
            name="showPhone"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1 w-4 h-4"
              />
            )}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-orange-500" />
              <span className={`text-sm font-medium select-none ${
                form.watch('showPhone') 
                  ? 'bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent' 
                  : 'text-slate-200'
              }`}>
                {t('contactSettings.showPhone')}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {userPhone}
            </p>
            <p className="text-xs text-slate-400">
              {t('contactSettings.showPhoneHint')}
            </p>
          </div>
        </label>
      ) : (
        <div className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-900/30">
          <div className="flex items-start gap-3">
            <Phone className="size-4 text-slate-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-400">
                {t('contactSettings.noPhone')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show Email Toggle */}
      <label className="flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700 bg-slate-900/50">
        <Controller
          name="showEmail"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1 w-4 h-4"
            />
          )}
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-orange-500" />
            <span className={`text-sm font-medium select-none ${
              form.watch('showEmail') 
                ? 'bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent' 
                : 'text-slate-200'
            }`}>
              {t('contactSettings.showEmail')}
            </span>
          </div>
          <p className="text-sm text-slate-300 break-all">
            {userEmail}
          </p>
          <p className="text-xs text-slate-400">
            {t('contactSettings.showEmailHint')}
          </p>
        </div>
      </label>

      {/* Contact Message */}
      <div className="space-y-2">
        <Label htmlFor="contactMessage" className="text-slate-200 text-sm font-medium">
          {t('contactSettings.messageLabel')}
          <span className="text-slate-400 font-normal ml-2 text-xs">{t('optional')}</span>
        </Label>
        <Textarea
          {...form.register('contactMessage')}
          id="contactMessage"
          placeholder={t('contactSettings.messagePlaceholder')}
          rows={3}
          className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 resize-none"
        />
        <p className="text-xs text-slate-400">
          {t('contactSettings.messageHint')}
        </p>
        {form.formState.errors.contactMessage && (
          <p className="text-red-400 text-sm">{form.formState.errors.contactMessage.message}</p>
        )}
      </div>
    </div>
  );
}
