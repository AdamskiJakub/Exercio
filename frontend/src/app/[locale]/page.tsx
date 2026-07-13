import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WordCloud } from "@/components/ui/word-cloud";
import { HeroSearchBar } from "@/components/home/hero-search-bar";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "pl") {
    return {
      title: "Exercio — Znajdź swojego idealnego trenera",
      description:
        "Rynek trenerów personalnych, instruktorów fitness i specjalistów od wellness. Przeglądaj profile, sprawdź dostępność i zarezerwuj trening online.",
      openGraph: {
        title: "Exercio — Znajdź swojego idealnego trenera",
        description:
          "Rynek trenerów personalnych, instruktorów fitness i specjalistów od wellness.",
        locale: "pl_PL",
        siteName: "Exercio",
      },
    };
  }

  return {
    title: "Exercio — Find Your Perfect Trainer",
    description:
      "Marketplace for personal trainers, fitness instructors, and wellness professionals. Browse profiles, check availability, and book online training.",
    openGraph: {
      title: "Exercio — Find Your Perfect Trainer",
      description:
        "Marketplace for personal trainers, fitness instructors, and wellness professionals.",
      locale: "en_US",
      siteName: "Exercio",
    },
  };
}

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>

        <div className="relative container mx-auto px-4 md:px-6 py-12 md:py-16 min-h-[calc(100vh-5rem)] flex items-center">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  {t("hero.title")}{" "}
                  <span className="bg-linear-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    {t("hero.titleHighlight")}
                  </span>
                </h1>

                <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                  {t("hero.description")}
                </p>
              </div>

              <div className="space-y-4">
                <HeroSearchBar />
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center h-full">
              <WordCloud />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 hover:border-orange-500 transition-all duration-300 h-full">
              <CardHeader>
                <div className="text-5xl mb-4">🔍</div>
                <CardTitle className="text-2xl text-white font-bold mb-3">
                  {t("features.findExperts.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base leading-relaxed space-y-3">
                <p className="text-slate-400">
                  {t("features.findExperts.description")}
                </p>
                <p className="font-medium">
                  {t("features.findExperts.content")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 hover:border-orange-500 transition-all duration-300 h-full">
              <CardHeader>
                <div className="text-5xl mb-4">💬</div>
                <CardTitle className="text-2xl text-white font-bold mb-3">
                  {t("features.directContact.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base leading-relaxed space-y-3">
                <p className="text-slate-400">
                  {t("features.directContact.description")}
                </p>
                <p className="font-medium">
                  {t("features.directContact.content")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 hover:border-orange-500 transition-all duration-300 h-full">
              <CardHeader>
                <div className="text-5xl mb-4">⭐</div>
                <CardTitle className="text-2xl text-white font-bold mb-3">
                  {t("features.reviews.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base leading-relaxed space-y-3">
                <p className="text-slate-400">
                  {t("features.reviews.description")}
                </p>
                <p className="font-medium">{t("features.reviews.content")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
