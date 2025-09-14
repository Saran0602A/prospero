import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ProsPero",
    template: "%s | ProsPero",
  },
  description: "Join Prospero – your all-in-one platform to find local jobs, access free AI-powered scholarship programs, share your community achievements, and contribute to meaningful causes. Connect with nearby opportunities, showcase your social impact, and make a difference with Prospero’s easy-to-use platform.",
  openGraph: {
    title: "ProsPero",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProsPero",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
