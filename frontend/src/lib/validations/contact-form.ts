import { z } from "zod";

/**
 * Validation schema for the contact form
 * Note: The `t` function is expected to be already namespaced to "Contact",
 * so keys like "form.nameRequired" resolve to Contact.form.nameRequired.
 *
 * The `category` field is set programmatically via the card selection,
 * so it only needs to be a non-empty string when provided.
 */
export const createContactFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t("form.nameRequired") })
      .regex(/^[\p{L}\s\-']+$/u, { message: t("form.nameInvalid") }),
    email: z
      .string()
      .trim()
      .min(1, { message: t("form.emailRequired") })
      .email({ message: t("form.emailInvalid") }),
    category: z
      .string()
      .trim()
      .min(1, { message: t("form.categoryRequired") }),
    message: z
      .string()
      .trim()
      .min(10, { message: t("form.messageMin") })
      .max(2000, { message: t("form.messageMax") }),
  });

export type ContactFormData = z.infer<
  ReturnType<typeof createContactFormSchema>
>;
