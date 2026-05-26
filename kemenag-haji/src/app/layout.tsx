import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { seedOnce } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Kementerian Haji & Umrah Republik Indonesia",
  description:
    "Portal resmi Kementerian Haji dan Umrah Republik Indonesia — informasi, layanan pendaftaran, dan berita.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await seedOnce();
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
