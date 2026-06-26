"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronDown,
  Calendar,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { useMyInstructorProfile } from "@/hooks/useMyInstructorProfile";
import { usePendingReviews } from "@/hooks/useReviews";
import { useQuery } from "@tanstack/react-query";
import { getMediaUrl } from "@/lib/utils/media";
import { scrollToSection } from "@/lib/utils/scroll";

function getInitials(
  firstName: string | null,
  lastName: string | null,
): string {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "?";
}

export function UserMenu() {
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

  // Pending reviews count (for all authenticated users - instructors can also be clients)
  const { data: pendingReviews } = usePendingReviews();

  const pendingBookingCount =
    instructorBookings?.filter((b: any) => b.status === "PENDING").length || 0;
  const pendingReviewCount = pendingReviews?.length || 0;

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
    instructorBookings?.filter((b: any) => {
      if (b.status !== "PENDING") return false;
      const createdAt = new Date(b.createdAt).getTime();
      return createdAt > lastReadTime;
    }).length || 0;

  const unreadReviewCount =
    pendingReviews?.filter((r: any) => {
      const createdAt = new Date(r.createdAt).getTime();
      return createdAt > lastReadTime;
    }).length || 0;

  // Total unread notifications
  const notificationCount =
    (user?.role === "INSTRUCTOR" ? unreadBookingCount : 0) + unreadReviewCount;

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
                <div
                  className="px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-700/50 cursor-pointer"
                  onClick={() => {
                    router.push("/dashboard");
                    setTimeout(() => scrollToSection("upcoming-sections"), 100);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-blue-500/10 shrink-0">
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {t("pendingBookings") || "New Booking Requests"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {unreadBookingCount}{" "}
                        {unreadBookingCount === 1
                          ? t("pendingBookingSingular") || "pending request"
                          : t("pendingBookingPlural") || "pending requests"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending reviews (all users) — scrolls to pending-reviews-section */}
              {unreadReviewCount > 0 && (
                <div
                  className="px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-700/50 cursor-pointer"
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
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-amber-500/10 shrink-0">
                      <Star className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {t("pendingReviews") || "Reviews to Leave"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {unreadReviewCount}{" "}
                        {unreadReviewCount === 1
                          ? t("pendingReviewSingular") || "review to give"
                          : t("pendingReviewPlural") || "reviews to give"}
                      </p>
                    </div>
                  </div>
                </div>
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

        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative rounded-full outline-none"
              >
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-slate-700 hover:border-orange-500 transition-colors">
                  <AvatarImage src={avatarUrl} alt={user.email} />
                  <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 bg-slate-800 rounded-full p-0.5 border border-slate-700">
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              variant="bordered"
              className="w-64"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-10 w-10 border-2 border-slate-700">
                    <AvatarImage src={avatarUrl} alt={user.email} />
                    <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold text-sm">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 overflow-hidden">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-700" />

              <DropdownMenuItem
                asChild
                className="cursor-pointer text-slate-200"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="text-slate-400" />
                  <span>{t("dashboard")}</span>
                </Link>
              </DropdownMenuItem>

              {user.role === "INSTRUCTOR" && (
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-slate-200"
                >
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2"
                  >
                    <User className="text-slate-400" />
                    <span>{t("editProfile")}</span>
                  </Link>
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

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="relative rounded-full outline-none"
        >
          <Avatar className="h-10 w-10 cursor-pointer border-2 border-slate-700 active:border-orange-500 transition-colors">
            <AvatarImage src={avatarUrl} alt={user.email} />
            <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 bg-slate-800 rounded-full p-0.5 border border-slate-700">
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>
        </button>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="right"
            className="w-3/4 bg-slate-900 border-l-2 border-slate-700 p-0"
          >
            <SheetHeader className="border-b border-slate-700 p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-slate-700">
                  <AvatarImage src={avatarUrl} alt={user.email} />
                  <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
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
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-slate-400" />
                  <span className="font-medium">{t("dashboard")}</span>
                </Link>

                {user.role === "INSTRUCTOR" && (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">{t("editProfile")}</span>
                  </Link>
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
