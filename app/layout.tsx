import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./storefront-polish.css";
import "./visual-fixes.css";
import "./account/account-polish.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leshesaree.com";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const searchConsoleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "LE SHE SAREE — Contemporary Indian Fashion", template: "%s — LE SHE SAREE" },
  description: "Discover contemporary Indian sarees with a premium, expressive shopping experience from LE SHE SAREE.",
  alternates: { canonical: "/" },
  verification: searchConsoleVerification ? { google: searchConsoleVerification } : undefined,
  openGraph: { type: "website", siteName: "LE SHE SAREE", title: "LE SHE SAREE — Contemporary Indian Fashion", description: "Discover contemporary Indian sarees with a premium, expressive shopping experience.", url: siteUrl },
  twitter: { card: "summary_large_image", title: "LE SHE SAREE — Contemporary Indian Fashion", description: "Discover contemporary Indian sarees with a premium, expressive shopping experience." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        {gaId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" /><Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}', { send_page_view: true });`}</Script></> : null}
      </body>
    </html>
  );
}
