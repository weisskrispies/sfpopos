import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SF Hidden Parks — Discover San Francisco's Secret Public Spaces",
  description:
    "Explore 91 privately owned public open spaces (POPOS) hidden across San Francisco. Find rooftop gardens, plazas, and urban parks open to everyone — searchable by neighborhood and amenity.",
  keywords: [
    "San Francisco",
    "POPOS",
    "hidden parks",
    "public spaces",
    "rooftop gardens",
    "urban parks",
    "plazas",
    "sfhiddenparks",
    "privately owned public open spaces",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://sfhiddenparks.com",
  },
  openGraph: {
    title: "SF Hidden Parks — Discover San Francisco's Secret Public Spaces",
    description:
      "Explore 91 privately owned public open spaces (POPOS) hidden across San Francisco. Find rooftop gardens, plazas, and urban parks open to everyone.",
    url: "https://sfhiddenparks.com",
    siteName: "SF Hidden Parks",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "SF Hidden Parks — Discover San Francisco's Secret Public Spaces",
    description:
      "Explore 91 hidden public spaces across San Francisco — rooftop gardens, plazas, and urban parks open to everyone.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-235LXYS215" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-235LXYS215');`,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4A7C10" />
      </head>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
