"use client";

import { useTranslations } from "next-intl";
import { useMyEnterpriseProfile } from "@/hooks/useEnterpriseProfile";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardHeader } from "./DashboardHeader";
import { StatsCard } from "./StatsCard";
import { DashboardCard } from "./DashboardCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { OnboardingChecklist } from "@/components/enterprise/OnboardingChecklist";
import { getMediaUrl } from "@/lib/utils/media";
import {
  Building2,
  Users,
  Megaphone,
  CreditCard,
  ExternalLink,
  Settings,
  Edit,
  UserPlus,
  Newspaper,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import type {
  EnterpriseInstructorWithProfile,
  EnterpriseNews,
} from "@/types/enterprise";

export function EnterpriseDashboard() {
  const t = useTranslations("Dashboard.enterprise");
  const { data: profile, isLoading } = useMyEnterpriseProfile();
  const user = useAuthStore((state) => state.user);

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
        {/* Instructors */}
        <DashboardCard
          title={t("instructors")}
          icon={Users}
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-500/10"
        >
          {profile?.instructors && profile.instructors.length > 0 ? (
            <div className="space-y-3">
              {profile.instructors
                .slice(0, 5)
                .map((inv: EnterpriseInstructorWithProfile) => (
                  <NextLink
                    key={inv.id}
                    href={`/instructors/${inv.instructor?.user?.username}`}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getMediaUrl(
                        inv.instructor?.photoUrl ||
                          inv.instructor?.user?.avatarUrl,
                      ) ? (
                        <img
                          src={getMediaUrl(
                            inv.instructor?.photoUrl ||
                              inv.instructor?.user?.avatarUrl,
                          )}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-slate-300">
                          {inv.instructor?.user?.firstName?.[0] || "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {inv.instructor?.user?.firstName}{" "}
                          {inv.instructor?.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {inv.status === "ACCEPTED"
                            ? t("activeInstructors")
                            : t("pendingInvitations")}
                        </p>
                      </div>
                    </div>
                  </NextLink>
                ))}
              <Link
                href="/dashboard/enterprise/instructors"
                className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
              >
                {t("manageInstructors")} →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 mb-2">{t("noInstructorsYet")}</p>
              <p className="text-sm text-slate-400 mb-4">
                {t("noInstructorsDescription")}
              </p>
              <Link
                href="/dashboard/enterprise/instructors"
                className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {t("inviteInstructor")}
              </Link>
            </div>
          )}
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
              {profile.news.slice(0, 5).map((newsItem: EnterpriseNews) => (
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
              <Link
                href="/dashboard/enterprise/news"
                className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
              >
                {t("manageNews")} →
              </Link>
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
