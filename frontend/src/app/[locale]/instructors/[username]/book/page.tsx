"use client";

import { notFound, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { resolveApiBaseUrl } from "@/lib/utils/api-url";
import type { InstructorProfile } from "@/types";

interface BookingPageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const searchParams = useSearchParams();
  const t = useTranslations("Booking");
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [resolvedParams, setResolvedParams] = useState<{
    username: string;
  } | null>(null);

  // Resolve params promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch instructor profile
  useEffect(() => {
    if (!resolvedParams?.username) return;

    const fetchProfile = async () => {
      try {
        const apiUrl = resolveApiBaseUrl();
        const response = await fetch(
          `${apiUrl}/instructor-profiles/${resolvedParams.username}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          setProfile(null);
          return;
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch instructor profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams?.username]);

  // Read initial date/time from URL params for calendar preselect
  const initialDate = searchParams?.get("date") ?? undefined;
  const initialTime = searchParams?.get("time") ?? undefined;

  // Auto-scroll to calendar when loaded with date/time params
  useEffect(() => {
    if (!loading && profile && (initialDate || initialTime)) {
      // Small delay to let the calendar render
      const timer = setTimeout(() => {
        calendarRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, profile, initialDate, initialTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 px-4">
        <div className="max-w-4xl mx-auto flex justify-center items-center min-h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  if (!profile.isBookingEnabled) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {t("bookingNotEnabled")}
            </h1>
            <p className="text-slate-400">
              {t("bookingNotEnabledDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fullName =
    profile.user?.firstName && profile.user?.lastName
      ? `${profile.user.firstName} ${profile.user.lastName}`
      : profile.user?.username || "Instructor";

  const firstName =
    profile.user?.firstName || profile.user?.username || "Instruktor";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
            <span className="text-white">{t("bookSessionWith")} </span>
            <span className="bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="text-slate-400 text-center">{t("selectDateAndTime")}</p>
        </div>

        {/* Session Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-2">
              {t("sessionDuration")}
            </p>
            <p className="text-2xl font-bold text-orange-500">
              {profile.sessionDuration || 60} min
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-2">{t("sessionPrice")}</p>
            <p className="text-2xl font-bold text-orange-500">
              {profile.sessionPrice || profile.hourlyRate || 0} zł
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-2">{t("minNotice")}</p>
            <p className="text-2xl font-bold text-orange-500">
              {profile.minNoticeHours
                ? `${Math.floor(profile.minNoticeHours / 24)} ${t("days")}`
                : t("sameDay")}
            </p>
          </div>
        </div>

        {/* Booking Calendar */}
        <div ref={calendarRef} id="booking-calendar" className="scroll-mt-24">
          <BookingCalendar
            instructorId={profile.id}
            instructorProfile={profile}
            initialDate={initialDate}
            initialTime={initialTime}
          />
        </div>
      </div>
    </div>
  );
}
