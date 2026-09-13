import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";
import Script from "next/script";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Who's #1";

export const metadata: Metadata = {
  title: { default: `${siteName} — Claim a rank on the public leaderboard`, template: `%s · ${siteName}` },
  description: "Rank is what you pay — nothing else. A public, permanent, pay-to-rank leaderboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* <Script
          data-website-id="dfid_vuwI6uv1xQpbpDOd6TkmL"
          data-domain="www.whos1.bid"
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
        /> */}

         {/* <Script defer data-website-id="nha8a43tymz8" src="https://data.whos1.bid/script.js"> */}

         

        <script defer data-website-id="nha8a43tymz8"  data-domain="whos1.bid" src="https://data.whos1.bid/script.js"></script>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
