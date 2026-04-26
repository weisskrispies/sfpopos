import type { Metadata, Viewport } from "next";
import "./globals.css";
// Firebase Auth + Firestore enabled

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SF Hidden Parks — Discover San Francisco's Secret Public Spaces",
  description:
    "Explore over 90 hidden parks, rooftop gardens, plazas, and terraces tucked throughout San Francisco. Track your visits and find your next favorite spot.",
  keywords: [
    "San Francisco",
    "POPOS",
    "hidden parks",
    "public spaces",
    "rooftop gardens",
    "urban parks",
    "plazas",
    "sfhiddenparks",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4A7C10" /> {/* green to match logo */}
      </head>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
