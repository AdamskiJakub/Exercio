"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format, addDays, parseISO, isPast, isToday } from "date-fns";
import { Calendar, Play, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { InstructorHero } from "./InstructorHero";
import { ExercioHighlights } from "./ExercioHighlights";
import { QuickAvailability } from "./QuickAvailability";
import { FeaturedReview } from "./FeaturedReview";
import { AboutSection } from "./AboutSection";
import { ReviewsSection } from "./ReviewsSection";
import { ContactSection } from "./ContactSection";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { getMediaUrl, isVideoUrl } from "@/lib/utils/media";
import { NAV_SOURCE } from "./types";
import type { InstructorProfile } from "@/types";
import type { CatalogDiscipline } from "@/lib/catalog-types";
import { useDisciplines } from "@/hooks/useCatalog";
import { slugifyCity } from "@/lib/seo/slug-utils";

interface NewPublicInstructorProfileProps {
  profile: InstructorProfile;
  isPreview?: boolean;
  source?: string | null;
  isOwnProfile?: boolean;
}

export function NewPublicInstructorProfile({
  profile,
  isPreview = false,
  source,
  isOwnProfile = false,
}: NewPublicInstructorProfileProps) {
  const t = useTranslations("InstructorProfile");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuthStore();
  const { disciplines } = useDisciplines();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch nearest slot for hero
  const today = new Date();
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(addDays(today, 5), "yyyy-MM-dd");
  const { data: slots } = useAvailableSlots(profile.id, startDate, endDate);

  const nearestSlot = useMemo(() => {
    if (!slots) return null;
    for (const slot of slots) {
      if (!slot.available) continue;
      const slotDate = parseISO(slot.startTime);
      if (isPast(slotDate) && !isToday(slotDate)) continue;
      return {
        date: format(slotDate, "yyyy-MM-dd"),
        time: format(slotDate, "HH:mm"),
      };
    }
    return null;
  }, [slots]);

  const getBackHref = () => {
    if (isOwnProfile && source === NAV_SOURCE.DASHBOARD) {
      return "/dashboard";
    }
    return "/instructors";
  };

  const getBackText = () => {
    if (isOwnProfile && source === NAV_SOURCE.DASHBOARD) {
      return t("backToDashboard");
    }
    return t("backToListing");
  };

  const shouldShowBookingButton =
    profile.user?.username &&
    profile.isBookingEnabled &&
    !isOwnProfile &&
    user?.role !== "ENTERPRISE";

  const handleBookingClick = () => {
    if (!profile.user?.username) return;
    router.push({
      pathname: "/instructors/[username]/book",
      params: { username: profile.user.username },
    });
  };

  // Combine photoUrl and gallery for lightbox
  const allMedia = [
    ...(profile.photoUrl ? [profile.photoUrl] : []),
    ...(profile.gallery || []),
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const hasGallery = profile.gallery && profile.gallery.length > 0;

  // Find the first discipline matching the instructor's primary specialization
  const primarySpecialization = profile.specializations?.[0];
  const matchingDiscipline: CatalogDiscipline | undefined = useMemo(() => {
    if (!primarySpecialization || !disciplines.length) return undefined;
    // First try: direct key match (specialization ID === discipline key)
    const directMatch = disciplines.find(
      (d) => d.key === primarySpecialization,
    );
    if (directMatch) return directMatch;
    // Second try: category match (specialization ID === discipline categoryId)
    return disciplines.find(
      (d) => d.categoryId === `cat_${primarySpecialization}`,
    );
  }, [primarySpecialization, disciplines]);

  // Build SEO link: /{locale}/{citySlug}/{disciplineSlug}
  const disciplineSlug =
    locale === "pl"
      ? matchingDiscipline?.slugs.pl
      : matchingDiscipline?.slugs.en;
  const seoLink =
    profile.city && matchingDiscipline && disciplineSlug
      ? `/${locale}/${slugifyCity(profile.city)}/${disciplineSlug}`
      : null;

  return (
    <>
      <div className="space-y-8">
        {/* Preview Banner */}
        {isPreview && (
          <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
            <p className="text-orange-400 text-sm text-center">
              📝 {t("previewBanner")}
            </p>
          </div>
        )}

        {/* SECTION 1: Hero */}
        <InstructorHero
          profile={profile}
          onBookClick={handleBookingClick}
          nearestSlot={nearestSlot}
        />

        {/* SECTION 2: Exercio Highlights */}
        <ExercioHighlights profile={profile} />

        {/* SECTION 3: Quick Availability - hidden for enterprise accounts */}
        {profile.isBookingEnabled && user?.role !== "ENTERPRISE" && (
          <QuickAvailability
            instructorProfileId={profile.id}
            username={profile.user?.username || ""}
          />
        )}

        {/* SECTION 4: Featured Review (best testimonial) */}
        <FeaturedReview instructorProfileId={profile.id} />

        {/* SECTION 5: About + Specializations */}
        <AboutSection profile={profile} />

        {/* SECTION 6: Media Gallery */}
        {hasGallery && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {t("gallery")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.gallery.map((url, idx) => {
                const galleryIndex = profile.photoUrl ? idx + 1 : idx;
                const isVideo = isVideoUrl(url);

                return (
                  <div
                    key={idx}
                    className="aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity relative"
                    onClick={() => openLightbox(galleryIndex)}
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={getMediaUrl(url)}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                          <div className="bg-white/90 rounded-full p-3">
                            <Play className="size-8 text-slate-900 fill-slate-900" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={getMediaUrl(url)}
                        alt={t("galleryImage", { number: idx + 1 })}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 7: SEO Link — "See all {discipline} in {city}" (subtle, lower on page) */}
        {seoLink && matchingDiscipline && profile.city && (
          <div className="">
            <Link
              href={seoLink}
              className="group inline-flex items-center gap-2 text-sm text-slate-300 hover:text-orange-400 transition-colors"
            >
              <span>
                {locale === "pl"
                  ? `Zobacz wszystkich specjalistów: ${matchingDiscipline.names.pl} — ${profile.city}`
                  : `See all ${matchingDiscipline.names.en} in ${profile.city}`}
              </span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

        {/* SECTION 8: All Reviews */}
        <ReviewsSection instructorProfileId={profile.id} />

        {/* SECTION 9: Contact */}
        <ContactSection profile={profile} />
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={allMedia}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Sticky Bottom CTA */}
      {!isPreview && (
        <BottomNavBar
          backText={getBackText()}
          backHref={getBackHref()}
          actionButton={
            shouldShowBookingButton
              ? {
                  text: t("bookTraining"),
                  icon: <Calendar className="size-5" />,
                  variant: "primary",
                  onClick: handleBookingClick,
                }
              : undefined
          }
        />
      )}
    </>
  );
}
