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

export const metadata = {
  title: {
    default: "Wall Crawl Nation",
    template: "%s | Wall Crawl Nation",
  },
  description: "Posters & wall art for pop culture lovers",
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
