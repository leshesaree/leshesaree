import type { Metadata } from "next";
import "./globals.css";
import "./storefront-polish.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leshesaree.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LE SHE SAREE — Contemporary Indian Fashion",
    template: "%s — LE SHE SAREE",
  },
  description: "Discover contemporary Indian sarees with a premium, expressive shopping experience from LE SHE SAREE.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "LE SHE SAREE",
    title: "LE SHE SAREE — Contemporary Indian Fashion",
    description: "Discover contemporary Indian sarees with a premium, expressive shopping experience.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "LE SHE SAREE — Contemporary Indian Fashion",
    description: "Discover contemporary Indian sarees with a premium, expressive shopping experience.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
