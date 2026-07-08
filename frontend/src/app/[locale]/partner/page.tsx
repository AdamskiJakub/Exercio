import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Image,
  Search,
  ArrowRight,
  Dumbbell,
  Music,
  Waves,
  Sparkles,
  Swords,
  CircleDot,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6 },
};

const forWhomItems = [
  { icon: Dumbbell, key: "forWhomGym" },
  { icon: Music, key: "forWhomDance" },
  { icon: Waves, key: "forWhomSwim" },
  { icon: Sparkles, key: "forWhomYoga" },
  { icon: Swords, key: "forWhomMartial" },
  { icon: CircleDot, key: "forWhomTennis" },
  { icon: Trophy, key: "forWhomSports" },
];

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
  { icon: Image, titleKey: "benefitMediaTitle", descKey: "benefitMediaDesc" },
  {
    icon: Search,
    titleKey: "benefitSearchTitle",
    descKey: "benefitSearchDesc",
  },
] as const;

const steps = [
  { step: 1, titleKey: "step1Title", descKey: "step1Desc" },
  { step: 2, titleKey: "step2Title", descKey: "step2Desc" },
  { step: 3, titleKey: "step3Title", descKey: "step3Desc" },
  { step: 4, titleKey: "step4Title", descKey: "step4Desc" },
] as const;

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
              <Building2 className="w-4 h-4 text-emerald-400" />
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
                  className="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-900/30 text-base"
                >
                  {t("ctaButton")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline-slate" size="xl" className="text-base">
                  {t("backToRegister")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className="py-20 bg-slate-900"
        aria-labelledby="benefits-heading"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
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
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t(benefit.titleKey)}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t(benefit.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section
        className="py-20 bg-slate-800/50"
        aria-labelledby="forwhom-heading"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2
              id="forwhom-heading"
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {t("forWhomTitle")}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("forWhomSubtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {forWhomItems.map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-white text-sm font-medium text-center">
                  {t(item.key)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-20 bg-slate-900"
        aria-labelledby="howitworks-heading"
      >
        <div className="max-w-4xl mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
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
                  className="from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-900/30 text-base"
                >
                  {t("ctaButton")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline-slate"
                  size="xl"
                  className="border-emerald-400/30 text-emerald-100 hover:bg-emerald-800/50 hover:border-emerald-400/50 text-base"
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
