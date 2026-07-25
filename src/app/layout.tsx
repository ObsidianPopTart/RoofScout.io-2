import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { isLiveMode } from "@/lib/live/config";
import OfflineBanner from "@/components/OfflineBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoofScout — AI roofing lead engine",
  description: "Find neglected roofs, build lead profiles, and quote jobs — automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {isLiveMode() ? (
          <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-1.5 text-center text-xs text-emerald-800">
            Live mode: scans use OpenStreetMap buildings, Google Solar measurements, real satellite
            imagery, and Claude vision grading. Owner records need a parcel-data provider (coming next).
          </div>
        ) : (
          <div className="border-b border-amber-200 bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">
            Demo mode: scan results, owners, and imagery are simulated. Add GOOGLE_MAPS_API_KEY to
            .env.local (see SETUP.md) to switch to live scanning.
          </div>
        )}
        <main className="flex flex-1 flex-col">{children}</main>
        <OfflineBanner />
      </body>
    </html>
  );
}
