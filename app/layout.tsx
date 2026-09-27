import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Two Minutes",
  description: "An AI accountability partner for ambitious students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
