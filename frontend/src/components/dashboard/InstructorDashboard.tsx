"use client";

import { useMyInstructorProfile } from "@/hooks/useMyInstructorProfile";
import { useMyBookings } from "@/hooks/useMyBookings";
import type { Booking } from "@/hooks/useMyBookings";
import {
  useInstructorReviews,
  useInstructorReviewStats,
  usePendingReviews,
} from "@/hooks/useReviews";
import { useReviewFlow } from "@/hooks/useReviewFlow";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";
import { StatsCard } from "./StatsCard";
import { DashboardCard } from "./DashboardCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { DashboardHeader } from "./DashboardHeader";
import { PendingReviewsSection } from "./PendingReviewsSection";
import { BookingHistorySection } from "./BookingHistorySection";
import { FavoriteTrainersSection } from "./FavoriteTrainersSection";
import { BookingsList } from "@/components/bookings/BookingsList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useState, useMemo } from "react";
import { useClearHistory } from "@/hooks/useClearHistory";
import { useMyFavorites } from "@/hooks/useFavorites";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getInstructorName } from "@/lib/utils/user";

export function InstructorDashboard() {
  const t = useTranslations("Dashboard.instructor");
  const tb = useTranslations("Booking");
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

  const stats = {
    averageRating: reviewStats?.averageRating || 0,
    totalReviews: reviewStats?.reviewCount || 0,
    totalSessions: 0, // TODO: Get from bookings
    activeClients: 0, // TODO: Get from bookings
  };

  return (
    <div className="space-y-4">
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
          <RecentReviews instructorProfileId={profile?.id} />
        </DashboardCard>
      </div>

      {/* My Trainings Section — instructor as client */}
      <div className="pt-6">
        <div className="flex items-center justify-center gap-3 mb-4 text-center">
          <Heart className="w-6 h-6 text-pink-500 shrink-0" />
          <h2 className="text-2xl font-bold text-white">{t("myTrainings")}</h2>
          <span className="text-sm text-slate-400">
            — {t("myTrainingsDescription")}
          </span>
        </div>

        {/* Review Banner */}
        {pendingReviewCount > 0 && pendingReviews && pendingReviews[0] && (
          <PendingReviewsSection
            pendingReviews={pendingReviews}
            isLoading={false}
            onOpenReview={handleOpenReview}
            t={t}
            variant="instructor"
          />
        )}

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

          {/* Pending Reviews */}
          <div id="my-pending-reviews" className="scroll-mt-20">
            <DashboardCard
              icon={Star}
              iconColor="text-amber-500"
              iconBgColor="bg-amber-500/10"
              title={t("pendingReviews")}
              delay={7}
            >
              <PendingReviewsSection
                pendingReviews={pendingReviews}
                isLoading={pendingReviewsLoading}
                onOpenReview={handleOpenReview}
                t={t}
                variant="instructor"
              />
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

          {/* Unified Booking History with tabs */}
          <div id="my-client-history" className="scroll-mt-20 md:col-span-2">
            <DashboardCard
              icon={FileText}
              iconColor="text-slate-400"
              title={t("bookingHistory")}
              delay={9}
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

/** Internal component to display recent reviews for an instructor */
function RecentReviews({
  instructorProfileId,
}: {
  instructorProfileId: string | undefined;
}) {
  const t = useTranslations("Dashboard.instructor");
  const { data: reviewsData, isLoading } = useInstructorReviews(
    instructorProfileId,
    1,
    5,
  );
  const reviews = reviewsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyStateCard
        icon={Star}
        title={t("noReviewsYet")}
        description={t("reviewsComingSoon")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white truncate">
              {review.author.displayName}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
              {review.comment}
            </p>
          )}
          <p className="text-[10px] text-slate-500 mt-1">
            {new Date(review.createdAt).toLocaleDateString()}
            {review.serviceName && ` · ${review.serviceName}`}
          </p>
        </div>
      ))}
      {reviewsData && reviewsData.totalCount > 5 && (
        <p className="text-center text-xs text-slate-500">
          {t("moreReviews", { count: reviewsData.totalCount - 5 })}
        </p>
      )}
    </div>
  );
}
