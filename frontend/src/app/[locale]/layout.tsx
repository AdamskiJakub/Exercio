import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { Toaster } from "@/components/toaster";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/cookie-banner";

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
        default: "Exercio — Znajdź swojego idealnego trenera",
        template: "%s — Exercio",
      },
      description:
        "Rynek trenerów personalnych, instruktorów fitness i specjalistów od wellness. Przeglądaj profile, sprawdź dostępność i zarezerwuj trening online.",
      openGraph: {
        siteName: "Exercio",
        type: "website",
        locale: "pl_PL",
      },
    };
  }

  return {
    title: {
      default: "Exercio — Find Your Perfect Trainer",
      template: "%s — Exercio",
    },
    description:
      "Marketplace for personal trainers, fitness instructors, and wellness professionals. Browse profiles, check availability, and book online training.",
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
        <link rel="icon" href="/icon.png" type="image/png" sizes="64x64" />
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-F444KP0X1W`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F444KP0X1W', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col  bg-slate-950">
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
            <CookieBanner />
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
