"use client";

import {
  Star,
  FileText,
  List,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { EmptyStateCard } from "./EmptyStateCard";
import { PaginationSection } from "@/components/instructors/pagination-section";
import type { Booking } from "@/hooks/useMyBookings";
import type { PendingReview } from "@/hooks/useReviews";

type BookingTab = "instructor" | "client";

type StatusFilter = "all" | "upcoming" | "completed" | "cancelled";

const STATUS_FILTERS: {
  key: StatusFilter;
  icon: React.ReactNode;
  labelKey: string;
}[] = [
  { key: "all", icon: <List className="w-3.5 h-3.5" />, labelKey: "all" },
  {
    key: "upcoming",
    icon: <Calendar className="w-3.5 h-3.5" />,
    labelKey: "upcoming",
  },
  {
    key: "completed",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    labelKey: "completed",
  },
  {
    key: "cancelled",
    icon: <XCircle className="w-3.5 h-3.5" />,
    labelKey: "cancelled",
  },
];

interface BookingTabConfig {
  /** Label for the tab button */
  label: string;
  /** Icon for the tab button */
  icon: React.ReactNode;
}

interface BookingHistorySectionProps {
  /** Bookings to display (used when no tabs are provided) */
  bookings?: Booking[];
  /** Bookings where user was the instructor (used with tabs) */
  instructorBookings?: Booking[];
  /** Bookings where user was the client (used with tabs) */
  clientBookings?: Booking[];
  isLoading: boolean;
  pendingReviews: PendingReview[] | undefined;
  onOpenReview: (bookingId: string, instructorName: string) => void;
  getInstructorName: (booking: Booking) => string;
  onClearHistory?: () => void;
  /** Translation function for booking status labels (e.g. "completed", "cancelled") */
  tb: (key: string, params?: Record<string, string | number | Date>) => string;
  /** Text for the empty state title */
  emptyTitle: string;
  /** Text for the empty state description */
  emptyDescription: string;
  /** Text for the "Leave Review" button */
  leaveReviewLabel?: string;
  /** Text for the "Clear History" button */
  clearHistoryLabel?: string;
  pageSize?: number;
  /** Optional tab configuration for showing both instructor and client history */
  tabs?: Record<BookingTab, BookingTabConfig>;
  /** Active tab (controlled) */
  activeTab?: BookingTab;
  /** Tab change handler (controlled) */
  onTabChange?: (tab: BookingTab) => void;
}

export function BookingHistorySection({
  bookings,
  instructorBookings,
  clientBookings,
  isLoading,
  pendingReviews,
  onOpenReview,
  getInstructorName,
  onClearHistory,
  tb,
  emptyTitle,
  emptyDescription,
  leaveReviewLabel = "Wystaw opinię",
  clearHistoryLabel = "Wyczyść historię",
  pageSize = 5,
  tabs,
  activeTab: controlledTab,
  onTabChange,
}: BookingHistorySectionProps) {
  const [internalTab, setInternalTab] = useState<BookingTab>("instructor");
  const [historyPage, setHistoryPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Determine which bookings to show based on tab mode
  const isTabbed = !!tabs;
  const activeTab = isTabbed ? (controlledTab ?? internalTab) : "instructor";

  const currentBookings = isTabbed
    ? activeTab === "instructor"
      ? (instructorBookings ?? [])
      : (clientBookings ?? [])
    : (bookings ?? []);

  // Apply status filter
  const filteredBookings = useMemo(() => {
    const now = new Date();
    switch (statusFilter) {
      case "upcoming":
        return currentBookings.filter(
          (b) =>
            (b.status === "PENDING" || b.status === "CONFIRMED") &&
            new Date(b.startTime) > now,
        );
      case "completed":
        return currentBookings.filter((b) => b.status === "COMPLETED");
      case "cancelled":
        return currentBookings.filter((b) => b.status === "CANCELLED");
      default:
        return currentBookings;
    }
  }, [currentBookings, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const paginatedBookings = filteredBookings.slice(
    (historyPage - 1) * pageSize,
    historyPage * pageSize,
  );

  // Reset page when bookings or tab change
  if (historyPage > totalPages && totalPages > 0) {
    setHistoryPage(1);
  }

  const handleTabChange = (tab: BookingTab) => {
    setHistoryPage(1);
    setStatusFilter("all");
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setHistoryPage(1);
    setStatusFilter(filter);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Tab buttons */}
      {isTabbed && tabs && (
        <div className="flex gap-1 mb-4 bg-slate-700/50 rounded-lg p-1 overflow-x-auto scrollbar-thin">
          {(Object.entries(tabs) as [BookingTab, BookingTabConfig][]).map(
            ([tabKey, config]) => (
              <button
                key={tabKey}
                onClick={() => handleTabChange(tabKey)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap",
                  activeTab === tabKey
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-600/50",
                )}
              >
                {config.icon}
                {config.label}
              </button>
            ),
          )}
        </div>
      )}

      {/* Status filter tabs */}
      {currentBookings.length > 0 && (
        <div className="flex gap-1 mb-4 bg-slate-700/50 rounded-lg p-1 overflow-x-auto scrollbar-thin">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleStatusFilterChange(filter.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center whitespace-nowrap",
                statusFilter === filter.key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-600/50",
              )}
            >
              {filter.icon}
              {tb(filter.labelKey)}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredBookings.length === 0 && (
        <EmptyStateCard
          icon={FileText}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}

      {/* Clear history button — only show on "client" tab when in tabbed mode */}
      {filteredBookings.length > 0 &&
        onClearHistory &&
        (!isTabbed || activeTab === "client") && (
          <div className="flex justify-end mb-4">
            <button
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
              onClick={onClearHistory}
            >
              {clearHistoryLabel}
            </button>
          </div>
        )}

      {/* Booking list */}
      {filteredBookings.length > 0 && (
        <>
          <div className="space-y-3">
            {paginatedBookings.map((booking) => {
              const isCompleted = booking.status === "COMPLETED";
              const isCancelled = booking.status === "CANCELLED";
              const needsReview =
                isCompleted &&
                pendingReviews?.some((pr) => pr.bookingId === booking.id);
              const instructorName = getInstructorName(booking);

              return (
                <div
                  key={booking.id}
                  className={cn(
                    "bg-slate-800/50 rounded-lg p-4 border transition-colors",
                    isCompleted
                      ? "border-emerald-500/20 hover:border-emerald-500/40"
                      : isCancelled
                        ? "border-rose-500/20 hover:border-rose-500/40"
                        : "border-slate-700/50 hover:border-slate-600",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-medium truncate">
                        {instructorName}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {new Date(booking.startTime).toLocaleDateString()} ·{" "}
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs font-medium",
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isCancelled
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-slate-500/10 text-slate-400",
                          )}
                        >
                          {isCompleted
                            ? tb("completed")
                            : isCancelled
                              ? tb("cancelled")
                              : booking.status}
                        </span>
                        {isCancelled && booking.cancellationReason && (
                          <span className="text-xs text-slate-500 italic truncate max-w-62.5">
                            &mdash; {booking.cancellationReason}
                          </span>
                        )}
                      </div>
                    </div>
                    {needsReview && (
                      <button
                        onClick={() => onOpenReview(booking.id, instructorName)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4" />
                        {leaveReviewLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <PaginationSection
                page={historyPage}
                totalPages={totalPages}
                onPageChange={setHistoryPage}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
