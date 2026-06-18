import { z } from "zod";

export const createEmailSchema = (t: (key: string) => string) =>
  z
    .string()
    .min(1, { message: t("emailRequired") })
    .email({ message: t("invalidEmail") });

export const createLoginPasswordSchema = (t: (key: string) => string) =>
  z.string().min(1, { message: t("passwordRequired") });

export const createStrongPasswordSchema = (t: (key: string) => string) =>
  z
    .string()
    .min(8, { message: t("passwordMin") })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
      message: t("passwordRegex"),
    });

export const createConfirmPasswordSchema = (t: (key: string) => string) =>
  z.string().min(1, { message: t("confirmPasswordRequired") });

export const createFirstNameSchema = (t: (key: string) => string) =>
  z
    .string()
    .trim()
    .min(1, { message: t("firstNameRequired") });

export const createLastNameSchema = (t: (key: string) => string) =>
  z
    .string()
    .trim()
    .min(1, { message: t("lastNameRequired") });

export const createOptionalPhoneSchema = (t: (key: string) => string) =>
  z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Phone is optional
        const digitsOnly = val.replace(/[\s-]/g, "");
        return /^(\+48)?[0-9]{9}$/.test(digitsOnly);
      },
      { message: t("phoneInvalid") },
    );

// Phone validation (required - Polish format)
export const createRequiredPhoneSchema = (t: (key: string) => string) =>
  z
    .string()
    .min(1, { message: t("phoneRequired") })
    .refine(
      (val) => {
        if (!val) return false;
        const digitsOnly = val.replace(/[\s-]/g, "");
        return /^(\+48)?[0-9]{9}$/.test(digitsOnly);
      },
      { message: t("phoneInvalid") },
    );

export const passwordMatchRefiner = (t: (key: string) => string) => ({
  refine: (data: { password: string; confirmPassword: string }) =>
    data.password === data.confirmPassword,
  message: t("passwordMatch"),
  path: ["confirmPassword"] as const,
});
