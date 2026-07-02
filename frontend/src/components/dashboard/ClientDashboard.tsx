"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { useMyBookings } from "@/hooks/useMyBookings";
import { usePendingReviews } from "@/hooks/useReviews";
import { useReviewFlow } from "@/hooks/useReviewFlow";
import {
  Calendar,
  Heart,
  MessageSquare,
  Star,
  FileText,
  TrendingUp,
  Settings,
  Clock,
  UserCheck,
  MapPin,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { DashboardCard } from "./DashboardCard";
import { EmptyStateCard } from "./EmptyStateCard";
import { DashboardHeader } from "./DashboardHeader";
import { PendingReviewsSection } from "./PendingReviewsSection";
import { MyReviewsSection } from "./MyReviewsSection";
import { BookingHistorySection } from "./BookingHistorySection";
import { FavoriteTrainersSection } from "./FavoriteTrainersSection";
import { BookingsList } from "@/components/bookings/BookingsList";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useClearHistory } from "@/hooks/useClearHistory";
import { useMyFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useState, useMemo } from "react";
import { useSpecializations } from "@/hooks/useConfig";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { scrollToSection } from "@/lib/utils/scroll";
import { getInstructorName } from "@/lib/utils/user";
import { getMediaUrl } from "@/lib/utils/media";
import Link from "next/link";
import { format, isToday, parseISO, isThisWeek } from "date-fns";
import { pl } from "date-fns/locale";

export function ClientDashboard() {
  const t = useTranslations("Dashboard.client");
  const locale = useLocale();
  const { specializations } = useSpecializations();
  const tb = useTranslations("Booking");
  const { user } = useAuthStore();
  const { data: bookings, isLoading: bookingsLoading } =
    useMyBookings("client");
  const { data: pendingReviews, isLoading: pendingReviewsLoading } =
    usePendingReviews();
  const { data: favorites } = useMyFavorites();
  const { data: recentlyViewed, isLoading: recentlyViewedLoading } =
    useRecentlyViewed();
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
  // Use a function to get current time on each render to avoid stale "now" values
  const upcomingBookings = useMemo(
    () =>
      bookings?.filter(
        (booking) =>
          (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
          new Date(booking.startTime) > new Date(),
      ) || [],
    [bookings],
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
    favoriteTrainers: favorites?.length || 0,
    pendingReviews: pendingReviewCount,
  };

  // Dynamic welcome subtitle — three states: today, this week, or free
  const welcomeSubtitle = useMemo(() => {
    if (upcomingBookings.length === 0) {
      return t("welcomeFree");
    }

    const nextBooking = upcomingBookings[0];
    const bookingDate = parseISO(nextBooking.startTime);
    const bookingTime = format(bookingDate, "HH:mm");
    const dateLocale = locale === "pl" ? pl : undefined;

    // State 1: Training TODAY
    if (isToday(bookingDate)) {
      return t("welcomeToday", {
        name: user?.firstName || "",
        trainer: getInstructorName(nextBooking),
        time: bookingTime,
      });
    }

    // State 2: Training THIS WEEK
    if (isThisWeek(bookingDate)) {
      const dayName = format(bookingDate, "EEEE", { locale: dateLocale });
      return t("welcomeThisWeek", {
        count: upcomingBookings.length,
        day: dayName,
        time: bookingTime,
      });
    }

    // State 3: No plans in the near future
    return t("welcomeFree");
  }, [upcomingBookings, t, locale, user?.firstName]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <DashboardHeader
        greeting={`${t("welcomeBack")}${user?.firstName ? `, ${user.firstName}` : ""} 👋`}
        subtitle={welcomeSubtitle}
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
          onClick={() => scrollToSection("my-reviews")}
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

        {/* My Reviews (already written) */}
        <div id="my-reviews">
          <DashboardCard
            icon={Star}
            iconColor="text-amber-500"
            iconBgColor="bg-amber-500/10"
            title={t("myReviews")}
            delay={5}
          >
            <MyReviewsSection />
          </DashboardCard>
        </div>

        {/* Favorite Trainers */}
        <DashboardCard
          icon={Heart}
          iconColor="text-pink-500"
          iconBgColor="bg-pink-500/10"
          title={t("favoriteTrainers")}
          delay={6}
        >
          <FavoriteTrainersSection favorites={favorites} isLoading={false} />
        </DashboardCard>

        {/* Recently Viewed Trainers */}
        <DashboardCard
          icon={Clock}
          iconColor="text-cyan-500"
          iconBgColor="bg-cyan-500/10"
          title={t("recentlyViewed")}
          delay={7}
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
                    href={`/instructors/${instructor.username}`}
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
