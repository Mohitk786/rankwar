import type { Metadata } from "next";
import { Caveat, IBM_Plex_Mono, Manrope, Syne } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Who's #1";

export const metadata: Metadata = {
  title: {
    default: `${siteName} — Claim a rank on the public leaderboard`,
    template: `%s · ${siteName}`,
  },
  description:
    "Rank is what you pay — nothing else. A public, permanent, pay-to-rank leaderboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${syne.variable} ${ibmPlexMono.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          defer
          data-website-id="nha8a43tymz8"
          data-domain="whos1.bid"
          src="https://data.whos1.bid/script.js"
        ></script>
        <ThemeScript />
      </head>
      <body className="relative flex min-h-full flex-col bg-transparent font-sans text-foreground">
        <div
          aria-hidden
          className="app-fixed-bg pointer-events-none fixed inset-0 -z-10"
        />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
