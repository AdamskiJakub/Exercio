import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { Toaster } from "@/components/toaster";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { AnalyticsProvider } from "@/components/analytics-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "pl") {
    return {
      title: {
        default: "Exercio — Znajdź instruktorów, studia i kluby sportowe",
        template: "%s — Exercio",
      },
      description:
        "Odkrywaj instruktorów, studia treningowe, szkoły tańca, siłownie i ekspertów wellness. Przeglądaj profile, sprawdź dostępność i zarezerwuj trening online.",
      openGraph: {
        siteName: "Exercio",
        type: "website",
        locale: "pl_PL",
      },
    };
  }

  return {
    title: {
      default: "Exercio — Find Instructors, Studios and Sports Clubs",
      template: "%s — Exercio",
    },
    description:
      "Discover instructors, training studios, dance schools, gyms and wellness experts. Browse profiles, check availability and book training online.",
    openGraph: {
      siteName: "Exercio",
      type: "website",
      locale: "en_US",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-full flex flex-col  bg-slate-950">
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
            <CookieBanner />
            <AnalyticsProvider />
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
