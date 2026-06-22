"use client";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { NotFoundContent } from "@/components/not-found-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootNotFound() {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        <NotFoundContent />
      </body>
    </html>
  );
}
