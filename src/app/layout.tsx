import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import OfflineBanner from "@/components/OfflineBanner";
import SupportChat from "@/components/SupportChat";
import { themeInitScript } from "@/components/ThemeToggle";
import { getDictionary } from "@/lib/i18n/getLocale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://roofscout.io";
const DEFAULT_DESCRIPTION =
  "RoofScout.io scans a neighborhood by satellite, grades every roof's condition with AI, and hands your sales team a ranked, priced lead list — automatically.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RoofScout.io — AI Roofing Lead Generation from Satellite Imagery",
    template: "%s — RoofScout.io",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "RoofScout.io",
    title: "RoofScout.io — AI Roofing Lead Generation from Satellite Imagery",
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/images/hero-neighborhood-aerial.jpg", width: 1600, height: 1066 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoofScout.io — AI Roofing Lead Generation from Satellite Imagery",
    description: DEFAULT_DESCRIPTION,
    images: ["/images/hero-neighborhood-aerial.jpg"],
  },
  verification: {
    google: "1FgaL3Lp2ITNwnhC0-ZsugVbRDX1PRESRbhtk0FCENA",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, t } = await getDictionary();
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
        <main className="flex flex-1 flex-col">{children}</main>
        <OfflineBanner locale={locale} />
        <SupportChat t={t.supportChat} />
      </body>
    </html>
  );
}
