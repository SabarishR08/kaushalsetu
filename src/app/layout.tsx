import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KaushalSetu — Skilling Alignment for Maharashtra",
  description:
    "Closed-loop skilling alignment for Government of Maharashtra (SIH26134): job-market demand signal, skill-gap detection against training programs, and program recommendations. Built on the PathFinder evidence pipeline.",
  keywords: ["skilling", "skill gap", "job market demand", "Maharashtra", "SIH26134", "KaushalSetu"],
  authors: [{ name: "KaushalSetu" }],
  openGraph: {
    title: "KaushalSetu — Skilling Alignment for Maharashtra",
    description: "Demand signal → gap detection → program recommendation for the state's skilling ecosystem.",
    siteName: "KaushalSetu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden max-w-[100vw]`}
      >
        {/*
          Strip Dark Reader-injected attributes from SVGs before React
          hydrates. Without this, browser extensions that modify SVG stroke
          colors cause hydration mismatches on every icon.
        */}
        <Script
          id="dark-reader-cleanup"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `document.querySelectorAll('svg').forEach(svg => {
  svg.removeAttribute('data-darkreader-inline-stroke');
  svg.removeAttribute('data-darkreader-inline-fill');
  const s = svg.getAttribute('style');
  if (s && s.includes('--darkreader-inline')) {
    svg.setAttribute('style', s.replace(/--darkreader-inline-[a-z]+:[^;]+;?/gi, '').trim());
  }
});`,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
