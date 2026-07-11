"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyEnterpriseProfile } from "@/hooks/useEnterpriseProfile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { EnterpriseNewsForm } from "@/components/enterprise/EnterpriseNewsForm";
import { EnterpriseNewsList } from "@/components/enterprise/EnterpriseNewsList";
import type { EnterpriseNews } from "@/types/enterprise";

export default function EnterpriseNewsPage() {
  const t = useTranslations("Dashboard.enterprise");
  const { isChecking, user } = useAuthGuard({ requireAuth: true });
  const { data: profile, isLoading: profileLoading } = useMyEnterpriseProfile();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<EnterpriseNews | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const resetForm = () => {
    setEditingNews(null);
    setShowForm(false);
  };

  const handleEdit = (news: EnterpriseNews) => {
    setEditingNews(news);
    setShowForm(true);
  };

  const handleSubmit = async (form: {
    type: "link" | "post";
    title: string;
    url: string;
    description: string;
    thumbnailUrl: string;
  }) => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        url: form.type === "post" ? "" : form.url,
        thumbnailUrl: form.thumbnailUrl || null,
      };

      if (editingNews) {
        await apiClient.patch(
          `/enterprise/${profile.id}/news/${editingNews.id}`,
          payload,
        );
        toast.success(t("newsUpdated"));
      } else {
        await apiClient.post(`/enterprise/${profile.id}/news`, payload);
        toast.success(t("newsCreated"));
      }
      queryClient.invalidateQueries({ queryKey: ["my-enterprise-profile"] });
      resetForm();
    } catch (error: any) {
      toast.error(
        editingNews
          ? t("newsUpdateFailed") || "Failed to update news"
          : t("newsCreateFailed") || "Failed to create news",
        {
          description: error.response?.data?.message || error.message,
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (newsId: string) => {
    if (!profile) return;

    try {
      await apiClient.delete(`/enterprise/${profile.id}/news/${newsId}`);
      queryClient.invalidateQueries({ queryKey: ["my-enterprise-profile"] });
      toast.success(t("newsDeleted"));
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast.error(t("newsDeleteFailed") || "Failed to delete news", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const newsList = profile?.news || [];

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {t("newsManagement")}
              </h1>
              <p className="text-slate-400 text-base">{t("newsDescription")}</p>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-6 text-base font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("createNews")}
              </Button>
            )}
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <EnterpriseNewsForm
            editingNews={editingNews}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {/* News List */}
        <EnterpriseNewsList
          newsList={newsList}
          deleteConfirmId={deleteConfirmId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteConfirm={setDeleteConfirmId}
          onCreateNew={() => setShowForm(true)}
        />
      </div>

      <BottomNavBar
        backText={t("backToDashboard") || "Back to Dashboard"}
        backHref="/dashboard"
      />
    </div>
  );
}
