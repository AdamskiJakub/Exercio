"use client";

import { useMyInstructorProfile } from "@/hooks/useMyInstructorProfile";
import { useMyBookings } from "@/hooks/useMyBookings";
import {
  useInstructorReviewStats,
  usePendingReviews,
} from "@/hooks/useReviews";
import { useReviewFlow } from "@/hooks/useReviewFlow";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { NAV_SOURCE } from "@/components/instructors/profile/types";
import {
  Star,
  Users,
  Calendar,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Heart,
  GraduationCap,
  User,
  MapPin,
  UserCheck,
  Building2,
  X,
  Check,
  EyeOff,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { DashboardCard } from "./DashboardCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { DashboardHeader } from "./DashboardHeader";
import { PendingReviewsSection } from "./PendingReviewsSection";
import { RecentReviewsSection } from "./RecentReviewsSection";
import { BookingHistorySection } from "./BookingHistorySection";
import { FavoriteTrainersSection } from "./FavoriteTrainersSection";
import { BookingsList } from "@/components/bookings/BookingsList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useState, useMemo, useCallback } from "react";
import { useClearHistory } from "@/hooks/useClearHistory";
import { useMyFavorites } from "@/hooks/useFavorites";
import { useMyFollowedEnterprises } from "@/hooks/useFollow";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useInstructorFollowerCount } from "@/hooks/useFollow";
import { useSpecializations } from "@/hooks/useConfig";
import {
  useMyEnterpriseInvitations,
  useAcceptInvitation,
  useRejectInvitation,
} from "@/hooks/useEnterpriseInvitations";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getInstructorName } from "@/lib/utils/user";
import { getMediaUrl } from "@/lib/utils/media";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUpdateInstructorProfile } from "@/hooks/useUpdateInstructorProfile";
import { usePublishInstructorProfile } from "@/hooks/usePublishInstructorProfile";

export function InstructorDashboard() {
  const t = useTranslations("Dashboard.instructor");
  const tb = useTranslations("Booking");
  const locale = useLocale();
  const { data: profile, isLoading } = useMyInstructorProfile();
  const { data: bookings, isLoading: bookingsLoading } =
    useMyBookings("instructor");
  const { data: reviewStats } = useInstructorReviewStats(profile?.id);

  // Client-side bookings (instructor as client)
  const { data: clientBookings, isLoading: clientBookingsLoading } =
    useMyBookings("client");
  const { data: pendingReviews, isLoading: pendingReviewsLoading } =
    usePendingReviews();
  const { data: favorites } = useMyFavorites();
  const { data: followedEnterprises, isLoading: followedEnterprisesLoading } =
    useMyFollowedEnterprises();
  const { data: recentlyViewed, isLoading: recentlyViewedLoading } =
    useRecentlyViewed();
  const { specializations } = useSpecializations();
  const { data: enterpriseInvitations } = useMyEnterpriseInvitations();
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  // Review flow state & handlers
  const {
    reviewFormOpen,
    selectedBookingForReview,
    reviewIndex,
    handleOpenReview,
    handleReviewSuccess,
    handleReviewClose,
  } = useReviewFlow();

  const clearHistory = useClearHistory();
  const { mutate: updateProfile } = useUpdateInstructorProfile();
  const { mutate: publishProfile, isPending: isPublishing } =
    usePublishInstructorProfile();
  const { data: followerCount } = useInstructorFollowerCount(profile?.id ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hideProfileOpen, setHideProfileOpen] = useState(false);

  // Filter upcoming bookings (pending or confirmed, in the future)
  // Use inline new Date() to avoid stale "now" values on long-lived mounts
  const upcomingBookings = useMemo(
    () =>
      bookings?.filter(
        (booking) =>
          (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
          new Date(booking.startTime) > new Date(),
      ) || [],
    [bookings],
  );

  // Client-side bookings (instructor as client)
  const upcomingClientBookings = useMemo(
    () =>
      clientBookings?.filter(
        (booking) =>
          (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
          new Date(booking.startTime) > new Date(),
      ) || [],
    [clientBookings],
  );

  const pastInstructorBookings = useMemo(
    () =>
      bookings?.filter(
        (booking) =>
          booking.status === "COMPLETED" || booking.status === "CANCELLED",
      ) || [],
    [bookings],
  );

  const pastClientBookings = useMemo(
    () =>
      clientBookings?.filter(
        (booking) =>
          booking.status === "COMPLETED" || booking.status === "CANCELLED",
      ) || [],
    [clientBookings],
  );

  // Calculate real stats from bookings — must be before early return to keep hooks consistent
  const totalSessions =
    bookings?.filter((b) => b.status === "COMPLETED").length || 0;

  const activeClients = useMemo(() => {
    if (!bookings) return 0;
    const uniqueClients = new Set(
      bookings
        .filter(
          (b) =>
            b.status === "CONFIRMED" ||
            b.status === "PENDING" ||
            b.status === "COMPLETED",
        )
        .map((b) => b.clientId),
    );
    return uniqueClients.size;
  }, [bookings]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const pendingReviewCount = pendingReviews?.length || 0;

  const stats = {
    averageRating: reviewStats?.averageRating || 0,
    totalReviews: reviewStats?.reviewCount || 0,
    totalSessions,
    activeClients,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <DashboardHeader
        greeting={`${t("welcomeBack")}, ${profile?.user?.firstName || profile?.user?.username || "Instructor"}!`}
        subtitle={t("manageProfile")}
        avatarUrl={profile?.photoUrl ? getMediaUrl(profile.photoUrl) : null}
        actionLinks={[
          {
            href: "/dashboard/profile/edit",
            icon: <Edit className="w-5 h-5" />,
            label: t("editProfile"),
            className:
              "px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg",
          },
          {
            href: "/dashboard/settings",
            icon: <Settings className="w-5 h-5" />,
            label: t("accountSettings"),
          },
          {
            href: "/dashboard/calendar",
            icon: <Clock className="w-5 h-5" />,
            label: t("calendar"),
            className:
              "px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg",
          },
        ]}
      />

      {/* 🟨 GOLDEN ALERT — Review Banner (action required, shown first) */}
      {pendingReviewCount > 0 && pendingReviews && pendingReviews[0] && (
        <PendingReviewsSection
          pendingReviews={pendingReviews}
          isLoading={false}
          onOpenReview={handleOpenReview}
          t={t}
          variant="instructor"
        />
      )}

      {/* ============================================================ */}
      {/* MÓJ BIZNES (INSTRUKTOR)                                       */}
      {/* ============================================================ */}
      <div className="pt-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <GraduationCap className="w-7 h-7 text-blue-400 shrink-0" />
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {t("myBusiness")}
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto">
          {t("myBusinessDescription")}
        </p>
      </div>

      {/* Enterprise Invitations — inline banner, only when pending (above profile status) */}
      {enterpriseInvitations && enterpriseInvitations.length > 0 && (
        <div className="space-y-3">
          {enterpriseInvitations
            .filter((inv: any) => inv.status === "PENDING")
            .map((inv: any) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {t("enterpriseInvitationTitle", {
                        company: inv.enterprise?.companyName || "",
                      })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t("enterpriseInvitationDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => acceptInvitation.mutate(inv.id)}
                    disabled={acceptInvitation.isPending}
                    className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    title={t("accept")}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rejectInvitation.mutate(inv.id)}
                    disabled={rejectInvitation.isPending}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    title={t("reject")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Profile Status */}
      {profile && (
        <DashboardCard
          title={t("profileStatus")}
          delay={0}
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
                  className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2 font-medium border border-red-500/20 hover:border-red-500/40"
                >
                  <EyeOff className="w-4 h-4" />
                  {t("hideProfile")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => publishProfile(profile.id)}
                  disabled={isPublishing}
                  className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-colors flex items-center gap-2 font-medium border border-green-500/20 hover:border-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isPublishing ? t("publishing") : t("publishProfile")}
                </button>
              )}
              <Link
                href={
                  `/instructors/${profile?.user?.username || ""}?from=${NAV_SOURCE.DASHBOARD}` as any
                }
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Eye className="w-4 h-4" />
                {t("viewPublicProfile")}
              </Link>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Enterprise Affiliation — show if instructor belongs to an organization */}
      {profile?.enterpriseMemberships?.[0]?.enterprise &&
        (() => {
          const org = profile.enterpriseMemberships[0].enterprise;
          return (
            <DashboardCard
              title={t("affiliatedEnterprise")}
              delay={0}
              hoverable={true}
              hoverColor="hover:border-orange-500"
            >
              <Link
                href={`/enterprise/${org.slug}` as any}
                className="flex items-center gap-4 group"
              >
                {org.logoUrl ? (
                  <span className="w-12 h-12 rounded-xl overflow-hidden border border-slate-600 bg-white shrink-0">
                    <img
                      src={getMediaUrl(org.logoUrl)}
                      alt={org.companyName}
                      className="w-full h-full object-cover"
                    />
                  </span>
                ) : (
                  <span className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {t("instructorAt")}
                  </p>
                  <p className="text-base font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                    {org.companyName}
                  </p>
                </div>
                <Building2 className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
              </Link>
            </DashboardCard>
          );
        })()}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Star}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-500/10"
          title={t("averageRating")}
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
          subtitle={`${stats.totalReviews} ${t("reviews")}`}
          delay={1}
          hoverColor="hover:border-orange-500"
        />
        <StatsCard
          icon={Calendar}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
          title={t("totalSessions")}
          value={stats.totalSessions}
          subtitle={t("allTime")}
          delay={2}
          hoverColor="hover:border-orange-500"
        />
        <StatsCard
          icon={Users}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
          title={t("activeClients")}
          value={stats.activeClients}
          subtitle={t("thisMonth")}
          delay={3}
          hoverColor="hover:border-orange-500"
        />
        <StatsCard
          icon={Heart}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
          title={t("followers")}
          value={followerCount ?? "—"}
          subtitle={t("followersSubtitle")}
          hoverColor="hover:border-orange-500"
          delay={4}
        />
      </div>

      {/* Upcoming Bookings & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div id="upcoming-sections" className="scroll-mt-20">
          <DashboardCard
            icon={Calendar}
            hoverColor="hover:border-orange-500"
            iconColor="text-orange-500"
            iconBgColor="bg-orange-500/10"
            title={t("upcomingBookings")}
            delay={5}
          >
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : upcomingBookings.length > 0 ? (
              <BookingsList bookings={upcomingBookings} role="instructor" />
            ) : (
              <EmptyStateCard
                icon={FileText}
                title={t("noUpcomingBookings")}
                description={t("bookingsComingSoon")}
              />
            )}
          </DashboardCard>
        </div>

        <DashboardCard
          icon={Star}
          hoverColor="hover:border-orange-500"
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-500/10"
          title={t("recentReviews")}
          delay={6}
        >
          <RecentReviewsSection instructorProfileId={profile?.id} />
        </DashboardCard>
      </div>

      {/* ============================================================ */}
      {/* MOJE TRENINGI (JAKO KLIENT)                                   */}
      {/* ============================================================ */}
      <div className="pt-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Heart className="w-7 h-7 text-pink-400 shrink-0" />
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {t("myTrainings")}
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto">
          {t("myTrainingsDescription")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Sessions as Client */}
          <div id="my-client-upcoming" className="scroll-mt-20">
            <DashboardCard
              icon={Calendar}
              hoverColor="hover:border-orange-500"
              iconColor="text-pink-500"
              iconBgColor="bg-pink-500/10"
              title={t("myUpcomingSessions")}
              delay={7}
            >
              {clientBookingsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : upcomingClientBookings.length > 0 ? (
                <BookingsList bookings={upcomingClientBookings} role="client" />
              ) : (
                <EmptyStateCard
                  icon={Calendar}
                  title={t("noUpcomingSessions")}
                  description={t("bookAsClientDescription")}
                />
              )}
            </DashboardCard>
          </div>

          {/* Favorite Trainers */}
          <DashboardCard
            icon={Heart}
            hoverColor="hover:border-orange-500"
            iconColor="text-pink-500"
            iconBgColor="bg-pink-500/10"
            title={t("favoriteTrainers")}
            delay={8}
          >
            <FavoriteTrainersSection
              favorites={favorites}
              isLoading={false}
              showFollowedTab={true}
              followedEnterprises={followedEnterprises}
              isFollowedLoading={followedEnterprisesLoading}
            />
          </DashboardCard>

          {/* Recently Viewed Trainers */}
          <DashboardCard
            icon={Clock}
            hoverColor="hover:border-orange-500"
            iconColor="text-cyan-500"
            iconBgColor="bg-cyan-500/10"
            title={t("recentlyViewed")}
            delay={9}
          >
            {recentlyViewedLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentlyViewed && recentlyViewed.length > 0 ? (
              <div className="space-y-2">
                {recentlyViewed.map((instructor) => {
                  const name =
                    [instructor.firstName, instructor.lastName]
                      .filter(Boolean)
                      .join(" ") || instructor.username;
                  const primarySpecId = instructor.specializations?.[0];
                  const primarySpec = primarySpecId
                    ? specializations.find((s) => s.id === primarySpecId)
                    : undefined;
                  const primarySpecName = primarySpec
                    ? locale === "pl"
                      ? primarySpec.namePl
                      : primarySpec.nameEn
                    : null;
                  return (
                    <Link
                      key={instructor.id}
                      href={`/instructors/${instructor.username}` as any}
                      className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500/50 rounded-xl overflow-hidden transition-colors duration-300 group p-4"
                    >
                      <UserAvatar
                        photoUrl={instructor.photoUrl}
                        avatarUrl={instructor.avatarUrl}
                        firstName={instructor.firstName}
                        lastName={instructor.lastName}
                        size="md"
                        alt={name}
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {name}
                        </h4>
                        {primarySpecName && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {primarySpecName}
                          </p>
                        )}
                        {instructor.city && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                            <MapPin className="size-3" />
                            <span>{instructor.city}</span>
                          </div>
                        )}
                      </div>
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyStateCard
                icon={UserCheck}
                title={t("noRecentlyViewed")}
                description={t("recentlyViewedDescription")}
              />
            )}
          </DashboardCard>

          {/* Unified Booking History with tabs */}
          <div id="my-client-history" className="scroll-mt-20 md:col-span-2">
            <DashboardCard
              icon={FileText}
              hoverColor="hover:border-orange-500"
              iconColor="text-slate-400"
              title={t("bookingHistory")}
              delay={10}
            >
              <BookingHistorySection
                instructorBookings={pastInstructorBookings}
                clientBookings={pastClientBookings}
                isLoading={bookingsLoading || clientBookingsLoading}
                pendingReviews={pendingReviews}
                onOpenReview={handleOpenReview}
                getInstructorName={getInstructorName}
                tb={tb}
                emptyTitle={t("noHistory")}
                emptyDescription={t("historyDescription")}
                leaveReviewLabel={t("leaveReview")}
                onClearHistory={() => setConfirmOpen(true)}
                clearHistoryLabel={t("clearHistory")}
                tabs={{
                  instructor: {
                    label: t("asInstructor"),
                    icon: <GraduationCap className="w-4 h-4" />,
                  },
                  client: {
                    label: t("asClient"),
                    icon: <User className="w-4 h-4" />,
                  },
                }}
              />
            </DashboardCard>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await clearHistory.mutateAsync();
          setConfirmOpen(false);
        }}
        title={t("clearHistory")}
        description={t("clearHistoryDescription")}
        confirmText={t("clear")}
        cancelText={t("cancel")}
      />

      {profile && (
        <ConfirmModal
          isOpen={hideProfileOpen}
          onClose={() => setHideProfileOpen(false)}
          onConfirm={() => {
            updateProfile({
              profileId: profile.id,
              data: { isDraft: true },
            });
            setHideProfileOpen(false);
          }}
          title={t("hideProfile")}
          description={t("hideProfileConfirm")}
          confirmText={t("hideProfile")}
          cancelText={t("cancel")}
          variant="danger"
        />
      )}

      {/* Review Form Modal */}
      {selectedBookingForReview && (
        <ReviewForm
          bookingId={selectedBookingForReview.id}
          instructorName={selectedBookingForReview.instructorName}
          isOpen={reviewFormOpen}
          onClose={handleReviewClose}
          onSuccess={() => handleReviewSuccess(pendingReviews)}
          reviewIndex={reviewIndex}
          totalReviews={pendingReviewCount}
        />
      )}
    </div>
  );
}
