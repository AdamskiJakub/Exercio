"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Image,
  Search,
  ArrowRight,
  Target,
  Lightbulb,
  Handshake,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const benefits = [
  {
    icon: Building2,
    titleKey: "benefitProfileTitle",
    descKey: "benefitProfileDesc",
  },
  {
    icon: Users,
    titleKey: "benefitInstructorsTitle",
    descKey: "benefitInstructorsDesc",
  },
  {
    icon: Image,
    titleKey: "benefitMediaTitle",
    descKey: "benefitMediaDesc",
  },
  {
    icon: Search,
    titleKey: "benefitSearchTitle",
    descKey: "benefitSearchDesc",
  },
] as const;

const buildingTogetherPoints = [
  "buildingTogetherPoint1",
  "buildingTogetherPoint2",
  "buildingTogetherPoint3",
  "buildingTogetherPoint4",
  "buildingTogetherPoint5",
] as const;

const steps = [
  { step: 1, titleKey: "step1Title", descKey: "step1Desc" },
  { step: 2, titleKey: "step2Title", descKey: "step2Desc" },
  { step: 3, titleKey: "step3Title", descKey: "step3Desc" },
  { step: 4, titleKey: "step4Title", descKey: "step4Desc" },
] as const;

interface PartnerLogo {
  nameKey: string;
  logoSrc: string;
  href?: string;
  bgWhite?: boolean;
}

const partners: PartnerLogo[] = [
  {
    nameKey: "partnerFeniks",
    logoSrc:
      "https://stfeniks.pl/wp-content/uploads/2025/12/logo-stfeniks-pion-dark.png",
    href: "https://stfeniks.pl",
    bgWhite: true,
  },
  {
    nameKey: "partnerFormAnalata",
    logoSrc: "/forma-na-lata-jakub-zolik.jpeg",
    href: "https://formanalata.com/",
    bgWhite: false,
  },
];

export default function PartnerPage() {
  const t = useTranslations("PartnerPage");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
              <Handshake className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">
                {t("badge")}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/enterprise/apply">
                <Button
                  variant="premium"
                  size="xl"
                  className="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-900/30 text-base cursor-pointer"
                >
                  {t("ctaButton")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline-slate"
                  size="xl"
                  className="text-base cursor-pointer"
                >
                  {t("backToRegister")}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section — "Co zyskuje Twoja firma" */}
      <section
        className="py-20 bg-slate-900"
        aria-labelledby="benefits-heading"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              id="benefits-heading"
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {t("benefitsTitle")}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("benefitsSubtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t(benefit.titleKey)}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {t(benefit.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Building Together Section — "Budujemy Exercio razem z pierwszymi Partnerami" */}
      <section
        className="py-20 bg-slate-800/50"
        aria-labelledby="building-heading"
      >
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              id="building-heading"
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {t("buildingTogetherTitle")}
            </h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              {t("buildingTogetherSubtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {buildingTogetherPoints.map((pointKey, index) => (
              <motion.div
                key={index}
                className="flex gap-3 bg-slate-900/50 border border-slate-700/50 rounded-lg p-5 hover:border-emerald-500/30 transition-all"
                variants={fadeInUp}
                custom={index}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm leading-relaxed">
                  {t(pointKey)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Founding Partners Program — wyróżniony box */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative gradient blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {t("founderProgramTitle")}
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
                {t("founderProgramDesc")}
              </p>

              <div className="mt-8">
                <Link href="/enterprise/apply">
                  <Button
                    variant="premium"
                    size="xl"
                    className="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-900/30 text-base cursor-pointer"
                  >
                    {t("ctaButton")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section — "Jak wygląda współpraca" */}
      <section
        className="py-20 bg-slate-800/50"
        aria-labelledby="howitworks-heading"
        id="how-it-works"
      >
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              id="howitworks-heading"
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {t("howItWorksTitle")}
            </h2>
            <p className="text-slate-400 text-lg">{t("howItWorksSubtitle")}</p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="shrink-0 w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-lg">
                    {item.step}
                  </span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-slate-400">{t(item.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section — "Pierwsi Partnerzy Exercio" */}
      <section
        className="py-20 bg-slate-900"
        aria-labelledby="social-proof-heading"
      >
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              id="social-proof-heading"
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {t("socialProofTitle")}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("socialProofSubtitle")}
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-8 md:gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {partners.map((partner, index) => (
              <motion.div key={index} variants={fadeInUp} custom={index}>
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                  <div className="w-36 h-36 md:w-40 md:h-40 rounded-xl border border-transparent overflow-hidden flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/10 group-hover:border-emerald-400/50">
                    <img
                      src={partner.logoSrc}
                      alt={t(partner.nameKey)}
                      className={`w-full h-full object-cover ${
                        partner.bgWhite ? "bg-white" : ""
                      }`}
                      loading="lazy"
                    />
                  </div>
                  <span className="text-slate-300 text-sm font-medium text-center group-hover:text-white transition-colors">
                    {t(partner.nameKey)}
                  </span>
                  <span className="text-emerald-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4" />
                    {t("contactUs")}
                  </span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t("ctaSectionTitle")}
            </h2>
            <p className="text-lg text-emerald-100/80 max-w-xl mx-auto">
              {t("ctaSectionSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/enterprise/apply">
                <Button
                  variant="premium"
                  size="xl"
                  className="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-900/30 text-base cursor-pointer"
                >
                  {t("ctaButton")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline-slate"
                  size="xl"
                  className="border-emerald-400/30 text-emerald-100 hover:bg-emerald-800/50 hover:border-emerald-400/50 text-base cursor-pointer"
                >
                  {t("contactUs")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
