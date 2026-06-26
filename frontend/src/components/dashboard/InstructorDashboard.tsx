"use client";

import { useMyInstructorProfile } from "@/hooks/useMyInstructorProfile";
import { useMyBookings } from "@/hooks/useMyBookings";
import {
  useInstructorReviews,
  useInstructorReviewStats,
  usePendingReviews,
} from "@/hooks/useReviews";
import { useReviewFlow } from "@/hooks/useReviewFlow";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { titleVariants } from "@/lib/animations";
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
  MessageSquare,
  Heart,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/media";
import { StatsCard } from "./StatsCard";
import { DashboardCard } from "./DashboardCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { BookingsList } from "@/components/bookings/BookingsList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { PaginationSection } from "@/components/instructors/pagination-section";

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

  // Review flow state & handlers (shared with ClientDashboard)
  const {
    reviewFormOpen,
    selectedBookingForReview,
    reviewIndex,
    handleOpenReview,
    handleReviewSuccess,
    handleReviewClose,
  } = useReviewFlow();

  // Pagination for past bookings
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Filter upcoming bookings (pending or confirmed, in the future)
  // NOTE: useMemo must be called BEFORE any early return to avoid
  // "Rendered more hooks than during the previous render" error
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

  // Client-side bookings
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

  const paginatedPastBookings = pastClientBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(pastClientBookings.length / ITEMS_PER_PAGE);

  const pendingReviewCount = pendingReviews?.length || 0;

  const stats = {
    averageRating: reviewStats?.averageRating || 0,
    totalReviews: reviewStats?.reviewCount || 0,
    totalSessions: 0, // TODO: Get from bookings
    activeClients: 0, // TODO: Get from bookings
  };

  return (
    <div className="space-y-4">
      {/* Welcome Header - Clean Design with Animation */}
      <div className="text-center space-y-6 py-8">
        {profile?.photoUrl && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={getMediaUrl(profile.photoUrl)}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-2xl"
            />
          </motion.div>
        )}
        <div className="space-y-3">
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold text-gradient-trainly"
          >
            {t("welcomeBack")},{" "}
            {profile?.user?.firstName ||
              profile?.user?.username ||
              "Instructor"}
            !
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            {t("manageProfile")}
          </motion.p>
        </div>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link
            href="/dashboard/profile/edit"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Edit className="w-5 h-5" />
            {t("editProfile")}
          </Link>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Settings className="w-5 h-5" />
            {t("accountSettings")}
          </Link>
          <Link
            href="/dashboard/calendar"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Clock className="w-5 h-5" />
            {t("calendar")}
          </Link>
        </motion.div>
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
          <RecentReviews instructorProfileId={profile?.id} />
        </DashboardCard>
      </div>

      {/* My Trainings Section — instructor as client */}
      <div className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold text-white">{t("myTrainings")}</h2>
          <span className="text-sm text-slate-400">
            — {t("myTrainingsDescription")}
          </span>
        </div>

        {/* Review Banner */}
        {pendingReviewCount > 0 && pendingReviews && pendingReviews[0] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-amber-400" />
              <div>
                <p className="text-white font-medium">
                  {t("reviewBannerTitle", {
                    count: pendingReviewCount,
                  })}
                </p>
                <p className="text-sm text-slate-400">
                  {pendingReviewCount}{" "}
                  {pendingReviewCount === 1
                    ? "session"
                    : t("reviewCompletedSessions")}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                handleOpenReview(
                  pendingReviews[0].bookingId,
                  pendingReviews[0].instructorName,
                  0,
                )
              }
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all hover:scale-105 text-sm"
            >
              {t("reviewBannerAction")}
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pending Reviews */}
          <div id="my-pending-reviews" className="scroll-mt-20">
            <DashboardCard
              icon={Star}
              iconColor="text-amber-500"
              iconBgColor="bg-amber-500/10"
              title={t("pendingReviews")}
              delay={7}
            >
              {pendingReviewsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : pendingReviewCount > 0 ? (
                <div className="space-y-2">
                  {pendingReviews?.slice(0, 3).map((review) => (
                    <div
                      key={review.bookingId}
                      className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 border border-slate-600/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {review.instructorName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(review.startTime).toLocaleDateString()}
                            {review.serviceName && ` · ${review.serviceName}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleOpenReview(
                            review.bookingId,
                            review.instructorName,
                          )
                        }
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                      >
                        {t("leaveReview")}
                      </button>
                    </div>
                  ))}
                  {pendingReviewCount > 3 && (
                    <p className="text-center text-xs text-slate-500">
                      {t("moreReviews", {
                        count: pendingReviewCount - 3,
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <EmptyStateCard
                  icon={Star}
                  title={t("noPendingReviews")}
                  description={t("noPendingReviewsDescription")}
                />
              )}
            </DashboardCard>
          </div>

          {/* Booking History as Client */}
          <div id="my-client-history" className="scroll-mt-20">
            <DashboardCard
              icon={FileText}
              iconColor="text-slate-400"
              title={t("bookingHistory")}
              delay={8}
            >
              {clientBookingsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : pastClientBookings.length > 0 ? (
                <div className="space-y-3">
                  {paginatedPastBookings.map((booking) => {
                    const isCompleted = booking.status === "COMPLETED";
                    const needsReview =
                      isCompleted &&
                      pendingReviews?.some((pr) => pr.bookingId === booking.id);
                    const instructorName = booking.instructorUser?.firstName
                      ? `${booking.instructorUser.firstName} ${booking.instructorUser.lastName || ""}`.trim()
                      : booking.instructorUser?.email || "Instructor";

                    return (
                      <div
                        key={booking.id}
                        className={cn(
                          "bg-slate-800/50 rounded-lg p-4 border transition-colors",
                          isCompleted
                            ? "border-emerald-500/20 hover:border-emerald-500/40"
                            : booking.status === "CANCELLED"
                              ? "border-rose-500/20 hover:border-rose-500/40"
                              : "border-slate-700/50 hover:border-slate-600",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {instructorName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(booking.startTime).toLocaleDateString()}{" "}
                              ·{" "}
                              {new Date(booking.startTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {needsReview && (
                              <button
                                onClick={() =>
                                  handleOpenReview(booking.id, instructorName)
                                }
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                {t("leaveReview")}
                              </button>
                            )}
                            <span
                              className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                isCompleted
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : booking.status === "CANCELLED"
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-slate-500/10 text-slate-400",
                              )}
                            >
                              {isCompleted
                                ? tb("completed")
                                : booking.status === "CANCELLED"
                                  ? tb("cancelled")
                                  : booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {totalPages > 1 && (
                    <PaginationSection
                      page={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              ) : (
                <EmptyStateCard
                  icon={FileText}
                  title={t("noPendingReviews")}
                  description={t("noPendingReviewsDescription")}
                />
              )}
            </DashboardCard>
          </div>
        </div>
      </div>

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
  const { data: reviews, isLoading } =
    useInstructorReviews(instructorProfileId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
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
      {reviews.slice(0, 5).map((review) => (
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
      {reviews.length > 5 && (
        <p className="text-center text-xs text-slate-500">
          +{reviews.length - 5} more
        </p>
      )}
    </div>
  );
}
