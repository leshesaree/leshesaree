"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./product-card.module.css";

type ProductImage = { image_url: string; display_order: number; is_primary: boolean };
type Product = { id: string; slug: string; name: string; price: number; image_url: string | null };

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { data } = await supabase
        .from("product_images")
        .select("image_url,display_order,is_primary")
        .eq("product_id", product.id)
        .order("is_primary", { ascending: false })
        .order("display_order", { ascending: true });
      if (!active) return;
      const gallery = ((data || []) as ProductImage[]).map((image) => image.image_url).filter(Boolean);
      setImages(Array.from(new Set([...(product.image_url ? [product.image_url] : []), ...gallery])));
    };
    load();
    return () => { active = false; };
  }, [product.id, product.image_url]);

  const primary = images[0] || product.image_url;
  const hover = images[1] || primary;
  const tone = ["rose", "stone", "plum", "sand"][index % 4];

  return (
    <a className={styles.card} href={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
      <div className={`${styles.image} tone-${tone}`}>
        {primary ? <>
          <img className={`${styles.photo} ${styles.primary}`} src={primary} alt={product.name} />
          <img className={`${styles.photo} ${styles.hover}`} src={hover || primary} alt="" aria-hidden="true" />
        </> : <span className={styles.fallback}>{product.name.split(" ")[0].toUpperCase()}</span>}
        <i>VIEW</i>
      </div>
      <div className={styles.meta}><span>{product.name}</span><span>₹ {Number(product.price).toLocaleString("en-IN")}</span></div>
    </a>
  );
}
