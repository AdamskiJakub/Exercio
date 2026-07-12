"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LegalCheckbox } from "@/components/ui/legal-checkbox";
import {
  createContactFormSchema,
  type ContactFormData,
} from "@/lib/validations/contact-form";
import { fadeInUp } from "@/lib/animations";
import { apiClient } from "@/lib/api";

interface ContactFormProps {
  preselectedCategory?: string;
}

export function ContactForm({ preselectedCategory }: ContactFormProps) {
  const t = useTranslations("Contact");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(createContactFormSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      category: preselectedCategory || "",
      message: "",
      agreeToTerms: false,
    },
  });

  // Sync category when preselectedCategory changes (card selection)
  useEffect(() => {
    if (preselectedCategory) {
      setValue("category", preselectedCategory);
    }
  }, [preselectedCategory, setValue]);

  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);
    try {
      const { agreeToTerms: _, ...payload } = data;
      await apiClient.post("/contact", payload);
      setIsSubmitted(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError(t("form.errorGeneric"));
      }
    }
  };

  if (isSubmitted) {
    return (
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full max-w-xl mx-auto px-4 md:px-6"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-8 md:p-10 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-orange-500/10">
              <CheckCircle2 className="size-8 text-orange-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {t("form.successTitle")}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {t("form.successDescription")}
          </p>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {preselectedCategory ? (
        <motion.section
          key={preselectedCategory}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit="hidden"
          viewport={{ once: true }}
          className="w-full max-w-xl mx-auto px-4 md:px-6"
        >
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Hidden category field — set programmatically via card selection */}
              <input type="hidden" {...register("category")} />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("form.name")}</Label>
                <Input
                  id="name"
                  placeholder={t("form.namePlaceholder")}
                  {...register("name")}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="text-xs text-red-400"
                    role="alert"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("form.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("form.emailPlaceholder")}
                  {...register("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-xs text-red-400"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">{t("form.message")}</Label>
                <Textarea
                  id="message"
                  placeholder={t("form.messagePlaceholder")}
                  className="min-h-32 resize-y"
                  {...register("message")}
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                />
                {errors.message && (
                  <p
                    id="message-error"
                    className="text-xs text-red-400"
                    role="alert"
                  >
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Error message */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-400">{submitError}</p>
                </div>
              )}

              {/* Legal checkbox */}
              <LegalCheckbox
                checked={!!agreeToTerms}
                onChange={(checked) =>
                  setValue("agreeToTerms", checked, { shouldValidate: true })
                }
                error={errors.agreeToTerms?.message as string | undefined}
              />

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="xl"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("form.sending")}
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    {t("form.send")}
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
