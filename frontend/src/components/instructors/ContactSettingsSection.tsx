"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { InstructorProfileFormData } from "@/lib/validations/schemas/instructor-profile";
import { useTranslations } from "next-intl";
import { Phone, Mail, MessageCircle, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SOCIAL_PLATFORMS } from "@/constants/enterprise";

interface ContactSettingsSectionProps {
  form: UseFormReturn<InstructorProfileFormData>;
  userPhone?: string | null;
  userEmail: string;
}

export function ContactSettingsSection({
  form,
  userPhone,
  userEmail,
}: ContactSettingsSectionProps) {
  const t = useTranslations("Dashboard.profileForm");

  // Filter SOCIAL_PLATFORMS to only include the ones relevant for instructors
  const instructorSocialPlatforms = SOCIAL_PLATFORMS.filter((p) =>
    ["instagramUrl", "facebookUrl", "whatsappUrl"].includes(p.key),
  );

  return (
    <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
          <MessageCircle className="size-5 text-orange-500" />
          {t("contactSettings.title")}
        </h3>
        <p className="text-sm text-slate-400">
          {t("contactSettings.description")}
        </p>
      </div>

      {/* Show Phone Toggle */}
      {userPhone ? (
        <label className="flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700 bg-slate-900/50">
          <Controller
            name="showPhone"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1 w-4 h-4"
              />
            )}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-orange-500" />
              <span
                className={`text-sm font-medium select-none ${
                  form.watch("showPhone")
                    ? "bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                    : "text-slate-200"
                }`}
              >
                {t("contactSettings.showPhone")}
              </span>
            </div>
            <p className="text-sm text-slate-300">{userPhone}</p>
            <p className="text-sm text-slate-400">
              {t("contactSettings.showPhoneHint")}
            </p>
          </div>
        </label>
      ) : (
        <div className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-900/30">
          <div className="flex items-start gap-3">
            <Phone className="size-4 text-slate-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-400">
                {t("contactSettings.noPhone")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show Email Toggle */}
      <label className="flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700 bg-slate-900/50">
        <Controller
          name="showEmail"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1 w-4 h-4"
            />
          )}
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-orange-500" />
            <span
              className={`text-sm font-medium select-none ${
                form.watch("showEmail")
                  ? "bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                  : "text-slate-200"
              }`}
            >
              {t("contactSettings.showEmail")}
            </span>
          </div>
          <p className="text-sm text-slate-300 break-all">{userEmail}</p>
          <p className="text-sm text-slate-400">
            {t("contactSettings.showEmailHint")}
          </p>
        </div>
      </label>

      {/* Contact Message */}
      <div className="space-y-2">
        <Label
          htmlFor="contactMessage"
          className="text-slate-200 text-sm font-medium"
        >
          {t("contactSettings.messageLabel")}
          <span className="text-slate-400 font-normal ml-2 text-sm">
            {t("optional")}
          </span>
        </Label>
        <Textarea
          {...form.register("contactMessage")}
          id="contactMessage"
          placeholder={t("contactSettings.messagePlaceholder")}
          rows={3}
          className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 resize-none focus-visible:border-orange-500 focus-visible:ring-orange-500/50"
        />
        <p className="text-sm text-slate-400">
          {t("contactSettings.messageHint")}
        </p>
        {form.formState.errors.contactMessage && (
          <p className="text-red-400 text-sm">
            {form.formState.errors.contactMessage.message}
          </p>
        )}
      </div>

      {/* Social Media Links */}
      <div className="pt-3 border-t border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Globe className="size-4 text-orange-500" />
          {t("contactSettings.socialMedia")}
        </h4>

        {instructorSocialPlatforms.map((platform) => {
          const platformColors: Record<string, string> = {
            instagramUrl: "text-pink-500",
            facebookUrl: "text-blue-500",
            whatsappUrl: "text-green-500",
          };

          return (
            <div key={platform.key} className="space-y-2 mb-3">
              <Label
                htmlFor={platform.key}
                className="text-slate-300 text-sm flex items-center gap-2"
              >
                <svg
                  className={`size-4 ${platformColors[platform.key] || "text-slate-400"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d={platform.path} />
                </svg>
                {platform.label}
                <span className="text-slate-500 font-normal text-xs">
                  {t("optional")}
                </span>
              </Label>
              <Input
                {...form.register(
                  platform.key as keyof InstructorProfileFormData,
                )}
                id={platform.key}
                type="url"
                placeholder={`https://${platform.label.toLowerCase()}.com/your-profile`}
                className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
