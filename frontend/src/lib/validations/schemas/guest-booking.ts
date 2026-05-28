import { z } from 'zod';

/**
 * Validation schema for guest booking form
 */
export const createGuestBookingSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('nameRequired') }),
    email: z
      .string()
      .trim()
      .min(1, { message: t('emailRequired') })
      .email({ message: t('emailInvalid') }),
    phone: z
      .string()
      .trim()
      .min(1, { message: t('phoneRequired') })
      .refine(
        (val) => {
          const digitsOnly = val.replace(/[\s-]/g, '');
          return /^(\+48)?[0-9]{9}$/.test(digitsOnly);
        },
        { message: t('phoneInvalid') }
      ),
  });

export type GuestBookingFormData = z.infer<ReturnType<typeof createGuestBookingSchema>>;
