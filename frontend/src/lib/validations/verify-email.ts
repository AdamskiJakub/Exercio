import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
