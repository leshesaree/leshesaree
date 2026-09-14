import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://leshesaree.com";
  if (!url || !key) return { title: "LE SHE SAREE", robots: { index: false, follow: true } };
  try {
    const response = await fetch(`${url}/rest/v1/products?select=name,description,image_url,slug,seo_title,seo_description,is_active&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300 } });
    if (!response.ok) return { title: "LE SHE SAREE", robots: { index: false, follow: true } };
    const products = (await response.json()) as Array<{name:string;description:string|null;image_url:string|null;slug:string;seo_title:string|null;seo_description:string|null}>;
    const product = products[0];
    if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
    const title = product.seo_title?.trim() || `${product.name} | LE SHE SAREE`;
    const description = product.seo_description?.trim() || product.description?.trim() || `Shop ${product.name} from LE SHE SAREE — contemporary Indian fashion.`;
    const canonical = `${base}/product/${product.slug}`;
    const image = product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined;
    return { title, description, alternates: { canonical }, robots: { index: true, follow: true }, openGraph: { type: "website", siteName: "LE SHE SAREE", title, description, url: canonical, images: image }, twitter: { card: "summary_large_image", title, description, images: product.image_url ? [product.image_url] : undefined } };
  } catch { return { title: "LE SHE SAREE" }; }
}

export default function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
