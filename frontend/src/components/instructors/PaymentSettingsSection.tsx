'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { InstructorProfileFormData } from '@/lib/validations/schemas/instructor-profile';
import { useTranslations } from 'next-intl';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PAYMENT_METHODS, PAYMENT_METHOD_OPTIONS } from '@/constants/payment';

interface PaymentSettingsSectionProps {
  form: UseFormReturn<InstructorProfileFormData>;
}

const PAYMENT_METHOD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  [PAYMENT_METHODS.CASH]: Banknote,
  [PAYMENT_METHODS.CARD]: CreditCard,
  [PAYMENT_METHODS.BLIK]: Smartphone,
  [PAYMENT_METHODS.TRANSFER]: Building2,
};

export function PaymentSettingsSection({ form }: PaymentSettingsSectionProps) {
  const t = useTranslations('Dashboard.profileForm.paymentSettings');
  const tCommon = useTranslations('Common.paymentMethods');

  const paymentMethods = (form.watch('paymentMethods') as string[]) || [];

  const togglePaymentMethod = (method: string) => {
    const current = (form.getValues('paymentMethods') as string[]) || [];
    if (current.includes(method)) {
      form.setValue('paymentMethods', current.filter((m: string) => m !== method));
    } else {
      form.setValue('paymentMethods', [...current, method]);
    }
  };

  return (
    <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
          <CreditCard className="size-5 text-orange-500" />
          {t('title')}
        </h3>
        <p className="text-xs text-slate-400">
          {t('description')}
        </p>
      </div>

      {/* Payment Methods Checkboxes */}
      <div className="space-y-2">
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const Icon = PAYMENT_METHOD_ICONS[option.value];
          const isChecked = paymentMethods.includes(option.value);

          return (
            <label
              key={option.value}
              className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700 bg-slate-900/50"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => togglePaymentMethod(option.value)}
                className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 w-4 h-4"
              />
              <div className="flex items-center gap-2 flex-1">
                <Icon className="size-4 text-orange-500" />
                <span
                  className={`text-sm font-medium select-none ${
                    isChecked
                      ? 'bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'
                      : 'text-slate-200'
                  }`}
                >
                  {tCommon(option.labelKey)}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Additional Payment Info */}
      <div className="space-y-2">
        <Label htmlFor="paymentInfo" className="text-slate-200 text-sm">
          {t('additionalInfo')}
          <span className="text-slate-500 ml-1">({t('optional')})</span>
        </Label>
        <Controller
          name="paymentInfo"
          control={form.control}
          render={({ field }) => (
            <Textarea
              {...field}
              value={(field.value as string) || ''}
              id="paymentInfo"
              placeholder={t('additionalInfoPlaceholder')}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 min-h-20"
              maxLength={500}
            />
          )}
        />
        <p className="text-xs text-slate-400">
          {t('additionalInfoHint')}
        </p>
      </div>
    </div>
  );
}
