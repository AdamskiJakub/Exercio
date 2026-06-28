"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Bell,
  User,
  LayoutDashboard,
  LogOut,
  Calendar,
  Star,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { useMyInstructorProfile } from "@/hooks/useMyInstructorProfile";
import { usePendingReviews } from "@/hooks/useReviews";
import { useQuery } from "@tanstack/react-query";
import { getMediaUrl } from "@/lib/utils/media";
import { scrollToSection } from "@/lib/utils/scroll";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { UserInfo } from "@/components/layout/UserInfo";
import { NotificationItem } from "@/components/layout/NotificationItem";
import { NavItem } from "@/components/layout/NavItem";
import type { Booking } from "@/hooks/useMyBookings";

export function UserMenu() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslations("Common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: instructorProfile } = useMyInstructorProfile({
    enabled: isAuthenticated && user?.role === "INSTRUCTOR",
  });

  // Pending bookings count (always fetch for instructors)
  const { data: instructorBookings } = useQuery({
    queryKey: ["bookings", "my", "instructor"],
    queryFn: async () => {
      const response = await apiClient.get("/bookings/my?role=instructor");
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "INSTRUCTOR",
  });

  // Client bookings — used to detect cancelled bookings for all authenticated users
  const { data: clientBookings } = useQuery({
    queryKey: ["bookings", "my", "client"],
    queryFn: async () => {
      const response = await apiClient.get("/bookings/my?role=client");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Pending reviews count (for all authenticated users - instructors can also be clients)
  const { data: pendingReviews } = usePendingReviews();

  // --- Notification read tracking (like Facebook) ---
  // We store the last time the user opened the notification dropdown in localStorage.
  // The badge count only shows notifications created AFTER that timestamp.
  // Key is per-user so switching accounts doesn't carry over read state.
  const NOTIFICATION_READ_KEY = `notificationsReadAt_${user?.id || "anonymous"}`;

  const [lastReadTime, setLastReadTime] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem(NOTIFICATION_READ_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const markNotificationsRead = () => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    localStorage.setItem(NOTIFICATION_READ_KEY, String(now));
    setLastReadTime(now);
  };

  // Count only unread notifications (created after lastReadTime)
  const unreadBookingCount =
    instructorBookings?.filter((b: Booking) => {
      if (b.status !== "PENDING") return false;
      const createdAt = new Date(b.createdAt).getTime();
      return createdAt > lastReadTime;
    }).length || 0;

  const unreadReviewCount =
    pendingReviews?.filter((r) => {
      const createdAt = new Date(r.createdAt).getTime();
      return createdAt > lastReadTime;
    }).length || 0;

  // Cancelled bookings count — detect recently cancelled bookings for all users
  // Check both instructor and client bookings for cancelled status.
  // Skip self-cancellations: if the user cancelled their own session, don't notify them.
  const cancelledFromInstructor =
    instructorBookings?.filter((b: Booking) => {
      if (b.status !== "CANCELLED") return false;
      // Skip if the instructor cancelled their own session
      if (b.cancelledBy === "instructor") return false;
      const cancelledAt = b.cancelledAt
        ? new Date(b.cancelledAt).getTime()
        : new Date(b.updatedAt).getTime();
      return cancelledAt > lastReadTime;
    }) || [];

  const cancelledFromClient =
    clientBookings?.filter((b: Booking) => {
      if (b.status !== "CANCELLED") return false;
      // Skip if the client cancelled their own session
      if (b.cancelledBy === "client") return false;
      const cancelledAt = b.cancelledAt
        ? new Date(b.cancelledAt).getTime()
        : new Date(b.updatedAt).getTime();
      return cancelledAt > lastReadTime;
    }) || [];

  // Deduplicate by id (a booking can appear in both lists for instructor+client users)
  const unreadCancelledCount = Array.from(
    new Map(
      [...cancelledFromInstructor, ...cancelledFromClient].map((b: Booking) => [
        b.id,
        b,
      ]),
    ).values(),
  ).length;

  // Total unread notifications
  const notificationCount =
    (user?.role === "INSTRUCTOR" ? unreadBookingCount : 0) +
    unreadReviewCount +
    unreadCancelledCount;

  const avatarUrl =
    user?.role === "INSTRUCTOR" && instructorProfile?.photoUrl
      ? getMediaUrl(instructorProfile.photoUrl)
      : user?.avatarUrl
        ? getMediaUrl(user.avatarUrl)
        : undefined;

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      queryClient.clear();
      logout();
      setMobileMenuOpen(false);
      router.push("/");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Notification Bell Dropdown - like Facebook */}
        <DropdownMenu onOpenChange={(open) => !open && markNotificationsRead()}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-slate-800 transition-colors outline-none"
              aria-label={t("notifications") || "Notifications"}
            >
              <Bell
                className={cn(
                  "size-5",
                  notificationCount > 0
                    ? "text-orange-500 animate-pulse"
                    : "text-slate-500",
                )}
              />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            variant="bordered"
            className="w-80 p-0 overflow-visible"
          >
            <DropdownMenuLabel className="font-normal px-4 py-3 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {t("notifications") || "Notifications"}
                </span>
                {notificationCount > 0 && (
                  <span className="text-xs text-slate-400">
                    {notificationCount}{" "}
                    {notificationCount === 1
                      ? t("notificationSingular") || "new"
                      : t("notificationPlural") || "new"}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>

            <div className="max-h-80 overflow-y-auto">
              {/* Pending bookings (instructor only) — scrolls to upcoming-sections */}
              {user?.role === "INSTRUCTOR" && unreadBookingCount > 0 && (
                <NotificationItem
                  icon={
                    <div className="p-1.5 rounded-full bg-blue-500/10">
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                  }
                  title={t("pendingBookings") || "New Booking Requests"}
                  description={`${unreadBookingCount} ${
                    unreadBookingCount === 1
                      ? t("pendingBookingSingular") || "pending request"
                      : t("pendingBookingPlural") || "pending requests"
                  }`}
                  onClick={() => {
                    router.push("/dashboard");
                    setTimeout(() => scrollToSection("upcoming-sections"), 100);
                  }}
                />
              )}

              {/* Pending reviews (all users) — scrolls to pending-reviews-section */}
              {unreadReviewCount > 0 && (
                <NotificationItem
                  icon={
                    <div className="p-1.5 rounded-full bg-amber-500/10">
                      <Star className="w-4 h-4 text-amber-400" />
                    </div>
                  }
                  title={t("pendingReviews") || "Reviews to Leave"}
                  description={`${unreadReviewCount} ${
                    unreadReviewCount === 1
                      ? t("pendingReviewSingular") || "review to give"
                      : t("pendingReviewPlural") || "reviews to give"
                  }`}
                  onClick={() => {
                    router.push("/dashboard");
                    setTimeout(
                      () =>
                        scrollToSection(
                          user?.role === "INSTRUCTOR"
                            ? "my-pending-reviews"
                            : "pending-reviews-section",
                        ),
                      100,
                    );
                  }}
                />
              )}

              {/* Cancelled bookings (all users) — scrolls to booking history */}
              {unreadCancelledCount > 0 && (
                <NotificationItem
                  icon={
                    <div className="p-1.5 rounded-full bg-red-500/10">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                  }
                  title={t("cancelledBookings") || "Cancelled Sessions"}
                  description={`${unreadCancelledCount} ${
                    unreadCancelledCount === 1
                      ? t("cancelledBookingSingular") || "cancelled session"
                      : t("cancelledBookingPlural") || "cancelled sessions"
                  }`}
                  onClick={() => {
                    router.push("/dashboard");
                    setTimeout(
                      () =>
                        scrollToSection(
                          user?.role === "INSTRUCTOR"
                            ? "my-client-history"
                            : "booking-history",
                        ),
                      100,
                    );
                  }}
                />
              )}

              {/* Empty state — show when no unread notifications */}
              {notificationCount === 0 && (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {t("noNotifications") || "No new notifications"}
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Desktop Dropdown Menu */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative rounded-full outline-none"
              >
                <UserAvatar
                  src={avatarUrl}
                  alt={user.email}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  showChevron
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              variant="bordered"
              className="w-64"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 p-2">
                  <UserAvatar
                    src={avatarUrl}
                    alt={user.email}
                    firstName={user.firstName}
                    lastName={user.lastName}
                  />
                  <UserInfo
                    firstName={user.firstName}
                    lastName={user.lastName}
                    email={user.email}
                  />
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-700" />

              <DropdownMenuItem
                asChild
                className="cursor-pointer text-slate-200"
              >
                <NavItem
                  href="/dashboard"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label={t("dashboard")}
                />
              </DropdownMenuItem>

              {user.role === "INSTRUCTOR" && (
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-slate-200"
                >
                  <NavItem
                    href="/dashboard/profile"
                    icon={<User className="h-4 w-4" />}
                    label={t("editProfile")}
                  />
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-slate-700" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-red-900/30! hover:text-red-300! focus:bg-red-900/30! focus:text-red-300!"
              >
                <LogOut className="text-red-400" />
                <span className="font-medium text-red-400">{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Sheet Menu */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="relative rounded-full outline-none"
        >
          <UserAvatar
            src={avatarUrl}
            alt={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
            showChevron
          />
        </button>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="right"
            className="w-3/4 bg-slate-900 border-l-2 border-slate-700 p-0"
          >
            <SheetHeader className="border-b border-slate-700 p-6">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={avatarUrl}
                  alt={user.email}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="lg"
                />
                <div className="flex flex-col overflow-hidden text-left">
                  <SheetTitle className="text-base font-semibold text-slate-100 truncate">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email.split("@")[0]}
                  </SheetTitle>
                  <p className="text-sm text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col justify-between h-[calc(100%-120px)]">
              <div className="flex flex-col p-4 space-y-2">
                <NavItem
                  href="/dashboard"
                  icon={<LayoutDashboard className="h-5 w-5" />}
                  label={t("dashboard")}
                  variant="sheet"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {user.role === "INSTRUCTOR" && (
                  <NavItem
                    href="/dashboard/profile"
                    icon={<User className="h-5 w-5" />}
                    label={t("editProfile")}
                    variant="sheet"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                )}
              </div>

              <div className="p-4 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold">{t("logout")}</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
