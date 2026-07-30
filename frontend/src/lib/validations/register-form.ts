import { z } from "zod";
import {
  createEmailSchema,
  createStrongPasswordSchema,
  createConfirmPasswordSchema,
  createFirstNameSchema,
  createLastNameSchema,
  createOptionalPhoneSchema,
  createRequiredPhoneSchema,
  passwordMatchRefiner,
} from "./schemas/auth-base";

export const createRegisterSchema = (
  t: (key: string) => string,
  intent: "client" | "instructor" = "client",
) => {
  const refiner = passwordMatchRefiner(t);
  const phoneSchema =
    intent === "instructor"
      ? createRequiredPhoneSchema(t)
      : createOptionalPhoneSchema(t);

  return z
    .object({
      email: createEmailSchema(t),
      password: createStrongPasswordSchema(t),
      confirmPassword: createConfirmPasswordSchema(t),
      firstName: createFirstNameSchema(t),
      lastName: createLastNameSchema(t),
      phone: phoneSchema,
      agreeToTerms: z.boolean().refine((val) => val === true, {
        message: t("agreeToTermsRequired"),
      }),
    })
    .refine(refiner.refine, {
      message: refiner.message,
      path: ["confirmPassword"],
    });
};

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;
