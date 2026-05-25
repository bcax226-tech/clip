import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipViral — Auto Clipping Podcast",
  description: "Otomatis bikin klip viral dari video podcast pakai AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
