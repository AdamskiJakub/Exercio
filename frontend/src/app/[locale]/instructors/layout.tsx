import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "pl") {
    return {
      title: "Znajdź instruktora — Exercio",
      description:
        "Przeglądaj profile trenerów personalnych, instruktorów fitness, fizjoterapeutów i innych specjalistów. Filtruj po mieście, specjalizacji i dostępności.",
      openGraph: {
        title: "Znajdź instruktora — Exercio",
        description:
          "Przeglądaj profile trenerów personalnych, instruktorów fitness, fizjoterapeutów i innych specjalistów.",
        locale: "pl_PL",
        siteName: "Exercio",
      },
    };
  }

  return {
    title: "Find an Instructor — Exercio",
    description:
      "Browse profiles of personal trainers, fitness instructors, physiotherapists and other wellness professionals. Filter by city, specialization and availability.",
    openGraph: {
      title: "Find an Instructor — Exercio",
      description:
        "Browse profiles of personal trainers, fitness instructors, physiotherapists and other wellness professionals.",
      locale: "en_US",
      siteName: "Exercio",
    },
  };
}

export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
