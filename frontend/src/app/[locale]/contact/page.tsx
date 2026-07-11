"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { HelpCategories } from "@/components/contact/help-categories";
import { FAQSection } from "@/components/contact/faq-section";
import { ContactForm } from "@/components/contact/contact-form";
import { useEscapeKey } from "@/lib/hooks";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedCategory("");
  }, []);

  // Deselect on Escape key
  useEscapeKey(handleDeselect, !!selectedCategory);

  return (
    <div className="min-h-screen">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-150 bg-orange-500/3 rounded-full blur-3xl" />
        </div>

        <div className="relative pt-20 pb-16 md:pt-28 md:pb-20">
          {/* Hero Section */}
          <div className="px-4 md:px-6 mb-12 md:mb-16">
            <div className="flex justify-center mb-4">
              <div className="p-2.5 rounded-xl bg-linear-to-br from-orange-500/10 to-red-500/10">
                <MessageCircle className="size-6 text-orange-400" />
              </div>
            </div>
            <PageHeader
              title={t("heroTitle")}
              subtitle={t("heroSubtitle")}
              variant="gradient-orange"
              align="center"
              showBlur
            />
          </div>

          {/* Help Categories */}
          <div className="mb-8 md:mb-10">
            <HelpCategories
              onSelectCategory={handleSelectCategory}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Contact Form (visible only when a category is selected) */}
          <div className="mb-12 md:mb-16">
            <ContactForm preselectedCategory={selectedCategory} />
          </div>

          {/* FAQ Section */}
          <div className="pb-16 md:pb-20">
            <FAQSection />
          </div>
        </div>
      </div>
    </div>
  );
}
