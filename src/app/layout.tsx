import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BRAND } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} - ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  keywords: ["wholesale", "grocery", "hyderabad", "usha mart", "bulk shopping"],
  icons: {
    icon: [
      { url: BRAND.logo, type: "image/jpeg" },
    ],
    apple: BRAND.logo,
    shortcut: BRAND.logo,
  },
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    type: "website",
    images: [BRAND.logo],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
