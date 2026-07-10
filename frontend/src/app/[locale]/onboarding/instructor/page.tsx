"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/ui/auth-header";
import { useBecomeInstructor } from "@/hooks/useBecomeInstructor";

export default function OnboardingInstructorPage() {
  const t = useTranslations("auth");
  const [phone, setPhone] = useState("");
  const { isLoading, error, onSubmit } = useBecomeInstructor();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(phone);
  };

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <AuthHeader
          title={t("becomeInstructor")}
          subtitle={t("becomeInstructorDescription")}
          icon={<Dumbbell className="w-10 h-10 text-orange-500" />}
        />

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          <p className="text-slate-300 text-sm text-center">
            {t("becomeInstructorPhoneInfo")}
          </p>

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            noValidate
            aria-label={t("becomeInstructor")}
          >
            {error && (
              <div
                className="rounded-lg bg-red-500/10 border border-red-500/50 p-4"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("phone")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="123456789"
                autoComplete="tel"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600"
            >
              {isLoading ? t("processing") : t("becomeInstructor")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
