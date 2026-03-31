import type { Metadata, Viewport } from "next";
import "./globals.css";
// Firebase Auth + Firestore enabled

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SF POPOS — Discover San Francisco's Hidden Public Spaces",
  description:
    "Explore, save, and visit San Francisco's privately owned public open spaces. Find rooftop gardens, plazas, terraces, and parks tucked throughout the city.",
  keywords: [
    "San Francisco",
    "POPOS",
    "public spaces",
    "rooftop gardens",
    "urban parks",
    "plazas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
