'use client';

import { useState } from 'react';
import { Mail, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { createGuestBookingSchema } from '@/lib/validations/schemas/guest-booking';

interface GuestFormData {
  name: string;
  email: string;
  phone: string;
}

interface GuestBookingFormProps {
  onDataChange: (data: GuestFormData, isValid: boolean) => void;
}

export function GuestBookingForm({ onDataChange }: GuestBookingFormProps) {
  const t = useTranslations('Booking.guestForm');
  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof GuestFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof GuestFormData, boolean>>>({});

  const schema = createGuestBookingSchema(t);

  const validateField = (name: keyof GuestFormData, value: string) => {
    try {
      schema.shape[name].parse(value);
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      return true;
    } catch (error: any) {
      // COPILOT FIX: Zod v4 uses error.issues, not error.errors
      const errorMessage = error instanceof z.ZodError 
        ? error.issues?.[0]?.message 
        : undefined;
      setErrors((prev) => ({ ...prev, [name]: errorMessage || t(`${name}Required`) }));
      return false;
    }
  };

  const handleChange = (name: keyof GuestFormData, value: string) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Validate if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
    
    // Check overall validity
    const result = schema.safeParse(newData);
    onDataChange(newData, result.success);
  };

  const handleBlur = (name: keyof GuestFormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  return (
    <div className="space-y-4 pt-2 border-t border-slate-700">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <User className="size-5 text-orange-500" />
        {t('title')}
      </h3>
      <p className="text-sm text-slate-400">
        {t('subtitle')}
      </p>

      <div className="space-y-3">
        {/* Name Field */}
        <div>
          <label htmlFor="guest-name" className="block text-sm font-medium text-slate-300 mb-1.5">
            {t('name')} *
          </label>
          <input
            id="guest-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder={t('namePlaceholder')}
            className={`w-full px-4 py-2.5 bg-slate-800 border ${
              touched.name && errors.name ? 'border-red-500' : 'border-slate-600'
            } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors`}
          />
          {touched.name && errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="guest-email" className="block text-sm font-medium text-slate-300 mb-1.5">
            <Mail className="size-4 inline mr-1" />
            {t('email')} *
          </label>
          <input
            id="guest-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder={t('emailPlaceholder')}
            className={`w-full px-4 py-2.5 bg-slate-800 border ${
              touched.email && errors.email ? 'border-red-500' : 'border-slate-600'
            } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors`}
          />
          {touched.email && errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="guest-phone" className="block text-sm font-medium text-slate-300 mb-1.5">
            <Phone className="size-4 inline mr-1" />
            {t('phone')} *
          </label>
          <input
            id="guest-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder={t('phonePlaceholder')}
            className={`w-full px-4 py-2.5 bg-slate-800 border ${
              touched.phone && errors.phone ? 'border-red-500' : 'border-slate-600'
            } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors`}
          />
          {touched.phone && errors.phone && (
            <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}
