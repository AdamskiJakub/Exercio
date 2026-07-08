"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyEnterpriseProfile } from "@/hooks/useEnterpriseProfile";
import {
  useUploadProfilePhoto,
  useUploadGalleryPhotos,
} from "@/hooks/useFileUpload";
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
        gallery: profile.gallery || [],
        openingHours: profile.openingHours || {},
        highlights: profile.highlights || [],
        facebookUrl: profile.facebookUrl || "",
        instagramUrl: profile.instagramUrl || "",
        youtubeUrl: profile.youtubeUrl || "",
        tiktokUrl: profile.tiktokUrl || "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const removeGalleryImage = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
  }, []);

  const addHighlight = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      highlights: [...(prev.highlights || []), { label: "", value: "" }],
    }));
  }, []);

  const updateHighlight = useCallback(
    (index: number, field: "label" | "value", val: string) => {
      setForm((prev) => {
        const highlights = [...(prev.highlights || [])];
        highlights[index] = { ...highlights[index], [field]: val };
        return { ...prev, highlights };
      });
    },
    [],
  );

  const removeHighlight = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== index),
    }));
  }, []);

  const updateHours = useCallback((day: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      openingHours: { ...(prev.openingHours || {}), [day]: value },
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

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadPhoto(file);
      setForm((prev) => ({ ...prev, logoUrl: url }));
      toast.success(t("logoUploaded") || "Logo uploaded");
    } catch {
      toast.error(t("uploadFailed") || "Upload failed");
    }
  };

  // Cover upload (uses same hook as logo — both POST /upload/profile-photo)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadCover(file);
      setForm((prev) => ({ ...prev, coverUrl: url }));
      toast.success(t("coverUploaded") || "Cover photo uploaded");
    } catch {
      toast.error(t("uploadFailed") || "Upload failed");
    }
  };

  // Gallery upload
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

  // Remove logo — update local form state only; save via "Save Changes" button
  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
  };

  // Remove cover — update local form state only; save via "Save Changes" button
  const handleRemoveCover = () => {
    setForm((prev) => ({ ...prev, coverUrl: "" }));
  };

  // Remove gallery image — update local form state only; save via "Save Changes" button
  const handleRemoveGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
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
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6"
        >
          {/* Basic Info */}
          <EnterpriseProfileBasicInfo
            companyName={form.companyName || ""}
            shortDescription={form.shortDescription || ""}
            description={form.description || ""}
            onChange={handleChange}
          />

          {/* Logo, Cover & Gallery */}
          <EnterpriseProfileMedia
            logoUrl={form.logoUrl || ""}
            coverUrl={form.coverUrl || ""}
            gallery={form.gallery || []}
            isUploadingLogo={isUploadingLogo}
            isUploadingCover={isUploadingCover}
            isUploadingGallery={isUploadingGallery}
            onLogoChange={handleLogoUpload}
            onCoverChange={handleCoverUpload}
            onGalleryUpload={handleGalleryUpload}
            onLogoUrlChange={(value) =>
              setForm((prev) => ({ ...prev, logoUrl: value }))
            }
            onCoverUrlChange={(value) =>
              setForm((prev) => ({ ...prev, coverUrl: value }))
            }
            onAddGalleryImage={(url) =>
              setForm((prev) => ({
                ...prev,
                gallery: [...(prev.gallery || []), url],
              }))
            }
            onRemoveGalleryImage={handleRemoveGalleryImage}
            onRemoveLogo={handleRemoveLogo}
            onRemoveCover={handleRemoveCover}
          />

          {/* Opening Hours */}
          <EnterpriseProfileHours
            openingHours={form.openingHours || {}}
            showHours={showHours}
            onToggle={() => setShowHours(!showHours)}
            onUpdate={updateHours}
          />

          {/* Highlights */}
          <EnterpriseProfileHighlights
            highlights={form.highlights || []}
            onAdd={addHighlight}
            onUpdate={updateHighlight}
            onRemove={removeHighlight}
          />

          {/* Contact & Social */}
          <EnterpriseProfileContact
            email={form.email || ""}
            phone={form.phone || ""}
            website={form.website || ""}
            city={form.city || ""}
            address={form.address || ""}
            postalCode={form.postalCode || ""}
            facebookUrl={form.facebookUrl || ""}
            instagramUrl={form.instagramUrl || ""}
            youtubeUrl={form.youtubeUrl || ""}
            tiktokUrl={form.tiktokUrl || ""}
            onChange={handleChange}
          />

          {/* Submit */}
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
