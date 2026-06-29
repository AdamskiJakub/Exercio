"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { useMyBookings } from "@/hooks/useMyBookings";
import type { Booking } from "@/hooks/useMyBookings";
import { usePendingReviews } from "@/hooks/useReviews";
import { useReviewFlow } from "@/hooks/useReviewFlow";
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
import { DashboardHeader } from "./DashboardHeader";
import { PendingReviewsSection } from "./PendingReviewsSection";
import { BookingHistorySection } from "./BookingHistorySection";
import { BookingsList } from "@/components/bookings/BookingsList";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useClearHistory } from "@/hooks/useClearHistory";
import { useState, useMemo } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { scrollToSection } from "@/lib/utils/scroll";
import { getInstructorName } from "@/lib/utils/user";

export function ClientDashboard() {
  const t = useTranslations("Dashboard.client");
  const tb = useTranslations("Booking");
  const { user } = useAuthStore();
  const { data: bookings, isLoading: bookingsLoading } =
    useMyBookings("client");
  const { data: pendingReviews, isLoading: pendingReviewsLoading } =
    usePendingReviews();
  const clearHistory = useClearHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Review flow state & handlers
  const {
    reviewFormOpen,
    selectedBookingForReview,
    reviewIndex,
    handleOpenReview,
    handleReviewSuccess,
    handleReviewClose,
  } = useReviewFlow();

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
      <DashboardHeader
        greeting={`${t("welcomeBack")}${user?.firstName ? `, ${user.firstName}` : ""}!`}
        subtitle={t("findAndBook")}
        actionLinks={[
          {
            href: "/dashboard/settings",
            icon: <Settings className="w-5 h-5" />,
            label: t("accountSettings"),
          },
        ]}
      />

      {/* Review Banner */}
      {pendingReviewCount > 0 && pendingReviews && pendingReviews[0] && (
        <PendingReviewsSection
          pendingReviews={pendingReviews}
          isLoading={false}
          onOpenReview={handleOpenReview}
          t={t}
          variant="client"
        />
      )}

      {/* Quick Stats */}
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
            <PendingReviewsSection
              pendingReviews={pendingReviews}
              isLoading={pendingReviewsLoading}
              onOpenReview={handleOpenReview}
              t={t}
              variant="client"
            />
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

      {/* Booking History */}
      <div id="booking-history" className="scroll-mt-20">
        <DashboardCard
          icon={FileText}
          iconColor="text-slate-400"
          title={t("bookingHistory")}
          delay={8}
        >
          <BookingHistorySection
            bookings={pastBookings}
            isLoading={bookingsLoading}
            pendingReviews={pendingReviews}
            onOpenReview={handleOpenReview}
            getInstructorName={getInstructorName}
            onClearHistory={() => setConfirmOpen(true)}
            tb={tb}
            emptyTitle={t("noHistory")}
            emptyDescription={t("historyDescription")}
            leaveReviewLabel={t("leaveReview")}
            clearHistoryLabel={t("clearHistory")}
          />
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
