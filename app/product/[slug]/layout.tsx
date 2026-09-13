import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return { title: "Saree" };
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/products?select=name,description,image_url,price,slug&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 300 },
      },
    );
    const products = (await response.json()) as Array<{
      name: string;
      description: string | null;
      image_url: string | null;
      price: number;
      slug: string;
    }>;
    const product = products[0];
    if (!product) return { title: "Saree" };

    const description =
      product.description ||
      `Discover ${product.name} from LE SHE SAREE — contemporary Indian fashion.`;
    const image = product.image_url ? [product.image_url] : undefined;

    return {
      title: product.name,
      description,
      alternates: { canonical: `/product/${product.slug}` },
      openGraph: {
        type: "website",
        title: product.name,
        description,
        images: image,
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: image,
      },
    };
  } catch {
    return { title: "Saree" };
  }
}

export default function ProductLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
