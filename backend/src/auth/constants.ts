// backend/src/auth/constants.ts
import type { Language } from '../email/email.types';

export { Language }; // re-export dla wygody

export const VERIFICATION_CODE_EXPIRY_MS = 10 * 60 * 1000;
export const BCRYPT_SALT_ROUNDS = 10;
