import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: {
    default: "DropBest! - Discover, Review & Earn",
    template: "%s | DropBest!"
  },
  description: "Discover the best products on DropBest!, review them, earn coins, and convert your coins into real coupons.",
  keywords: ["DropBest", "buy by best", "product reviews", "earn coins", "shopping coupons", "affiliate"],
  openGraph: {
    title: "DropBest! - Discover, Review & Earn",
    description: "Discover the best products on DropBest!, review them, earn coins, and convert your coins into real coupons.",
    url: "https://dropbest.vercel.app",
    siteName: "DropBest!",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DropBest! - Discover, Review & Earn",
    description: "Discover the best products on DropBest!, review them, earn coins, and convert your coins into real coupons.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "YnegzouB973-LO9SJ__F7k2TkX9X9gwFOKqbfKrir2E",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
