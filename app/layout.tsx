import type { Metadata } from "next";
import "./globals.css";
import "./storefront-polish.css";

export const metadata: Metadata = {
  title: "LESHE SAREE — Contemporary Indian Fashion",
  description: "A premium animated fashion ecommerce experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
