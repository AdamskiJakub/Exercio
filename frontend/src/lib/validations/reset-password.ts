import { z } from 'zod';
import { createConfirmPasswordSchema, createStrongPasswordSchema } from './schemas/auth-base';

export const createResetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      code: z.string().regex(/^\d{6}$/, { message: t('codeInvalid') }),
      newPassword: createStrongPasswordSchema(t),
      confirmPassword: createConfirmPasswordSchema(t),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordMatch'),
      path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<ReturnType<typeof createResetPasswordSchema>>;