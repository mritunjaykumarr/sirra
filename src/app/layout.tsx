import type { Metadata } from "next";
import { Cormorant_Garamond, Archivo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sirra.in"),
  title: "SIRRA · Your Sirra.",
  description: "Chase your top-class self.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${archivo.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-cream text-ink font-sans antialiased">
        {/* Accessible skip link for keyboard and screen reader navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cream focus:text-ink focus:border focus:border-gold"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <Header />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
