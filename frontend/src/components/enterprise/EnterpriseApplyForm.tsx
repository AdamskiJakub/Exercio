"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useEnterpriseApply } from "@/hooks/useEnterpriseApply";
import type { CreateEnterpriseLeadDto } from "@/types/enterprise";

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
  });

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      <Card className="bg-slate-900/50 border-slate-800 p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t("success.title")}
        </h2>
        <p className="text-slate-400 max-w-md mx-auto">
          {t("success.description")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-white">
            {t("companyName")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-white"
            placeholder={t("placeholders.companyName")}
          />
          {errors.companyName && (
            <p className="text-red-400 text-sm">{errors.companyName}</p>
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
            className="bg-slate-800/50 border-slate-700 text-white"
            placeholder={t("placeholders.email")}
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}
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
              className="bg-slate-800/50 border-slate-700 text-white"
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
              className="bg-slate-800/50 border-slate-700 text-white"
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
            type="url"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-white"
            placeholder={t("placeholders.website")}
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
            className="bg-slate-800/50 border-slate-700 text-white min-h-[120px]"
            placeholder={t("placeholders.message")}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 text-sm">{t("error.generic")}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 text-lg"
        >
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Card>
  );
}
