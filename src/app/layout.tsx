import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "PRIS - Patient Recording Information System",
    template: "%s | PRIS",
  },
  description: "Secure, multi-tenant clinical record system for modern healthcare practices in the Philippines. RA 10173 Compliant.",
  keywords: ["EMR", "Electronic Medical Records", "Healthcare Philippines", "Data Privacy Act", "RA 10173", "Clinical Records"],
  authors: [{ name: "Project PRIS" }],
  creator: "Project PRIS",
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://pris.ph",
    title: "PRIS - Patient Recording Information System",
    description: "Secure, multi-tenant clinical record system for Philippine healthcare providers.",
    siteName: "PRIS",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRIS - Patient Recording Information System",
    description: "Secure, multi-tenant clinical record system for Philippine healthcare providers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
