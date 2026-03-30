import type { Metadata } from "next";
import "./globals.css";

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
