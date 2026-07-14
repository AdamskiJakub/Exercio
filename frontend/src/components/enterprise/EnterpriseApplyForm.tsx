"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnterpriseApply } from "@/hooks/useEnterpriseApply";
import { LegalCheckbox } from "@/components/ui/legal-checkbox";
import type { CreateEnterpriseLeadDto } from "@/types/enterprise";

const BUSINESS_TYPES = [
  "danceSchool",
  "gym",
  "yogaStudio",
  "swimmingSchool",
  "sportsClub",
  "martialArts",
  "academy",
  "other",
] as const;

const INSTRUCTOR_COUNTS = ["1-5", "6-20", "20+"] as const;

export function EnterpriseApplyForm() {
  const t = useTranslations("EnterpriseApply");
  const { mutate, isPending, isSuccess, error } = useEnterpriseApply();

  const [formData, setFormData] = useState<CreateEnterpriseLeadDto>({
    companyName: "",
    email: "",
    city: "",
    phone: "",
    website: "",
    message: "",
    businessType: "",
    instructorCount: "",
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeError, setAgreeError] = useState<string | undefined>();

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateEnterpriseLeadDto, string>>
  >({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = t("validation.required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("validation.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("validation.invalidEmail");
    }

    if (
      formData.phone &&
      !/^[\d\s\+\-\(\)]{7,20}$/.test(formData.phone.trim())
    ) {
      newErrors.phone = t("validation.invalidPhone");
    }

    setErrors(newErrors);

    if (!agreeToTerms) {
      setAgreeError(t("validation.required"));
    } else {
      setAgreeError(undefined);
    }

    return Object.keys(newErrors).length === 0 && agreeToTerms;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate(formData);
  };

  const handleChange = (
    field: keyof CreateEnterpriseLeadDto,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <Card
        className="bg-slate-900/50 border-emerald-500/20 p-4 text-center"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          {t("success.title")}
        </h2>
        <p className="text-lg text-slate-200 max-w-lg mx-auto leading-relaxed">
          {t("success.description")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-8">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-white">
            {t("companyName")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="bg-slate-800/50 border-emerald-900/50 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
            placeholder={t("placeholders.companyName")}
            aria-invalid={!!errors.companyName}
            aria-describedby={
              errors.companyName ? "companyName-error" : undefined
            }
          />
          {errors.companyName && (
            <p
              id="companyName-error"
              className="text-red-400 text-sm"
              role="alert"
            >
              {errors.companyName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            {t("email")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="bg-slate-800/50 border-emerald-900/50 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
            placeholder={t("placeholders.email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-400 text-sm" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-white">
              {t("businessType")}
            </Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => handleChange("businessType", value)}
            >
              <SelectTrigger
                id="businessType"
                className="w-full bg-slate-800/50 border-emerald-900/50 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 cursor-pointer"
              >
                <SelectValue placeholder={t("placeholders.businessType")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                  >
                    {t(`businessTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructorCount" className="text-white">
              {t("instructorCount")}
            </Label>
            <Select
              value={formData.instructorCount}
              onValueChange={(value) => handleChange("instructorCount", value)}
            >
              <SelectTrigger
                id="instructorCount"
                className="w-full bg-slate-800/50 border-emerald-900/50 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 cursor-pointer"
              >
                <SelectValue placeholder={t("placeholders.instructorCount")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {INSTRUCTOR_COUNTS.map((count) => (
                  <SelectItem
                    key={count}
                    value={count}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                  >
                    {count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-white">
              {t("city")}
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="bg-slate-800/50 border-emerald-900/50 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
              placeholder={t("placeholders.city")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              {t("phone")}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="bg-slate-800/50 border-emerald-900/50 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
              placeholder={t("placeholders.phone")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-white">
            {t("website")}
          </Label>
          <Input
            id="website"
            type="text"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            className="bg-slate-800/50 border-emerald-900/50 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
            placeholder={t("placeholders.website")}
            autoComplete="url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-white">
            {t("message")}
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            className="bg-slate-800/50 border-emerald-900/50 text-white min-h-30 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
            placeholder={t("placeholders.message")}
          />
        </div>

        {/* Legal Checkbox */}
        <LegalCheckbox
          checked={agreeToTerms}
          onChange={(checked) => {
            setAgreeToTerms(checked);
            if (checked) setAgreeError(undefined);
          }}
          error={agreeError}
        />

        {error && (
          <div
            className="bg-red-900/30 border border-red-800 rounded-lg p-4"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-400 text-sm">
              {(error as any)?.response?.data?.message?.includes(
                "already exists and is being processed",
              )
                ? t("error.emailInUse")
                : t("error.generic")}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 text-lg"
        >
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Card>
  );
}
