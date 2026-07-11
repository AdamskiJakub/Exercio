import { EnterpriseProfilePage } from "@/components/enterprise/EnterpriseProfilePage";
import type { EnterpriseProfile } from "@/types/enterprise";
import { API_BASE_URL } from "@/lib/utils/api-url";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

async function getEnterpriseProfile(
  slug: string,
): Promise<EnterpriseProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/enterprise/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const enterprise = await getEnterpriseProfile(slug);

  if (!enterprise) {
    return { title: "Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://exercio.app";
  const title = `${enterprise.companyName} — Exercio`;
  const description =
    enterprise.shortDescription || `${enterprise.companyName} on Exercio`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      locale: locale === "pl" ? "pl_PL" : "en_US",
      siteName: "Exercio",
      url: `${siteUrl}/${locale}/enterprise/${slug}`,
      images: enterprise.logoUrl
        ? [
            {
              url: `${API_BASE_URL}/files/${enterprise.logoUrl}`,
              width: 800,
              height: 800,
              alt: `${enterprise.companyName} logo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: enterprise.logoUrl
        ? [`${API_BASE_URL}/files/${enterprise.logoUrl}`]
        : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/enterprise/${slug}`,
      languages: {
        pl: `${siteUrl}/pl/enterprise/${slug}`,
        en: `${siteUrl}/en/enterprise/${slug}`,
      },
    },
  };
}

export default async function EnterprisePage({ params }: Props) {
  const { slug } = await params;
  const enterprise = await getEnterpriseProfile(slug);

  if (!enterprise) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trainly.pl";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: enterprise.companyName,
    description: enterprise.shortDescription || undefined,
    url: `${siteUrl}/enterprise/${slug}`,
    logo: enterprise.logoUrl
      ? `${API_BASE_URL}/files/${enterprise.logoUrl}`
      : undefined,
    image: enterprise.coverUrl
      ? `${API_BASE_URL}/files/${enterprise.coverUrl}`
      : undefined,
    email: enterprise.email || undefined,
    telephone: enterprise.phone || undefined,
    address: enterprise.address
      ? {
          "@type": "PostalAddress",
          streetAddress: enterprise.address,
          postalCode: enterprise.postalCode || undefined,
          addressLocality: enterprise.city || undefined,
          addressCountry: "PL",
        }
      : undefined,
    sameAs: [
      enterprise.facebookUrl,
      enterprise.instagramUrl,
      enterprise.youtubeUrl,
      enterprise.tiktokUrl,
    ].filter(Boolean),
    knowsAbout: enterprise.tags,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EnterpriseProfilePage enterprise={enterprise} />
    </>
  );
}
