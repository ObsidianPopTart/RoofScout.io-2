import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { isLiveMode } from "@/lib/live/config";
import OfflineBanner from "@/components/OfflineBanner";
import { themeInitScript } from "@/components/ThemeToggle";
import { getLocale } from "@/lib/i18n/getLocale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://roof-scout.org";
const DEFAULT_DESCRIPTION =
  "RoofScout scans a neighborhood by satellite, grades every roof's condition with AI, and hands your sales team a ranked, priced lead list — automatically.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RoofScout — AI Roofing Lead Generation from Satellite Imagery",
    template: "%s — RoofScout",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "RoofScout",
    title: "RoofScout — AI Roofing Lead Generation from Satellite Imagery",
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/images/hero-neighborhood-aerial.jpg", width: 1600, height: 1066 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoofScout — AI Roofing Lead Generation from Satellite Imagery",
    description: DEFAULT_DESCRIPTION,
    images: ["/images/hero-neighborhood-aerial.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        {isLiveMode() ? (
          <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-1.5 text-center text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            Live mode: scans use OpenStreetMap buildings, Google Solar measurements, real satellite
            imagery, and Claude vision grading. Owner records need a parcel-data provider (coming next).
          </div>
        ) : (
          <div className="border-b border-amber-200 bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            Demo mode: scan results, owners, and imagery are simulated. Add GOOGLE_MAPS_API_KEY to
            .env.local (see SETUP.md) to switch to live scanning.
          </div>
        )}
        <main className="flex flex-1 flex-col">{children}</main>
        <OfflineBanner locale={locale} />
      </body>
    </html>
  );
}
