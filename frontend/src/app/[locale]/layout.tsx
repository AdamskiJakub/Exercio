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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exercio - Find Your Perfect Trainer",
  description:
    "Marketplace for personal trainers, fitness instructors, and wellness professionals",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
