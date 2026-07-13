"use client";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { Clock, DollarSign, Bell, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SESSION_DURATION_OPTIONS,
  MIN_NOTICE_HOURS_OPTIONS,
} from "@/constants/availability";
import type { UseFormReturn } from "react-hook-form";
import type { InstructorProfileFormData } from "@/lib/validations/schemas/instructor-profile";

interface BookingSettingsFormProps {
  form: UseFormReturn<InstructorProfileFormData>;
}

export function BookingSettings({ form }: BookingSettingsFormProps) {
  const t = useTranslations("Dashboard.settings.bookings");
  const tProfile = useTranslations("Dashboard.profileForm");
  const { watch, setValue, control, register } = form;

  const isBookingEnabled = watch("isBookingEnabled");

  return (
    <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5 space-y-4">
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
          <DollarSign className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{t("title")}</h3>
          <p className="text-sm text-slate-400">{t("description")}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Enable Bookings Toggle */}
        <label
          htmlFor="bookings-enabled"
          className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
        >
          <div className="space-y-1 flex-1">
            <span className="text-white font-semibold text-sm block">
              {t("enableBookings")}
            </span>
            <p className="text-sm text-slate-400">
              {t("enableBookingsDescription")}
            </p>
          </div>
          <Checkbox
            id="bookings-enabled"
            checked={isBookingEnabled}
            onCheckedChange={(checked: boolean) =>
              setValue("isBookingEnabled", checked)
            }
            className="h-5 w-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 cursor-pointer"
          />
        </label>

        {/* Session Duration */}
        <div className="space-y-2">
          <Label
            htmlFor="sessionDuration"
            className="text-white font-semibold text-sm flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-orange-500" />
            {t("sessionDuration")}
          </Label>
          <Select
            value={String(watch("sessionDuration") ?? 60)}
            onValueChange={(value) =>
              setValue("sessionDuration", parseInt(value))
            }
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-900 hover:border-slate-600 transition-colors h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              {SESSION_DURATION_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("sessionDurationHint")}
          </p>
        </div>

        {/* Session Price */}
        <div className="space-y-2">
          <Label
            htmlFor="sessionPrice"
            className="text-white font-semibold text-sm flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-orange-500" />
            {t("sessionPrice")}
          </Label>
          <div className="relative">
            <Input
              id="sessionPrice"
              type="number"
              min="0"
              step="10"
              placeholder="150"
              value={watch("sessionPrice") ?? ""}
              onChange={(e) =>
                setValue(
                  "sessionPrice",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              className="bg-slate-900/50 border-slate-700 text-white pr-14 h-10 text-sm hover:bg-slate-900 hover:border-slate-600 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
              PLN
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("sessionPriceHint")}
          </p>
        </div>

        {/* Package Deals */}
        <div className="space-y-3 pt-2 ">
          <label className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700">
            <Gift className="w-5 h-5 text-orange-500 shrink-0" />
            <Controller
              name="packageDealsEnabled"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    field.onChange(isChecked);
                    if (!isChecked) {
                      setValue("packageDealsDescription", "");
                    }
                  }}
                  className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
              )}
            />
            <span
              className={`text-base font-medium select-none ${
                watch("packageDealsEnabled")
                  ? "bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                  : "text-slate-200"
              }`}
            >
              {tProfile("packageDealsEnabled")}
            </span>
          </label>

          {/* Package Deals Description */}
          {watch("packageDealsEnabled") && (
            <div className="ml-6 space-y-2">
              <Label
                htmlFor="packageDealsDescription"
                className="text-base font-semibold text-slate-200"
              >
                {tProfile("packageDealsDescription")}
              </Label>
              <Textarea
                {...register("packageDealsDescription")}
                id="packageDealsDescription"
                placeholder={tProfile("packageDealsPlaceholder")}
                rows={3}
                className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/50"
              />
              <p className="text-sm text-slate-400">
                {tProfile("packageDealsHint")}
              </p>
              {form.formState.errors.packageDealsDescription && (
                <p className="text-red-400 text-sm">
                  {form.formState.errors.packageDealsDescription.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Minimum Notice Hours */}
        <div className="space-y-2">
          <Label
            htmlFor="minNoticeHours"
            className="text-white font-semibold text-sm flex items-center gap-2"
          >
            <Bell className="w-4 h-4 text-orange-500" />
            {t("minNoticeHours")}
          </Label>
          <Select
            value={String(watch("minNoticeHours") ?? 48)}
            onValueChange={(value) =>
              setValue("minNoticeHours", parseInt(value))
            }
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-900 hover:border-slate-600 transition-colors h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              {MIN_NOTICE_HOURS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                >
                  {option.key === "noMinimum"
                    ? t("noMinimum")
                    : option.key === "week"
                      ? t("week")
                      : t("hours", { count: option.count })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("minNoticeHoursHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
