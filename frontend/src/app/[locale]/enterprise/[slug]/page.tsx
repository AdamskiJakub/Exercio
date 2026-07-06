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
  const { slug } = await params;
  const enterprise = await getEnterpriseProfile(slug);

  if (!enterprise) {
    return { title: "Not Found" };
  }

  return {
    title: `${enterprise.companyName} — Trainly`,
    description:
      enterprise.shortDescription || `${enterprise.companyName} on Trainly`,
  };
}

export default async function EnterprisePage({ params }: Props) {
  const { slug } = await params;
  const enterprise = await getEnterpriseProfile(slug);

  if (!enterprise) {
    notFound();
  }

  return <EnterpriseProfilePage enterprise={enterprise} />;
}
