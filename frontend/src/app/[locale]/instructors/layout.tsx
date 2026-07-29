import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "pl") {
    return {
      title: "Znajdź instruktorów i obiekty — Exercio",
      description:
        "Przeglądaj profile instruktorów, trenerów, studiów treningowych, siłowni i klubów sportowych. Filtruj po mieście, specjalizacji i dostępności.",
      openGraph: {
        title: "Znajdź instruktorów i obiekty — Exercio",
        description:
          "Przeglądaj profile instruktorów, trenerów, studiów treningowych, siłowni i klubów sportowych.",
        locale: "pl_PL",
        siteName: "Exercio",
      },
    };
  }

  return {
    title: "Find Instructors & Venues — Exercio",
    description:
      "Browse profiles of instructors, training studios, gyms and sports clubs. Filter by city, specialization and availability.",
    openGraph: {
      title: "Find Instructors & Venues — Exercio",
      description:
        "Browse profiles of instructors, training studios, gyms and sports clubs.",
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
