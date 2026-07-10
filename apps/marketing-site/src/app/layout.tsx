import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import AttributionTracker from "@/components/AttributionTracker";

export const metadata: Metadata = {
  title: "Kalahari Technology Holdings — Integrated Digital Platforms",
  description:
    "Technology solutions for retail, hospitality, and supply chain operations: POS and payment systems, EWM integration, contactless hospitality tools, and custom platform development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <AttributionTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
