"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";
import ProductReviews from "./reviews";

type Product = { id: string; name: string; price: number; description: string | null; sizes: string[]; stock: number; image_url: string | null; is_active: boolean; slug: string; material: string | null; care_instructions: string | null; seo_title: string | null; seo_description: string | null };
type GalleryImage = { id: string; image_url: string; alt_text: string | null; display_order: number; is_primary: boolean };
type DisplayProduct = Product & { label: string; tone: string; desc: string };
type CartItem = { product_id: string; slug: string; name: string; price: number; image_url: string | null; quantity: number; size: string };
type Wish = { id:string; slug:string; name:string; price:number; image_url:string|null };

const fallback: Record<string, DisplayProduct> = {
  gulab: { id: "gulab", name: "Gulab Silk Saree", price: 2499, description: null, sizes: ["Free Size", "Custom"], stock: 10, image_url: null, is_active: true, slug: "gulab", material: "Silk blend", care_instructions: "Dry clean recommended", seo_title: null, seo_description: null, label: "GULAB", tone: "rose", desc: "A soft, expressive saree inspired by the quiet romance of Indian florals. Finished for an effortless drape." },
  noor: { id: "noor", name: "Noor Handloom Saree", price: 2899, description: null, sizes: ["Free Size", "Custom"], stock: 10, image_url: null, is_active: true, slug: "noor", material: "Handloom textile", care_instructions: "Gentle care recommended", seo_title: null, seo_description: null, label: "NOOR", tone: "stone", desc: "A handloom-inspired everyday classic with a calm texture and a modern, fluid silhouette." },
  madhubani: { id: "madhubani", name: "Madhubani Saree", price: 3199, description: null, sizes: ["Free Size", "Custom"], stock: 10, image_url: null, is_active: true, slug: "madhubani", material: "Artisan textile", care_instructions: "Dry clean recommended", seo_title: null, seo_description: null, label: "MADHU", tone: "plum", desc: "A richly expressive textile story with artisanal character and a contemporary edge." },
  meher: { id: "meher", name: "Meher Cotton Saree", price: 2199, description: null, sizes: ["Free Size", "Custom"], stock: 10, image_url: null, is_active: true, slug: "meher", material: "Cotton", care_instructions: "Gentle wash recommended", seo_title: null, seo_description: null, label: "MEHER", tone: "sand", desc: "Light, breathable and easy to wear, made for slow afternoons and everyday rituals." },
};

const displayImageUrl = (url: string | null) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && (parsed.hostname === "i.ibb.co" || parsed.hostname === "ibb.co")) return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  } catch {}
  return url;
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, setProduct] = useState<DisplayProduct>(fallback.gulab);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [size, setSize] = useState("Free Size");
  const [added, setAdded] = useState(false);
  const [bag, setBag] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    params.then(async ({ slug }) => {
      const local = fallback[slug] || fallback.gulab;
      if (active) setProduct(local);
      const rawWish = localStorage.getItem("leshe-wishlist");
      if (active) { try { setSaved((JSON.parse(rawWish || "[]") as Wish[]).some(item => item.id === local.id || item.slug === local.slug)); } catch { setSaved(false); } }
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data } = await supabase.from("products").select("id,name,price,description,sizes,stock,image_url,is_active,slug,material,care_instructions,seo_title,seo_description").eq("slug", slug).eq("is_active", true).maybeSingle();
        if (data && active) {
          const live = data as Product;
          const sizes = live.sizes?.length ? live.sizes : local.sizes;
          setProduct({ ...live, price: Number(live.price), label: live.name.split(" ")[0].toUpperCase(), tone: local.tone, desc: live.description || local.desc, sizes, stock: Number(live.stock || 0) });
          setSize(sizes[0] || "Free Size");
          const { data: images } = await supabase.from("product_images").select("id,image_url,alt_text,display_order,is_primary").eq("product_id", live.id).order("is_primary", { ascending: false }).order("display_order", { ascending: true });
          if (active && images?.length) {
            const ordered = images as GalleryImage[];
            setGallery(ordered);
            setSelectedImage((ordered.find((image) => image.is_primary) || ordered[0]).id);
          }
          const latestWish = localStorage.getItem("leshe-wishlist");
          try { if (active) setSaved((JSON.parse(latestWish || "[]") as Wish[]).some(item => item.id === live.id || item.slug === live.slug)); } catch {}
        }
      }
      if (active) { setBag(Number(localStorage.getItem("leshe-bag-count") || 0)); setLoading(false); }
    });
    return () => { active = false; };
  }, [params]);

  useEffect(() => { const sync = () => { try { const list = JSON.parse(localStorage.getItem("leshe-wishlist") || "[]") as Wish[]; setSaved(list.some(item => item.id === product.id || item.slug === product.slug)); } catch {} }; window.addEventListener("leshe-wishlist-updated", sync); return () => window.removeEventListener("leshe-wishlist-updated", sync); }, [product.id, product.slug]);

  const selectedIndex = Math.max(0, gallery.findIndex((item) => item.id === selectedImage));
  const currentImage = gallery[selectedIndex]?.image_url || product.image_url;
  const currentDisplayImage = displayImageUrl(currentImage);
  const galleryLabel = gallery.length ? `${String(selectedIndex + 1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}` : "01 / 01";
  const hasGallery = gallery.length > 0;
  const imageKey = useMemo(() => `${product.id}-${selectedImage || "fallback"}`, [product.id, selectedImage]);

  useEffect(() => { setImageFailed(false); }, [imageKey, currentImage]);

  const selectRelative = (delta: number) => { if (!gallery.length) return; const next = (selectedIndex + delta + gallery.length) % gallery.length; setSelectedImage(gallery[next].id); };

  const toggleWishlist = () => {
    let list: Wish[] = [];
    try { list = JSON.parse(localStorage.getItem("leshe-wishlist") || "[]") as Wish[]; } catch {}
    const exists = list.some(item => item.id === product.id || item.slug === product.slug);
    const next = exists ? list.filter(item => item.id !== product.id && item.slug !== product.slug) : [...list, { id: product.id, slug: product.slug, name: product.name, price: product.price, image_url: currentDisplayImage }];
    localStorage.setItem("leshe-wishlist", JSON.stringify(next));
    setSaved(!exists);
    window.dispatchEvent(new Event("leshe-wishlist-updated"));
  };

  const add = () => {
    if (product.stock <= 0) return;
    const raw = localStorage.getItem("leshe-bag-items"); const items: CartItem[] = raw ? JSON.parse(raw) : [];
    const index = items.findIndex((item) => item.product_id === product.id && item.size === size);
    if (index >= 0) items[index].quantity = Math.min(items[index].quantity + 1, product.stock); else items.push({ product_id: product.id, slug: product.slug, name: product.name, price: product.price, image_url: currentDisplayImage, quantity: 1, size });
    const total = items.reduce((sum, item) => sum + item.quantity, 0); localStorage.setItem("leshe-bag-items", JSON.stringify(items)); localStorage.setItem("leshe-bag-count", String(total)); window.dispatchEvent(new Event("storage")); setBag(total); setAdded(true); setTimeout(() => setAdded(false), 900);
  };

  return (
    <main className={`product-page tone-${product.tone}`}>
      <header className="topbar product-top"><a className="wordmark" href="/">LE SHE<br /><span>SAREE</span></a><nav><a href="/">Shop</a><a href="/account">Account</a><Link href="/wishlist" className="wishlist-nav">Wishlist</Link><a href="/bag">Bag ({bag})</a></nav><span className="top-meta">PRODUCT / {product.slug.toUpperCase()}</span></header>
      <a className="back-link" href="/">← Back to collection</a>
      <section className="product-detail">
        <div className="product-visual"><div className="product-gallery">{hasGallery && <div className="product-thumbs" aria-label="Product image thumbnails">{gallery.map((item, index) => <button type="button" key={item.id} className={selectedImage === item.id ? "selected" : ""} onClick={() => setSelectedImage(item.id)} aria-label={`View image ${index + 1}`}><img src={displayImageUrl(item.image_url) || item.image_url} alt={item.alt_text || product.name} onError={(e) => { e.currentTarget.style.opacity = "0"; }} /></button>)}</div>}<div className="product-stage"><span className="product-gallery-count">{galleryLabel}</span>{currentDisplayImage && !imageFailed ? <img key={imageKey} src={currentDisplayImage} alt={gallery[selectedIndex]?.alt_text || product.name} onError={() => setImageFailed(true)} /> : <div className="product-stage-empty"><span>{product.label}</span><small>IMAGE UNAVAILABLE</small></div>}{gallery.length > 1 && <><button className="gallery-arrow prev" type="button" onClick={() => selectRelative(-1)} aria-label="Previous image">←</button><button className="gallery-arrow next" type="button" onClick={() => selectRelative(1)} aria-label="Next image">→</button></>}</div></div></div>
        <div className="product-info"><p className="eyebrow">HANDCRAFTED INDIA / 2026</p><div className="product-title-row"><h1>{product.name}</h1><button type="button" className={`wishlist-heart ${saved ? "saved" : ""}`} onClick={toggleWishlist} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={saved}>{saved ? "♥" : "♡"}</button></div><div className="price">₹ {product.price.toLocaleString("en-IN")}</div><p className="description">{product.desc}</p>{product.material && <p className="product-material"><b>MATERIAL</b> {product.material}</p>}<div className="option-label">SIZE <span>{size}</span></div><div className="sizes">{product.sizes.map((item) => <button type="button" className={size === item ? "selected" : ""} onClick={() => setSize(item)} key={item}>{item}</button>)}</div><button className={`add-button ${added ? "added" : ""}`} disabled={loading || product.stock <= 0} onClick={add}>{loading ? "LOADING…" : product.stock <= 0 ? "OUT OF STOCK" : added ? "ADDED TO BAG ✓" : "ADD TO BAG"}<span>↗</span></button><div className="details"><p>{product.care_instructions || "Handcrafted textile · Gentle care recommended"}</p><p>{product.stock > 0 ? `${product.stock} available` : "Currently unavailable"}</p><p>Shipping calculated at checkout</p></div></div>
      </section>
      <ProductReviews productId={product.id} />
    </main>
  );
}
