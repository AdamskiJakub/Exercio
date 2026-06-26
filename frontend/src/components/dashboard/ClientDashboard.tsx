"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { useMyBookings } from "@/hooks/useMyBookings";
import { usePendingReviews } from "@/hooks/useReviews";
import { useReviewFlow } from "@/hooks/useReviewFlow";
import { motion } from "framer-motion";
import { titleVariants } from "@/lib/animations";
import {
  Calendar,
  Heart,
  MessageSquare,
  Star,
  Search,
  FileText,
  TrendingUp,
  Settings,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { DashboardCard } from "./DashboardCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { BookingsList } from "@/components/bookings/BookingsList";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useClearHistory } from "@/hooks/useClearHistory";
import { useState, useMemo } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { cn } from "@/lib/utils";
import { PaginationSection } from "@/components/instructors/pagination-section";
import { scrollToSection } from "@/lib/utils/scroll";

export function ClientDashboard() {
  const t = useTranslations("Dashboard.client");
  const tb = useTranslations("Booking");
  const { user } = useAuthStore();
  const { data: bookings, isLoading: bookingsLoading } =
    useMyBookings("client");
  const { data: pendingReviews } = usePendingReviews();
  const clearHistory = useClearHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Review flow state & handlers (shared with InstructorDashboard)
  const {
    reviewFormOpen,
    selectedBookingForReview,
    reviewIndex,
    handleOpenReview,
    handleReviewSuccess,
    handleReviewClose,
  } = useReviewFlow();
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 5;

  // Filter bookings
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

  const completedBookings = useMemo(
    () => bookings?.filter((booking) => booking.status === "COMPLETED") || [],
    [bookings],
  );

  const pastBookings = useMemo(
    () =>
      bookings?.filter(
        (booking) =>
          booking.status === "COMPLETED" || booking.status === "CANCELLED",
      ) || [],
    [bookings],
  );

  // Pagination for booking history
  const historyTotalPages = Math.max(
    1,
    Math.ceil(pastBookings.length / HISTORY_PAGE_SIZE),
  );
  const paginatedPastBookings = pastBookings.slice(
    (historyPage - 1) * HISTORY_PAGE_SIZE,
    historyPage * HISTORY_PAGE_SIZE,
  );

  // Completed bookings without reviews = pending review count
  const pendingReviewCount = pendingReviews?.length || 0;

  const stats = {
    upcomingBookings: upcomingBookings.length,
    completedSessions: completedBookings.length,
    favoriteTrainers: 0,
    pendingReviews: pendingReviewCount,
  };

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="text-center space-y-6 py-8">
        <div className="space-y-3">
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold text-gradient-trainly"
          >
            {t("welcomeBack")}
            {user?.firstName ? `, ${user.firstName}` : ""}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            {t("findAndBook")}
          </motion.p>
        </div>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
          >
            <Settings className="w-5 h-5" />
            {t("accountSettings")}
          </Link>
        </motion.div>
      </div>

      {/* Review Banner - Opens review modal for the first pending review */}
      {pendingReviewCount > 0 && pendingReviews && pendingReviews[0] && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Star className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {t("reviewBannerTitle")}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {pendingReviewCount} {t("reviewCompletedSessions")}
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
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {t("reviewBannerAction")}
          </button>
        </motion.div>
      )}

      {/* Quick Stats - Clickable via scroll */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={Calendar}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
          title={t("upcomingBookings")}
          value={stats.upcomingBookings}
          subtitle={t("nextWeek")}
          delay={0}
          onClick={() => scrollToSection("upcoming-sessions")}
        />
        <StatsCard
          icon={TrendingUp}
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-500/10"
          title={t("completedSessions")}
          value={stats.completedSessions}
          subtitle={t("allTime")}
          delay={1}
          onClick={() => scrollToSection("booking-history")}
        />
        <StatsCard
          icon={Star}
          iconColor="text-amber-500"
          iconBgColor="bg-amber-500/10"
          title={t("pendingReviews")}
          value={stats.pendingReviews}
          subtitle={t("reviewsToGive")}
          delay={2}
          onClick={() => scrollToSection("pending-reviews-section")}
        />
        <StatsCard
          icon={Heart}
          iconColor="text-pink-500"
          iconBgColor="bg-pink-500/10"
          title={t("favoriteTrainers")}
          value={stats.favoriteTrainers}
          subtitle={t("saved")}
          delay={3}
          href="/instructors"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming Sessions */}
        <div id="upcoming-sessions">
          <DashboardCard
            icon={Calendar}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-500/10"
            title={t("upcomingSessions")}
            delay={4}
          >
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : upcomingBookings.length > 0 ? (
              <BookingsList bookings={upcomingBookings} role="client" />
            ) : (
              <EmptyStateCard
                icon={Calendar}
                title={t("noUpcomingSessions")}
                description={t("sessionsComingSoon")}
              />
            )}
          </DashboardCard>
        </div>

        {/* Reviews to Give */}
        <div id="pending-reviews-section">
          <DashboardCard
            icon={Star}
            iconColor="text-amber-500"
            iconBgColor="bg-amber-500/10"
            title={t("pendingReviews")}
            delay={5}
          >
            {pendingReviewCount > 0 ? (
              <div className="space-y-2">
                {pendingReviews?.slice(0, 3).map((review) => (
                  <div
                    key={review.bookingId}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {review.instructorName}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {new Date(review.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleOpenReview(
                          review.bookingId,
                          review.instructorName,
                          pendingReviews.indexOf(review),
                        )
                      }
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors ml-2 whitespace-nowrap"
                    >
                      {t("leaveReview")}
                    </button>
                  </div>
                ))}
                {pendingReviews && pendingReviews.length > 3 && (
                  <p className="text-center text-xs text-slate-500">
                    {t("moreReviews", { count: pendingReviews.length - 3 })}
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

        {/* Messages */}
        <DashboardCard
          icon={MessageSquare}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
          title={t("messages")}
          delay={6}
        >
          <EmptyStateCard
            icon={MessageSquare}
            title={t("noMessages")}
            description={t("messagesComingSoon")}
          />
        </DashboardCard>

        {/* Find Trainers CTA */}
        <DashboardCard
          icon={Search}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-500/10"
          title={t("findTrainers")}
          delay={7}
        >
          <>
            <p className="text-slate-400 mb-auto">{t("browseDescription")}</p>
            <Link
              href="/instructors"
              className="inline-block px-6 py-3 text-center bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all mt-4"
            >
              {t("browseTrainers")}
            </Link>
          </>
        </DashboardCard>
      </div>

      {/* Booking History with Review CTAs */}
      <div id="booking-history" className="scroll-mt-20">
        <DashboardCard
          icon={FileText}
          iconColor="text-slate-400"
          title={t("bookingHistory")}
          delay={8}
        >
          {bookingsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : pastBookings.length > 0 ? (
            <>
              <div className="flex justify-end mb-4">
                <button
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                  onClick={() => setConfirmOpen(true)}
                >
                  {t("clearHistory")}
                </button>
              </div>
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
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {instructorName}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {new Date(booking.startTime).toLocaleDateString()} -{" "}
                            {new Date(booking.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-xs font-medium mt-1",
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
                        {needsReview && (
                          <button
                            onClick={() =>
                              handleOpenReview(booking.id, instructorName)
                            }
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5"
                          >
                            <Star className="w-4 h-4" />
                            {t("leaveReview")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {historyTotalPages > 1 && (
                <div className="mt-4">
                  <PaginationSection
                    page={historyPage}
                    totalPages={historyTotalPages}
                    onPageChange={setHistoryPage}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyStateCard
              icon={FileText}
              title={t("noHistory")}
              description={t("historyDescription")}
            />
          )}
        </DashboardCard>
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
          totalReviews={pendingReviews?.length || 0}
        />
      )}
    </div>
  );
}
