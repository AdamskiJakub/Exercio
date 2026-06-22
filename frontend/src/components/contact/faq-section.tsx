"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fadeInUp } from "@/lib/animations";

const FAQ_ITEMS = [
  { key: "bookTrainer" },
  { key: "cancelBooking" },
  { key: "becomeTrainer" },
  { key: "profileNotVisible" },
  { key: "paymentMethods" },
  { key: "contactSupport" },
] as const;

export function FAQSection() {
  const t = useTranslations("Contact");

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="w-full max-w-3xl mx-auto px-4 md:px-6"
      aria-label={t("faqTitle")}
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {t("faqTitle")}
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          {t("faqSubtitle")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-1">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.key} value={item.key}>
              <AccordionTrigger className="px-4 text-base">
                {t(`faq.${item.key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="px-4 leading-relaxed">
                {t(`faq.${item.key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}
