import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import RandomTheme from "@/components/RandomTheme";
import CustomCursor from "@/components/CustomCursor";

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
        <CustomCursor />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="p-6">{children}</main>
          </CartProvider>
          <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </AuthProvider>
      </body>
    </html>
  );
}
