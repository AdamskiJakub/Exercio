import { z } from 'zod';
import { createEmailSchema } from './schemas/auth-base';

export const createVerifyEmailSchema = (t: (key: string) => string) =>
  z.object({
    email: createEmailSchema(t),
    code: z.string().regex(/^\d{6}$/, { message: t('codeInvalid') }),
  });

export type VerifyEmailFormData = z.infer<ReturnType<typeof createVerifyEmailSchema>>;