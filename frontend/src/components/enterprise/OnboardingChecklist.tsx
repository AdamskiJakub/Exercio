"use client";

import { useTranslations } from "next-intl";
import type { EnterpriseProfile } from "@/types/enterprise";
import {
  BaseOnboardingChecklist,
  type ChecklistItem,
} from "@/components/shared/BaseOnboardingChecklist";

interface OnboardingChecklistProps {
  profile: EnterpriseProfile;
}

export function OnboardingChecklist({ profile }: OnboardingChecklistProps) {
  const t = useTranslations("Dashboard.enterprise");

  const items: ChecklistItem[] = [
    {
      key: "description",
      labelKey: "onboardingDescription",
      href: "/dashboard/enterprise/profile",
      sectionId: "section-description",
      isComplete:
        !!profile.shortDescription && profile.shortDescription.length > 0,
    },
    {
      key: "logo",
      labelKey: "onboardingLogo",
      href: "/dashboard/enterprise/profile",
      sectionId: "section-logo",
      isComplete: !!profile.logoUrl,
    },
    {
      key: "businessType",
      labelKey: "onboardingBusinessType",
      href: "/dashboard/enterprise/profile",
      sectionId: "section-business-type",
      isComplete: !!profile.businessType,
    },
    {
      key: "disciplines",
      labelKey: "onboardingDisciplines",
      href: "/dashboard/enterprise/profile",
      sectionId: "section-disciplines",
      isComplete: (profile.disciplines?.length ?? 0) > 0,
    },
    {
      key: "hours",
      labelKey: "onboardingHours",
      href: "/dashboard/enterprise/profile",
      sectionId: "section-hours",
      isComplete:
        profile.openingHours != null &&
        Object.keys(profile.openingHours).length > 0,
    },
    {
      key: "publish",
      labelKey: "onboardingPublish",
      href: "/dashboard/enterprise/profile",
      isComplete: !profile.isDraft,
    },
  ];

  return (
    <BaseOnboardingChecklist
      items={items}
      translationsNamespace="Dashboard.enterprise"
      colorScheme="emerald"
    />
  );
}
