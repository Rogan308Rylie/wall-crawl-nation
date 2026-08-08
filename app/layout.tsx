import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import RandomTheme from "@/components/RandomTheme";
import SecretCodes from "@/components/SecretCodes";
import Footer from "@/components/Footer";
import SelfDestructButton from "@/components/SelfDestructButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wall-crawl-nation.vercel.app"),
  title: {
    default: "Wall Crawl Nation | Premium Posters & Wall Art",
    template: "%s | Wall Crawl Nation",
  },
  description: "Wall Crawl Nation offers premium, culture-driven posters and wall art for pop culture lovers. Elevate your space with our exclusive designs.",
  keywords: ["wall art", "posters", "pop culture", "custom posters", "premium prints", "aesthetic decor"],
  authors: [{ name: "Wall Crawl Nation" }],
  creator: "Wall Crawl Nation",
  publisher: "Wall Crawl Nation",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wall-crawl-nation.vercel.app",
    title: "Wall Crawl Nation | Premium Posters & Wall Art",
    description: "Premium wall art inspired by culture, individuality, and expression. Redefining spaces with bold aesthetics.",
    siteName: "Wall Crawl Nation",
    images: [
      {
        url: "/assets/og-image-placeholder.jpg", // We will use a placeholder or they can add one later
        width: 1200,
        height: 630,
        alt: "Wall Crawl Nation Posters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wall Crawl Nation | Premium Posters",
    description: "Premium wall art inspired by culture, individuality, and expression.",
    images: ["/assets/og-image-placeholder.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RandomTheme />
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <SecretCodes />
              <Navbar />
              <main className="p-6">{children}</main>
              <Footer />
              <SelfDestructButton />
            </CartProvider>
            <script src="https://checkout.razorpay.com/v1/checkout.js" async />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
