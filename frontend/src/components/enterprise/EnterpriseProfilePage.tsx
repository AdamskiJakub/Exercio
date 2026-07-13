"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { EnterpriseHero } from "./EnterpriseHero";
import { EnterpriseInstructors } from "./EnterpriseInstructors";
import { EnterpriseNews } from "./EnterpriseNews";
import { EnterpriseProfileAbout } from "./EnterpriseProfileAbout";
import { EnterpriseProfileHighlightsDisplay } from "./EnterpriseProfileHighlightsDisplay";
import { EnterpriseProfileOffer } from "./EnterpriseProfileOffer";
import { EnterpriseProfilePricingDisplay } from "./EnterpriseProfilePricingDisplay";
import { EnterpriseProfileAmenitiesDisplay } from "./EnterpriseProfileAmenitiesDisplay";
import { EnterpriseProfileFaqDisplay } from "./EnterpriseProfileFaqDisplay";
import { EnterpriseProfileSidebar } from "./EnterpriseProfileSidebar";
import { EnterpriseProfileGallery } from "./EnterpriseProfileGallery";
import { EnterpriseProfileNav } from "./EnterpriseProfileNav";
import { BottomNavBar } from "@/components/ui/bottom-nav-bar";
import { SECTION_IDS } from "@/constants/enterprise";
import type { EnterpriseProfile } from "@/types/enterprise";
import {
  Info,
  Sparkles,
  Building2,
  DollarSign,
  Image as ImageIcon,
  Users,
  Calendar,
} from "lucide-react";

interface EnterpriseProfilePageProps {
  enterprise: EnterpriseProfile;
}

export function EnterpriseProfilePage({
  enterprise,
}: EnterpriseProfilePageProps) {
  const t = useTranslations("EnterpriseProfile");
  const searchParams = useSearchParams();
  const fromDashboard = searchParams.get("from") === "dashboard";
  const [activeSection, setActiveSection] = useState<string>("");

  const navItems = [
    { id: SECTION_IDS.about, label: t("about"), icon: Info },
    { id: SECTION_IDS.instructors, label: t("ourInstructors"), icon: Users },
    { id: SECTION_IDS.news, label: t("news"), icon: Calendar },
    { id: SECTION_IDS.whyUs, label: t("whyUs"), icon: Sparkles },
    { id: SECTION_IDS.offer, label: t("offer"), icon: Building2 },
    { id: SECTION_IDS.pricing, label: t("pricing"), icon: DollarSign },
    { id: SECTION_IDS.gallery, label: t("gallery"), icon: ImageIcon },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Handle hash-based navigation on page load (e.g., /enterprise/slug#news)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          scrollToSection(hash);
        }, 300);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <EnterpriseHero enterprise={enterprise} />

      <EnterpriseProfileNav
        items={navItems}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* Left column (70%) */}
          <div className="space-y-16 min-w-0">
            {/* 1. About — who you are */}
            <EnterpriseProfileAbout enterprise={enterprise} />

            {/* 2. Instructors — people buy from people (trust building) */}
            {enterprise.instructors && enterprise.instructors.length > 0 && (
              <EnterpriseInstructors instructors={enterprise.instructors} />
            )}

            {/* 3. News — shows the profile is alive (hot news, workshops, events) */}
            {enterprise.news && enterprise.news.length > 0 && (
              <EnterpriseNews news={enterprise.news} />
            )}

            {/* 4. Why Us (Highlights) — why choose you */}
            <EnterpriseProfileHighlightsDisplay
              highlights={enterprise.highlights || []}
            />

            {/* 5. Offer — what you offer */}
            <EnterpriseProfileOffer enterprise={enterprise} />

            {/* 6. Pricing — how much (critical decision point) */}
            <EnterpriseProfilePricingDisplay
              pricing={enterprise.pricing || []}
            />

            {/* 7. Amenities */}
            <EnterpriseProfileAmenitiesDisplay enterprise={enterprise} />

            {/* 8. Gallery — visual confirmation of professionalism */}
            <EnterpriseProfileGallery enterprise={enterprise} />

            {/* 9. FAQ — technical questions for almost-decided users */}
            <EnterpriseProfileFaqDisplay faq={enterprise.faq || []} />
          </div>

          {/* Right sidebar (30%) */}
          <EnterpriseProfileSidebar enterprise={enterprise} />
        </div>
      </div>

      <BottomNavBar
        backText={fromDashboard ? t("backToDashboard") : t("backToListing")}
        backHref={fromDashboard ? "/dashboard" : "/instructors"}
      />
    </div>
  );
}
