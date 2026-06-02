import { z } from 'zod';
import { createEmailSchema } from './schemas/auth-base';

export const createForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: createEmailSchema(t),
  });

export type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;