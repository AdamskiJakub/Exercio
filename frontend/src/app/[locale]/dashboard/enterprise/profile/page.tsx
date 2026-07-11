"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyEnterpriseProfile } from "@/hooks/useEnterpriseProfile";
import {
  useUploadProfilePhoto,
  useUploadGalleryPhotos,
} from "@/hooks/useFileUpload";
import { useArrayField } from "@/hooks/useArrayField";
import { useUploadHandler } from "@/hooks/useUploadHandler";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { UpdateEnterpriseProfileDto } from "@/types/enterprise";
import { EnterpriseProfileBasicInfo } from "@/components/enterprise/EnterpriseProfileBasicInfo";
import { EnterpriseProfileMedia } from "@/components/enterprise/EnterpriseProfileMedia";
import { EnterpriseProfileHours } from "@/components/enterprise/EnterpriseProfileHours";
import { EnterpriseProfileHighlights } from "@/components/enterprise/EnterpriseProfileHighlights";
import { EnterpriseProfileContact } from "@/components/enterprise/EnterpriseProfileContact";
import { EnterpriseProfileBusinessType } from "@/components/enterprise/EnterpriseProfileBusinessType";
import { EnterpriseProfileTargetAudience } from "@/components/enterprise/EnterpriseProfileTargetAudience";
import { EnterpriseProfileDisciplines } from "@/components/enterprise/EnterpriseProfileDisciplines";
import { EnterpriseProfileLanguages } from "@/components/enterprise/EnterpriseProfileLanguages";
import { EnterpriseProfileAmenities } from "@/components/enterprise/EnterpriseProfileAmenities";
import { EnterpriseProfilePricing } from "@/components/enterprise/EnterpriseProfilePricing";
import { EnterpriseProfileFaq } from "@/components/enterprise/EnterpriseProfileFaq";

export default function EnterpriseProfilePage() {
  const t = useTranslations("Dashboard.enterprise");
  const { isChecking, user } = useAuthGuard({ requireAuth: true });
  const { data: profile, isLoading: profileLoading } = useMyEnterpriseProfile();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [showHours, setShowHours] = useState(false);

  const { mutateAsync: uploadPhoto, isPending: isUploadingLogo } =
    useUploadProfilePhoto();
  const { mutateAsync: uploadCover, isPending: isUploadingCover } =
    useUploadProfilePhoto();
  const { mutateAsync: uploadAboutImage, isPending: isUploadingAboutImage } =
    useUploadProfilePhoto();
  const { mutateAsync: uploadGallery, isPending: isUploadingGallery } =
    useUploadGalleryPhotos();

  const [form, setForm] = useState<UpdateEnterpriseProfileDto>({});

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName || "",
        shortDescription: profile.shortDescription || "",
        description: profile.description || "",
        email: profile.email || "",
        phone: profile.phone || "",
        website: profile.website || "",
        city: profile.city || "",
        address: profile.address || "",
        postalCode: profile.postalCode || "",
        logoUrl: profile.logoUrl || "",
        coverUrl: profile.coverUrl || "",
        aboutImage: profile.aboutImage || "",
        gallery: profile.gallery || [],
        openingHours: profile.openingHours || {},
        highlights: profile.highlights || [],
        facebookUrl: profile.facebookUrl || "",
        instagramUrl: profile.instagramUrl || "",
        youtubeUrl: profile.youtubeUrl || "",
        tiktokUrl: profile.tiktokUrl || "",
        businessType: profile.businessType || "",
        targetAudience: profile.targetAudience || [],
        disciplines: profile.disciplines || [],
        languages: profile.languages || [],
        hasParking: profile.hasParking ?? false,
        hasShower: profile.hasShower ?? false,
        hasLockerRoom: profile.hasLockerRoom ?? false,
        hasAirConditioning: profile.hasAirConditioning ?? false,
        hasDisabledAccess: profile.hasDisabledAccess ?? false,
        hasFreeTrial: profile.hasFreeTrial ?? false,
        pricing: profile.pricing || [],
        faq: profile.faq || [],
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const highlightsField = useArrayField("highlights", setForm, () => ({
    label: "",
    value: "",
  }));
  const pricingField = useArrayField("pricing", setForm, () => ({
    label: "",
    price: 0,
  }));
  const faqField = useArrayField("faq", setForm, () => ({
    question: "",
    answer: "",
  }));

  const updateHours = useCallback((day: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      openingHours: { ...(prev.openingHours || {}), [day]: value },
    }));
  }, []);

  const handleAmenityChange = useCallback((field: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Generic upload handlers using useUploadHandler
  const handleLogoUpload = useUploadHandler(uploadPhoto, setForm, "logoUrl", {
    successMessage: t("logoUploaded") || "Logo uploaded",
    errorMessage: t("uploadFailed") || "Upload failed",
  });

  const handleCoverUpload = useUploadHandler(uploadCover, setForm, "coverUrl", {
    successMessage: t("coverUploaded") || "Cover photo uploaded",
    errorMessage: t("uploadFailed") || "Upload failed",
  });

  const handleAboutImageUpload = useUploadHandler(
    uploadAboutImage,
    setForm,
    "aboutImage",
    {
      successMessage: t("aboutImageUploaded") || "About image uploaded",
      errorMessage: t("uploadFailed") || "Upload failed",
    },
  );

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const urls = await uploadGallery(files);
      setForm((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...urls],
      }));
      toast.success(t("galleryUploaded") || "Images added to gallery");
    } catch {
      toast.error(t("uploadFailed") || "Upload failed");
    }
  };

  const handleRemoveLogo = useCallback(() => {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
  }, []);

  const handleRemoveCover = useCallback(() => {
    setForm((prev) => ({ ...prev, coverUrl: "" }));
  }, []);

  const handleRemoveAboutImage = useCallback(() => {
    setForm((prev) => ({ ...prev, aboutImage: "" }));
  }, []);

  const handleRemoveGalleryImage = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
  }, []);

  if (isChecking || !user || profileLoading) {
    return <LoadingSpinner />;
  }

  if (user.role !== "ENTERPRISE") {
    return (
      <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex items-center justify-center">
        <p className="text-slate-400 text-lg">{t("noAccess")}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      await apiClient.patch(`/enterprise/${profile.id}`, form);
      queryClient.invalidateQueries({ queryKey: ["my-enterprise-profile"] });
      toast.success(t("profileUpdated"));
    } catch (error: any) {
      toast.error(t("profileUpdateFailed"), {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t("companyProfile")}
            </h1>
            <p className="text-slate-400 text-base">
              {t("companyProfileDescription")}
            </p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          aria-label={t("companyProfile")}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-10"
        >
          <EnterpriseProfileBasicInfo
            companyName={form.companyName || ""}
            shortDescription={form.shortDescription || ""}
            description={form.description || ""}
            onChange={handleChange}
          />

          <EnterpriseProfileMedia
            logo={{
              url: form.logoUrl || "",
              isUploading: isUploadingLogo,
              onChange: handleLogoUpload,
              onUrlChange: (value) =>
                setForm((prev) => ({ ...prev, logoUrl: value })),
              onRemove: handleRemoveLogo,
            }}
            cover={{
              url: form.coverUrl || "",
              isUploading: isUploadingCover,
              onChange: handleCoverUpload,
              onUrlChange: (value) =>
                setForm((prev) => ({ ...prev, coverUrl: value })),
              onRemove: handleRemoveCover,
            }}
            aboutImage={{
              url: form.aboutImage || "",
              isUploading: isUploadingAboutImage,
              onChange: handleAboutImageUpload,
              onUrlChange: (value) =>
                setForm((prev) => ({ ...prev, aboutImage: value })),
              onRemove: handleRemoveAboutImage,
            }}
            gallery={{
              items: form.gallery || [],
              isUploading: isUploadingGallery,
              onChange: handleGalleryUpload,
              onAdd: (url) =>
                setForm((prev) => ({
                  ...prev,
                  gallery: [...(prev.gallery || []), url],
                })),
              onRemove: handleRemoveGalleryImage,
            }}
          />

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileBusinessType
              businessType={form.businessType || ""}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, businessType: value }))
              }
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileTargetAudience
              targetAudience={form.targetAudience || []}
              onChange={(values) =>
                setForm((prev) => ({ ...prev, targetAudience: values }))
              }
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileDisciplines
              disciplines={form.disciplines || []}
              onChange={(values) =>
                setForm((prev) => ({ ...prev, disciplines: values }))
              }
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileLanguages
              languages={form.languages || []}
              onChange={(values) =>
                setForm((prev) => ({ ...prev, languages: values }))
              }
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileAmenities
              hasParking={form.hasParking ?? false}
              hasShower={form.hasShower ?? false}
              hasLockerRoom={form.hasLockerRoom ?? false}
              hasAirConditioning={form.hasAirConditioning ?? false}
              hasDisabledAccess={form.hasDisabledAccess ?? false}
              hasFreeTrial={form.hasFreeTrial ?? false}
              onChange={handleAmenityChange}
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileHours
              openingHours={form.openingHours || {}}
              showHours={showHours}
              onToggle={() => setShowHours(!showHours)}
              onUpdate={updateHours}
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileHighlights
              highlights={form.highlights || []}
              onAdd={highlightsField.add}
              onUpdate={highlightsField.update}
              onRemove={highlightsField.remove}
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfilePricing
              pricing={form.pricing || []}
              onAdd={pricingField.add}
              onUpdate={pricingField.update}
              onRemove={pricingField.remove}
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileFaq
              faq={form.faq || []}
              onAdd={faqField.add}
              onUpdate={faqField.update}
              onRemove={faqField.remove}
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <EnterpriseProfileContact
              contact={{
                email: form.email || "",
                phone: form.phone || "",
                website: form.website || "",
                city: form.city || "",
                address: form.address || "",
                postalCode: form.postalCode || "",
              }}
              social={{
                facebookUrl: form.facebookUrl || "",
                instagramUrl: form.instagramUrl || "",
                youtubeUrl: form.youtubeUrl || "",
                tiktokUrl: form.tiktokUrl || "",
              }}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-8 py-2.5 text-base font-semibold"
            >
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              {isSaving ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </motion.form>
      </div>

      <BottomNavBar
        backText={t("backToDashboard") || "Back to Dashboard"}
        backHref="/dashboard"
      />
    </div>
  );
}
