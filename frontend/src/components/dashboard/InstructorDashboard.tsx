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
  TrendingUp,
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
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";
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
import { useState, useMemo } from "react";
import { useClearHistory } from "@/hooks/useClearHistory";
import { useMyFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSpecializations } from "@/hooks/useConfig";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getInstructorName } from "@/lib/utils/user";

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
  const { data: recentlyViewed, isLoading: recentlyViewedLoading } =
    useRecentlyViewed();
  const { specializations } = useSpecializations();

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Filter upcoming bookings (pending or confirmed, in the future)
  const now = useMemo(() => new Date(), []);
  const upcomingBookings = useMemo(
    () =>
      bookings?.filter(
        (booking) =>
          (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
          new Date(booking.startTime) > now,
      ) || [],
    [bookings, now],
  );

  // Client-side bookings (instructor as client)
  const upcomingClientBookings = useMemo(
    () =>
      clientBookings?.filter(
        (booking) =>
          (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
          new Date(booking.startTime) > now,
      ) || [],
    [clientBookings, now],
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const pendingReviewCount = pendingReviews?.length || 0;

  // Calculate real stats from bookings
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

      {/* Profile Status */}
      {profile && (
        <DashboardCard title={t("profileStatus")} delay={0} hoverable={true}>
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
        </DashboardCard>
      )}

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
        />
        <StatsCard
          icon={Calendar}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
          title={t("totalSessions")}
          value={stats.totalSessions}
          subtitle={t("allTime")}
          delay={2}
        />
        <StatsCard
          icon={Users}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
          title={t("activeClients")}
          value={stats.activeClients}
          subtitle={t("thisMonth")}
          delay={3}
        />
        <StatsCard
          icon={TrendingUp}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
          title={t("profileViews")}
          value="—"
          subtitle={t("thisMonth")}
          delay={4}
        />
      </div>

      {/* Upcoming Bookings & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div id="upcoming-sections" className="scroll-mt-20">
          <DashboardCard
            icon={Calendar}
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
            iconColor="text-pink-500"
            iconBgColor="bg-pink-500/10"
            title={t("favoriteTrainers")}
            delay={8}
          >
            <FavoriteTrainersSection favorites={favorites} isLoading={false} />
          </DashboardCard>

          {/* Recently Viewed Trainers */}
          <DashboardCard
            icon={Clock}
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
                  const avatarSrc = getMediaUrl(
                    instructor.photoUrl || instructor.avatarUrl,
                  );
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
                      <div className="size-14 rounded-full overflow-hidden bg-slate-700 shrink-0 border-2 border-slate-600">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-slate-700">
                            {name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
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
