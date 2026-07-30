"use client";

import { useTranslations } from "next-intl";
import type { InstructorListing } from "@/types";
import {
  BaseOnboardingChecklist,
  type ChecklistItem,
} from "@/components/shared/BaseOnboardingChecklist";

interface InstructorOnboardingChecklistProps {
  profile: InstructorListing;
}

export function InstructorOnboardingChecklist({
  profile,
}: InstructorOnboardingChecklistProps) {
  const t = useTranslations("Dashboard.instructor");

  const items: ChecklistItem[] = [
    {
      key: "bio",
      labelKey: "onboardingBio",
      href: "/dashboard/profile/edit",
      sectionId: "section-bio",
      isComplete: !!profile.bio && profile.bio.length > 0,
    },
    {
      key: "photo",
      labelKey: "onboardingPhoto",
      href: "/dashboard/profile/edit",
      sectionId: "section-photo",
      isComplete: !!profile.photoUrl,
    },
    {
      key: "specializations",
      labelKey: "onboardingSpecializations",
      href: "/dashboard/profile/edit",
      sectionId: "section-specializations",
      isComplete: profile.specializations.length > 0,
    },
    {
      key: "rate",
      labelKey: "onboardingRate",
      href: "/dashboard/profile/edit",
      sectionId: "section-rate",
      isComplete:
        (profile.hourlyRate !== null && profile.hourlyRate > 0) ||
        (profile.sessionPrice !== null &&
          profile.sessionPrice !== undefined &&
          profile.sessionPrice > 0),
    },
    {
      key: "availability",
      labelKey: "onboardingAvailability",
      href: "/dashboard/profile/edit",
      sectionId: "section-rate",
      isComplete:
        profile.availability !== null && profile.availability !== undefined,
    },
    {
      key: "publish",
      labelKey: "onboardingPublish",
      href: "/dashboard",
      sectionId: "",
      isComplete: !profile.isDraft,
    },
  ];

  return (
    <BaseOnboardingChecklist
      items={items}
      translationsNamespace="Dashboard.instructor"
      colorScheme="orange"
      recentAccountDays={7}
      createdAt={profile.createdAt}
      hideChevronOnComplete
    />
  );
}
