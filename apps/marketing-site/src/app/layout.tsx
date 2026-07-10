import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import AttributionTracker from "@/components/AttributionTracker";

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
