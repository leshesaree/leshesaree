import type { MetadataRoute } from "next";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://leshesaree.com";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/wishlist`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${base}/account`, changeFrequency: "monthly", priority: 0.3 },
  ];
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return staticRoutes;
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug,updated_at,is_active").eq("is_active", true),
    supabase.from("categories").select("slug,updated_at,is_active").eq("is_active", true),
  ]);
  return [
    ...staticRoutes,
    ...((products || []).map((product) => ({ url: `${base}/product/${product.slug}`, lastModified: product.updated_at ? new Date(product.updated_at) : undefined, changeFrequency: "weekly" as const, priority: 0.8 }))),
    ...((categories || []).map((category) => ({ url: `${base}/?category=${category.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }))),
  ];
}
