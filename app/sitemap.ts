import type { MetadataRoute } from "next";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://leshesaree.com";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/bag`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/checkout`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return staticRoutes;

  const { data } = await supabase
    .from("products")
    .select("slug,updated_at,is_active")
    .eq("is_active", true);

  return [
    ...staticRoutes,
    ...((data || []).map((product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))),
  ];
}
