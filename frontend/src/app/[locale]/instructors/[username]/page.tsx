import { InstructorPublicProfileClient } from "./InstructorPublicProfileClient";
import { API_BASE_URL } from "@/lib/utils/api-url";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string; locale: string }>;
}

interface InstructorMeta {
  user: {
    firstName: string | null;
    lastName: string | null;
    username: string;
  };
  photoUrl: string | null;
  tagline: string | null;
  city: string | null;
  averageRating: number | null;
  reviewCount: number | null;
  updatedAt: string;
}

async function getInstructorMeta(
  username: string,
): Promise<InstructorMeta | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/instructor-profiles/${username}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, locale } = await params;
  const instructor = await getInstructorMeta(username);

  if (!instructor) {
    return { title: "Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";
  const fullName =
    [instructor.user.firstName, instructor.user.lastName]
      .filter(Boolean)
      .join(" ") || instructor.user.username;
  const title = `${fullName} — Exercio`;
  const description =
    instructor.tagline ||
    `${fullName} — ${locale === "pl" ? "profil specjalisty na Exercio" : "specialist profile on Exercio"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      locale: locale === "pl" ? "pl_PL" : "en_US",
      siteName: "Exercio",
      url: `${siteUrl}/${locale}/instructors/${username}`,
      images: instructor.photoUrl
        ? [
            {
              url: `${API_BASE_URL}/files/${instructor.photoUrl}`,
              width: 800,
              height: 800,
              alt: `${fullName} profile photo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: instructor.photoUrl
        ? [`${API_BASE_URL}/files/${instructor.photoUrl}`]
        : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/instructors/${username}`,
      languages: {
        pl: `${siteUrl}/pl/instruktorzy/${username}`,
        en: `${siteUrl}/en/instructors/${username}`,
      },
    },
  };
}

export default async function InstructorPublicProfilePage({ params }: Props) {
  const { username, locale } = await params;
  const instructor = await getInstructorMeta(username);

  if (!instructor) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";
  const fullName =
    [instructor.user.firstName, instructor.user.lastName]
      .filter(Boolean)
      .join(" ") || instructor.user.username;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    description: instructor.tagline || undefined,
    url: `${siteUrl}/${locale}/instructors/${username}`,
    image: instructor.photoUrl
      ? `${API_BASE_URL}/files/${instructor.photoUrl}`
      : undefined,
    address: instructor.city
      ? {
          "@type": "PostalAddress",
          addressLocality: instructor.city,
          addressCountry: "PL",
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InstructorPublicProfileClient />
    </>
  );
}
