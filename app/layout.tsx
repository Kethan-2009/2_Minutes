import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Two Minutes",
  description:
    "Name one thing you'll finish. Check in for two minutes a day. An AI keeps the ledger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are linked here rather than @import-ed in globals.css: Tailwind
          v4 bundles CSS with Lightning CSS, which resolves @import at build
          time and silently drops the remote Google Fonts URL, so the faces
          never load in production.

          Upgrade path: next/font/google self-hosts these and removes the
          third-party request entirely. It fetches at build time, so switch to
          it once you're building somewhere with network access to Google.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
