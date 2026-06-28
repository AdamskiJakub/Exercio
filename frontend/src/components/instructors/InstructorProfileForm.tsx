"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { InstructorProfile, InstructorListing, User } from "@/types";
import { useUpdateInstructorProfile } from "@/hooks/useUpdateInstructorProfile";
import {
  useUploadProfilePhoto,
  useUploadGalleryPhotos,
} from "@/hooks/useFileUpload";
import { toast } from "sonner";
import {
  instructorProfileSchema,
  type InstructorProfileFormData,
} from "@/lib/validations/schemas/instructor-profile";
import {
  useTags,
  useSpecializations,
  useGoals,
  getTagName,
  getGoalName,
} from "@/hooks/useConfig";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MediaUpload } from "@/components/instructors/MediaUpload";
import { ContactSettingsSection } from "@/components/instructors/ContactSettingsSection";
import { PaymentSettingsSection } from "@/components/instructors/PaymentSettingsSection";
import { BookingSettings } from "@/components/settings/booking-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_TAGS = 8;
const MAX_GOALS = 4;
const MAX_ADDITIONAL_SPECIALIZATIONS = 2;

interface InstructorProfileFormProps {
  profile?: InstructorProfile | InstructorListing;
  user: Pick<User, "email" | "phone">;
}

export function InstructorProfileForm({
  profile,
  user,
}: InstructorProfileFormProps) {
  const t = useTranslations("Dashboard.profileForm");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const { mutate: updateProfile } = useUpdateInstructorProfile();
  const { mutate: uploadPhoto, isPending: isUploadingPhoto } =
    useUploadProfilePhoto();
  const { mutate: uploadGallery, isPending: isUploadingGallery } =
    useUploadGalleryPhotos();

  const { tags, loading: tagsLoading } = useTags();
  const { specializations, loading: specializationsLoading } =
    useSpecializations();
  const { goals, loading: goalsLoading } = useGoals();

  // State for multi-selects
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<
    string | undefined
  >(profile?.specializations?.[0] || undefined);
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >(profile?.specializations?.slice(1) || []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    profile?.goals || [],
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string>(
    profile?.availability || "both",
  );

  useEffect(() => {
    if (!tagsLoading && tags.length > 0 && profile?.tags) {
      const validTags = profile.tags.filter((tag: string) =>
        tags.some((t) => t.id === tag),
      );
      setSelectedTags(validTags);
    }
  }, [tagsLoading, tags, profile?.tags]);

  // Filter specializations to valid IDs once config loads
  useEffect(() => {
    if (
      !specializationsLoading &&
      specializations.length > 0 &&
      profile?.specializations
    ) {
      const validSpecIds = profile.specializations.filter((specId: string) =>
        specializations.some((s) => s.id === specId),
      );

      if (validSpecIds.length > 0) {
        setSelectedPrimaryCategory(validSpecIds[0]);
        const additional = validSpecIds.slice(
          1,
          MAX_ADDITIONAL_SPECIALIZATIONS + 1,
        );
        setSelectedSpecializations(additional);
      } else {
        setSelectedPrimaryCategory(undefined);
        setSelectedSpecializations([]);
      }
    }
  }, [specializationsLoading, specializations, profile?.specializations]);

  useEffect(() => {
    if (!goalsLoading && goals.length > 0 && profile?.goals) {
      const validGoals = profile.goals.filter((goalId: string) =>
        goals.some((g) => g.id === goalId),
      );
      // Clamp to MAX_GOALS
      setSelectedGoals(validGoals.slice(0, MAX_GOALS));
    }
  }, [goalsLoading, goals, profile?.goals]);

  const form = useForm<InstructorProfileFormData>({
    resolver: zodResolver(instructorProfileSchema),
    defaultValues: {
      bio: profile?.bio || "",
      tagline: profile?.tagline || "",
      location: profile?.location || "",
      city: profile?.city || "",
      packageDealsEnabled: profile?.packageDealsEnabled || false,
      packageDealsDescription: profile?.packageDealsDescription || "",
      photoUrl: profile?.photoUrl || "",
      languages: profile?.languages?.join(", ") || "",
      gallery: profile?.gallery || [],
      yearsExperience: profile?.yearsExperience ?? undefined,
      showPhone: profile?.showPhone || false,
      showEmail: profile?.showEmail || false,
      contactMessage: profile?.contactMessage || "",
      paymentMethods: profile?.paymentMethods || [],
      paymentInfo: profile?.paymentInfo || "",
      isBookingEnabled: profile?.isBookingEnabled ?? false,
      sessionDuration: profile?.sessionDuration ?? 60,
      sessionPrice: profile?.sessionPrice ?? null,
      minNoticeHours: profile?.minNoticeHours ?? 48,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = form;

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio || "",
        tagline: profile.tagline || "",
        location: profile.location || "",
        city: profile.city || "",
        packageDealsEnabled: profile.packageDealsEnabled || false,
        packageDealsDescription: profile.packageDealsDescription || "",
        photoUrl: profile.photoUrl || "",
        languages: profile.languages?.join(", ") || "",
        gallery: profile.gallery || [],
        yearsExperience: profile.yearsExperience ?? undefined,
        showPhone: profile.showPhone || false,
        showEmail: profile.showEmail || false,
        contactMessage: profile.contactMessage || "",
        paymentMethods: profile.paymentMethods || [],
        paymentInfo: profile.paymentInfo || "",
        isBookingEnabled: profile.isBookingEnabled ?? false,
        sessionDuration: profile.sessionDuration ?? 60,
        sessionPrice: profile.sessionPrice ?? null,
        minNoticeHours: profile.minNoticeHours ?? 48,
      });
    }
  }, [profile, reset]);

  // Get available tags based on primary category
  const availableTags = selectedPrimaryCategory
    ? tags.filter((tag) => tag.categories.includes(selectedPrimaryCategory))
    : tags;

  // Toggle functions
  const toggleSpecialization = (id: string) => {
    if (selectedSpecializations.includes(id)) {
      setSelectedSpecializations((prev) => prev.filter((s) => s !== id));
    } else if (
      selectedSpecializations.length < MAX_ADDITIONAL_SPECIALIZATIONS
    ) {
      setSelectedSpecializations((prev) => [...prev, id]);
    }
  };

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags((prev) => prev.filter((t) => t !== id));
    } else if (selectedTags.length < MAX_TAGS) {
      setSelectedTags((prev) => [...prev, id]);
    }
  };

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals((prev) => prev.filter((g) => g !== id));
    } else if (selectedGoals.length < MAX_GOALS) {
      setSelectedGoals((prev) => [...prev, id]);
    }
  };

  const onSubmit = (data: InstructorProfileFormData) => {
    if (!profile?.id) {
      toast.error(t("profileNotFound"));
      return;
    }

    const formattedData = {
      ...data,
      specializations: selectedPrimaryCategory
        ? [selectedPrimaryCategory, ...selectedSpecializations]
        : selectedSpecializations,
      tags: selectedTags,
      goals: selectedGoals,
      availability: selectedAvailability,
      packageDealsEnabled: data.packageDealsEnabled || false,
      packageDealsDescription: data.packageDealsEnabled
        ? data.packageDealsDescription
        : null,
      yearsExperience: data.yearsExperience ?? null,
      languages:
        typeof data.languages === "string"
          ? (data.languages as string)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : data.languages,
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      photoUrl:
        data.photoUrl && data.photoUrl.trim() !== ""
          ? data.photoUrl.trim()
          : null,
      isBookingEnabled: data.isBookingEnabled ?? false,
      sessionDuration: data.sessionDuration ?? 60,
      sessionPrice: data.sessionPrice ?? null,
      minNoticeHours: data.minNoticeHours ?? 48,
    };

    updateProfile(
      { profileId: profile.id, data: { ...formattedData, isDraft: true } },
      {
        onSuccess: () => {
          toast.success(t("draftSaved"));
          router.push("/dashboard/profile/preview");
        },
        onError: (error) => {
          toast.error(`${t("updateError")}: ${error.message}`);
        },
      },
    );
  };

  return (
    <form
      id="instructor-profile-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* === BASIC INFO SECTION === */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            {t("basicInfoTitle")}
          </h2>
          <p className="text-sm text-slate-400">{t("basicInfoSubtitle")}</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="tagline"
              className="block text-base font-semibold text-slate-200"
            >
              {t("tagline")}
            </label>
            <p className="text-sm text-slate-400 mb-2">{t("taglineHint")}</p>
            <input
              {...register("tagline")}
              id="tagline"
              type="text"
              placeholder={t("taglinePlaceholder")}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            {errors.tagline && (
              <p className="text-red-400 text-sm">{errors.tagline.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-base font-semibold text-slate-200"
            >
              {t("bio")}
            </label>
            <textarea
              {...register("bio")}
              id="bio"
              rows={5}
              placeholder={t("bioPlaceholder")}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
            {errors.bio && (
              <p className="text-red-400 text-sm">{errors.bio.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* === SPECIALIZATION SECTION === */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            {t("specializationTitle")}
          </h2>
          <p className="text-sm text-slate-400">
            {t("specializationSubtitle")}
          </p>
        </div>

        <div className="space-y-5">
          {/* Primary Specialization */}
          <div>
            <label
              htmlFor="primarySpec"
              className="block text-base font-semibold text-slate-200 mb-2"
            >
              {t("primarySpecialization")}
            </label>
            <Select
              value={selectedPrimaryCategory}
              onValueChange={(value) => {
                setSelectedPrimaryCategory(value);
                setSelectedSpecializations([]); // Reset subcategories when changing primary
                setSelectedTags([]); // Reset tags when changing primary
              }}
              disabled={specializationsLoading}
            >
              <SelectTrigger className="w-full bg-slate-900/50 border-slate-600 text-slate-100">
                <SelectValue
                  placeholder={
                    specializationsLoading
                      ? tCommon("loading")
                      : t("primarySpecializationPlaceholder")
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {specializations.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="text-slate-100 focus:bg-slate-800 focus:text-white"
                  >
                    {category.icon}{" "}
                    {locale === "pl" ? category.namePl : category.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Specializations */}
          {selectedPrimaryCategory && (
            <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5">
              <h3 className="text-base font-semibold text-white mb-2">
                {t("additionalSpecializations")}
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                {t("additionalSpecializationsHint", {
                  max: MAX_ADDITIONAL_SPECIALIZATIONS,
                })}
                {selectedSpecializations.length >=
                  MAX_ADDITIONAL_SPECIALIZATIONS && (
                  <span className="text-orange-400 ml-2">
                    ({t("maximumReached")})
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specializations
                  .filter((spec) => spec.id !== selectedPrimaryCategory)
                  .map((spec) => {
                    const isChecked = selectedSpecializations.includes(spec.id);
                    const isDisabled =
                      !isChecked &&
                      selectedSpecializations.length >=
                        MAX_ADDITIONAL_SPECIALIZATIONS;
                    return (
                      <label
                        key={spec.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={isDisabled}
                          onCheckedChange={() => toggleSpecialization(spec.id)}
                          className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <span
                          className={`text-sm select-none transition-colors ${
                            isChecked
                              ? "font-semibold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                              : "text-slate-300 group-hover:text-white"
                          }`}
                        >
                          {spec.icon}{" "}
                          {locale === "pl" ? spec.namePl : spec.nameEn}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {availableTags.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5">
              <h3 className="text-base font-semibold text-white mb-2">
                {t("tags")}
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                {t("tagsHint", { max: MAX_TAGS })}
                {selectedTags.length >= MAX_TAGS && (
                  <span className="text-orange-400 ml-2">
                    ({t("tagsMaxReached", { max: MAX_TAGS })})
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {availableTags.map((tag) => {
                  const isChecked = selectedTags.includes(tag.id);
                  const isDisabled =
                    !isChecked && selectedTags.length >= MAX_TAGS;
                  return (
                    <label
                      key={tag.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={isDisabled}
                        onCheckedChange={() => toggleTag(tag.id)}
                        className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <span
                        className={`text-sm select-none transition-colors ${
                          isChecked
                            ? "font-semibold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {getTagName(tag, locale)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Goals Section */}
          <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-5">
            <h3 className="text-base font-semibold text-white mb-2">
              {t("goals")}
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              {t("goalsHint")}
              {selectedGoals.length >= MAX_GOALS && (
                <span className="text-orange-400 ml-2">
                  ({t("goalsMaxReached", { max: MAX_GOALS })})
                </span>
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals.map((goal) => {
                const isChecked = selectedGoals.includes(goal.id);
                const isDisabled =
                  !isChecked && selectedGoals.length >= MAX_GOALS;
                return (
                  <label
                    key={goal.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleGoal(goal.id)}
                      className="border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <span
                      className={`text-sm select-none transition-colors ${
                        isChecked
                          ? "font-semibold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                          : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {goal.icon} {getGoalName(goal, locale)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* === LOCATION SECTION === */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">📍</span>
            {t("locationPricingTitle")}
          </h2>
          <p className="text-sm text-slate-400">
            {t("locationPricingSubtitle")}
          </p>
        </div>

        <div className="space-y-5">
          {/* Availability */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-200">
              {t("availability")}
            </Label>
            <RadioGroup
              value={selectedAvailability}
              onValueChange={setSelectedAvailability}
              className="space-y-3"
            >
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                <RadioGroupItem value="online" className="border-slate-600" />
                <span className="text-slate-200">
                  {t("availabilityOnline")}
                </span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                <RadioGroupItem
                  value="in-person"
                  className="border-slate-600"
                />
                <span className="text-slate-200">
                  {t("availabilityInPerson")}
                </span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                <RadioGroupItem value="both" className="border-slate-600" />
                <span className="text-slate-200">{t("availabilityBoth")}</span>
              </label>
            </RadioGroup>
          </div>

          {/* Location & City */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-base font-semibold text-slate-200"
              >
                {t("location")}{" "}
                <span className="text-slate-400 text-sm font-normal">
                  {t("hourlyRateOptional")}
                </span>
              </Label>
              <Input
                {...register("location")}
                id="location"
                type="text"
                placeholder={t("locationPlaceholder")}
                className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
              />
              {errors.location && (
                <p className="text-red-400 text-sm">
                  {errors.location.message}
                </p>
              )}
              <p className="text-sm text-slate-400">{t("locationHint")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-base font-semibold text-slate-200"
                >
                  {t("city")}
                </Label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <CityAutocomplete
                      id="city"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder={t("cityPlaceholder")}
                      error={errors.city?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="yearsExperience"
                  className="text-base font-semibold text-slate-200"
                >
                  {t("yearsExperience")}{" "}
                  <span className="text-slate-400 text-sm font-normal">
                    {t("hourlyRateOptional")}
                  </span>
                </Label>
                <Input
                  {...register("yearsExperience", {
                    setValueAs: (v) =>
                      v === "" || v === null || v === undefined
                        ? undefined
                        : Number(v),
                  })}
                  id="yearsExperience"
                  type="number"
                  placeholder={t("yearsExperiencePlaceholder")}
                  className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
                />
                {errors.yearsExperience && (
                  <p className="text-red-400 text-sm">
                    {errors.yearsExperience.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label
              htmlFor="languages"
              className="text-base font-semibold text-slate-200"
            >
              {t("languages")}
            </Label>
            <Input
              {...register("languages")}
              id="languages"
              type="text"
              placeholder={t("languagesPlaceholder")}
              className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500"
            />
            {errors.languages && (
              <p className="text-red-400 text-sm">{errors.languages.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* === BOOKING SETTINGS & PRICING SECTION === */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            {t("bookingSettingsTitle")}
          </h2>
          <p className="text-sm text-slate-400">
            {t("bookingSettingsSubtitle")}
          </p>
        </div>

        <BookingSettings form={form} />
      </div>

      {/* === CONTACT & MEDIA SECTION === */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            {t("contactMediaTitle")}
          </h2>
          <p className="text-sm text-slate-400">{t("contactMediaSubtitle")}</p>
        </div>

        <div className="space-y-5">
          {/* Contact Settings Section */}
          <ContactSettingsSection
            form={form}
            userPhone={user.phone}
            userEmail={user.email}
          />

          {/* Payment Settings Section */}
          <PaymentSettingsSection form={form} />

          {/* Photo URL */}
          <MediaUpload
            variant="avatar"
            currentMediaUrl={watch("photoUrl")}
            onMediaChange={(url) => setValue("photoUrl", url as string)}
            onUpload={async (file) => {
              return new Promise<string>((resolve, reject) => {
                uploadPhoto(file as File, {
                  onSuccess: (url) => {
                    toast.success(t("photoUploadSuccess"));
                    resolve(url);
                  },
                  onError: (error) => {
                    toast.error(t("photoUploadError"));
                    reject(error);
                  },
                });
              });
            }}
            isUploading={isUploadingPhoto}
            label={t("photoUrl")}
          />
          {errors.photoUrl && (
            <p className="text-red-400 text-sm">{errors.photoUrl.message}</p>
          )}

          {/* Gallery */}
          <MediaUpload
            variant="gallery"
            currentMediaUrls={
              Array.isArray(watch("gallery"))
                ? (watch("gallery") as string[])
                : []
            }
            onMediaChange={(urls) => setValue("gallery", urls as string[])}
            onUpload={async (files) => {
              return new Promise<string[]>((resolve, reject) => {
                uploadGallery(files as File[], {
                  onSuccess: (urls) => {
                    toast.success(t("galleryUploadSuccess"));
                    resolve(urls);
                  },
                  onError: (error) => {
                    toast.error(t("galleryUploadError"));
                    reject(error);
                  },
                });
              });
            }}
            isUploading={isUploadingGallery}
            label={t("gallery")}
            maxFiles={10}
            acceptVideo={true}
          />
          {errors.gallery && (
            <p className="text-red-400 text-sm">{errors.gallery.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
