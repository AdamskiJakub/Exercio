"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMyEnterpriseProfile } from "@/hooks/useEnterpriseProfile";
import { usePublishEnterpriseProfile } from "@/hooks/usePublishEnterpriseProfile";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardHeader } from "./DashboardHeader";
import { StatsCard } from "./StatsCard";
import { DashboardCard } from "./DashboardCard";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { OnboardingChecklist } from "@/components/enterprise/OnboardingChecklist";
import { getMediaUrl } from "@/lib/utils/media";
import { useMyFollowedInstructors } from "@/hooks/useFollow";
import { FollowedInstructorsSection } from "./FollowedInstructorsSection";
import { EnterpriseInstructorList } from "./EnterpriseInstructorList";
import {
  Building2,
  Users,
  Megaphone,
  CreditCard,
  ExternalLink,
  Settings,
  Edit,
  Newspaper,
  Heart,
  Clock,
  CheckCircle,
  EyeOff,
  Eye,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import type { EnterpriseNews } from "@/types/enterprise";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function EnterpriseDashboard() {
  const t = useTranslations("Dashboard.enterprise");
  const { data: profile, isLoading } = useMyEnterpriseProfile();
  const { data: followedInstructors, isLoading: followedInstructorsLoading } =
    useMyFollowedInstructors();
  const user = useAuthStore((state) => state.user);
  const publishProfile = usePublishEnterpriseProfile();
  const queryClient = useQueryClient();
  const [hideProfileOpen, setHideProfileOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const isPending = profile?.status === "PENDING";
  const isRejected = profile?.status === "REJECTED";
  const isApproved = profile?.status === "ACTIVE";

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        greeting={`${t("welcomeBack")}, ${profile?.companyName || user?.email?.split("@")[0] || ""}!`}
        subtitle={t("manageProfile")}
        avatarUrl={getMediaUrl(profile?.logoUrl) || null}
        actionLinks={[
          {
            href: "/dashboard/enterprise/profile",
            icon: <Edit className="h-4 w-4" />,
            label: t("editProfile"),
            className:
              "px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg",
          },
          {
            href: `/enterprise/${profile?.slug}?from=dashboard`,
            icon: <ExternalLink className="h-4 w-4" />,
            label: t("viewPublicProfile"),
            className:
              "px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg",
          },
          {
            href: "/dashboard/settings",
            icon: <Settings className="h-4 w-4" />,
            label: t("accountSettings"),
            className:
              "px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg",
          },
        ]}
      />

      {/* Profile Status Banner */}
      {isPending && (
        <div className="rounded-lg border p-4 bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
          <p className="font-semibold">
            {t("pending")} — {t("pendingDescription")}
          </p>
        </div>
      )}
      {isRejected && (
        <div className="rounded-lg border p-4 bg-red-500/10 border-red-500/30 text-red-400">
          <p className="font-semibold">
            {t("rejected")} — {t("rejectedDescription")}
          </p>
        </div>
      )}

      {/* Onboarding Checklist */}
      {profile && isApproved && <OnboardingChecklist profile={profile} />}

      {/* Profile Status Card */}
      {profile && isApproved && (
        <DashboardCard
          title={t("profileStatus")}
          hoverable={true}
          hoverColor="hover:border-orange-500"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {profile.isDraft ? (
                <>
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-500 font-medium">
                    {t("draft")}
                  </span>
                  <span className="text-slate-400 text-sm ml-2">
                    — {t("draftDescription")}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-500 font-medium">
                    {t("published")}
                  </span>
                  <span className="text-slate-400 text-sm ml-2">
                    — {t("publishedDescription")}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!profile.isDraft ? (
                <button
                  type="button"
                  onClick={() => setHideProfileOpen(true)}
                  className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2 font-medium border border-red-500/20 hover:border-red-500/40 cursor-pointer"
                >
                  <EyeOff className="w-4 h-4" />
                  {t("hideProfile")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => publishProfile.mutate(profile.id)}
                  disabled={publishProfile.isPending}
                  className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-colors flex items-center gap-2 font-medium border border-green-500/20 hover:border-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {publishProfile.isPending
                    ? t("publishing")
                    : t("publishProfile")}
                </button>
              )}
              <Link
                href={`/enterprise/${profile?.slug}?from=dashboard` as any}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Eye className="w-4 h-4" />
                {t("viewPublicProfile")}
              </Link>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Hide Profile Confirmation Modal */}
      <ConfirmModal
        isOpen={hideProfileOpen}
        onClose={() => setHideProfileOpen(false)}
        onConfirm={async () => {
          try {
            await apiClient.patch(`/enterprise/${profile?.id}`, {
              isDraft: true,
            });
            queryClient.invalidateQueries({
              queryKey: ["my-enterprise-profile"],
            });
            toast.success(t("profileHidden"));
          } catch (error: any) {
            toast.error(
              error.response?.data?.message || t("profileHideFailed"),
            );
          }
          setHideProfileOpen(false);
        }}
        title={t("hideProfileConfirm")}
        confirmText={t("hideProfile")}
        cancelText={t("cancel")}
        variant="danger"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={Building2}
          title={t("companyInfo")}
          value={profile?.companyName || "—"}
          subtitle={profile?.city || ""}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-400"
        />
        <StatsCard
          icon={Users}
          title={t("totalInstructors")}
          value={profile?.instructors?.length?.toString() || "0"}
          subtitle={t("activeInstructors")}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <StatsCard
          icon={CreditCard}
          title={t("subscription")}
          value={t("free")}
          subtitle={t("freePlanDescription")}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-400"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Followed Instructors */}
        <DashboardCard
          title={t("followedInstructors")}
          icon={Heart}
          iconColor="text-pink-400"
          iconBgColor="bg-pink-500/10"
        >
          <FollowedInstructorsSection
            instructors={followedInstructors}
            isLoading={followedInstructorsLoading}
          />
        </DashboardCard>

        {/* Instructors */}
        <DashboardCard
          title={t("instructors")}
          icon={Users}
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-500/10"
        >
          <EnterpriseInstructorList instructors={profile?.instructors ?? []} />
        </DashboardCard>

        {/* News */}
        <DashboardCard
          title={t("news")}
          icon={Megaphone}
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-500/10"
        >
          {profile?.news && profile.news.length > 0 ? (
            <div className="space-y-3">
              {profile.news.slice(0, 3).map((newsItem: EnterpriseNews) => (
                <NextLink
                  key={newsItem.id}
                  href={
                    newsItem.type === "post"
                      ? "/dashboard/enterprise/news"
                      : newsItem.url || "#"
                  }
                  target={
                    newsItem.type === "post" || !newsItem.url
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    newsItem.type === "post" || !newsItem.url
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  {newsItem.thumbnailUrl ? (
                    <img
                      src={getMediaUrl(newsItem.thumbnailUrl)}
                      alt=""
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center shrink-0">
                      <Newspaper className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {newsItem.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(newsItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </NextLink>
              ))}
              {profile.news.length > 3 && (
                <Link
                  href="/dashboard/enterprise/news"
                  className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
                >
                  {t("showAllNews")} ({profile.news.length}) →
                </Link>
              )}
              <div className="flex justify-center">
                <Link
                  href="/dashboard/enterprise/news"
                  className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t("manageNews")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 mb-2">{t("noNews")}</p>
              <p className="text-sm text-slate-400 mb-4">
                {t("noNewsDescription")}
              </p>
              <Link
                href="/dashboard/enterprise/news"
                className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {t("createNews")}
              </Link>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
