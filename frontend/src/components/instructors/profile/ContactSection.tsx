'use client';

import { InstructorProfile } from '@/types';
import { useTranslations } from 'next-intl';
import { Phone, Mail, MessageCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactSectionProps {
  profile: InstructorProfile;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const t = useTranslations('InstructorProfile');

  // Don't show if no contact info is enabled
  if (!profile.showPhone && !profile.showEmail && !profile.contactMessage) {
    return null;
  }

  const userPhone = profile.user?.phone;
  const userEmail = profile.user?.email;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="size-5 text-orange-500" />
          {t('contact.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Contact Message */}
        {profile.contactMessage && (
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed italic">
              "{profile.contactMessage}"
            </p>
          </div>
        )}

        {/* Phone */}
        {profile.showPhone && userPhone && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
              <Phone className="size-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">{t('contact.phone')}</p>
              <a 
                href={`tel:${userPhone}`}
                className="text-slate-200 hover:text-orange-500 transition-colors font-medium"
              >
                {userPhone}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {profile.showEmail && userEmail && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
              <Mail className="size-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">{t('contact.email')}</p>
              <a 
                href={`mailto:${userEmail}`}
                className="text-slate-200 hover:text-orange-500 transition-colors font-medium break-all"
              >
                {userEmail}
              </a>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          {profile.showEmail && userEmail && (
            <a
              href={`mailto:${userEmail}`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-lg"
            >
              <Mail className="size-5" />
              {t('contact.sendEmail')}
            </a>
          )}
          
          <button
            className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium shadow-lg"
            onClick={() => {
              // TODO: Open booking modal
            }}
          >
            <Send className="size-5" />
            {t('contact.bookSession')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
