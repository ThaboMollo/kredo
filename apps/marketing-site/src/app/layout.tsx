import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Newsreader, Geist } from "next/font/google";
import "./globals.css";
import AttributionTracker from "@/components/AttributionTracker";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Kalahari — Build Credit History Before Graduation",
  description:
    "Ditch predatory micro-loans. Build an official credit profile as a student with our partner-store subscription facilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${playfair.variable} ${newsreader.variable} ${geist.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <AttributionTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
