"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Product = { id: string; slug: string; name: string; price: number; image_url: string | null; category_id: string | null };
type Category = { id: string; name: string; slug: string };
type CmsRow = { section: string; eyebrow: string | null; title: string | null; body: string | null; link_label: string | null; link_url: string | null; is_active: boolean; content_json: Record<string, unknown> | null };

const fallbackProducts: Product[] = [
  { id: "01", slug: "gulab", name: "Gulab Silk Saree", price: 2499, image_url: null, category_id: null },
  { id: "02", slug: "noor", name: "Noor Handloom Saree", price: 2899, image_url: null, category_id: null },
  { id: "03", slug: "madhubani", name: "Madhubani Saree", price: 3199, image_url: null, category_id: null },
  { id: "04", slug: "meher", name: "Meher Cotton Saree", price: 2199, image_url: null, category_id: null },
];

const fallbackCms: Record<string, CmsRow> = {
  hero: { section: "hero", eyebrow: "LE SHE SAREE / HANDCRAFTED INDIA", title: "TRADITION IN MOTION.", body: "Sarees made with Indian craft, softened by time, and designed for the way you live now.", link_label: "Explore collection", link_url: "#shop", is_active: true, content_json: {} },
  story: { section: "story", eyebrow: "CRAFTED IN INDIA", title: "WORN YOUR WAY.", body: "LE SHE SAREE brings the quiet richness of Indian textiles into an expressive, modern wardrobe.", link_label: null, link_url: null, is_active: true, content_json: {} },
  featured_products: { section: "featured_products", eyebrow: "01 — COLLECTION", title: "NEW ARRIVALS", body: null, link_label: null, link_url: null, is_active: true, content_json: {} },
  featured_collections: { section: "featured_collections", eyebrow: null, title: "EXPLORE COLLECTIONS", body: null, link_label: null, link_url: null, is_active: true, content_json: {} },
  banner: { section: "banner", eyebrow: "HANDCRAFTED INDIA", title: "", body: null, link_label: null, link_url: null, is_active: false, content_json: {} },
  footer: { section: "footer", eyebrow: null, title: "LE SHE SAREE", body: "Made to be worn. Made to be remembered.", link_label: "Shipping & Returns", link_url: "/shipping-and-return", is_active: true, content_json: {} },
};

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [bagCount, setBagCount] = useState(0);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cms, setCms] = useState<Record<string, CmsRow>>(fallbackCms);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 1600);
    const onMove = (event: MouseEvent) => setPointer({ x: event.clientX, y: event.clientY });
    const readBag = () => setBagCount(Number(window.localStorage.getItem("leshe-bag-count") || 0));
    const loadStorefront = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const [{ data: productData }, { data: categoryData }, { data: cmsData }] = await Promise.all([
        supabase.from("products").select("id,slug,name,price,image_url,category_id").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name,slug").eq("is_active", true).order("display_order", { ascending: true }),
        supabase.from("storefront_content").select("section,eyebrow,title,body,link_label,link_url,is_active,content_json").eq("is_active", true),
      ]);
      if (productData?.length) setProducts(productData as Product[]);
      if (categoryData?.length) setCategories(categoryData as Category[]);
      if (cmsData?.length) setCms(current => ({ ...current, ...Object.fromEntries((cmsData as CmsRow[]).map(row => [row.section, row])) }));
    };
    window.addEventListener("mousemove", onMove); window.addEventListener("storage", readBag); readBag(); loadStorefront();
    return () => { window.clearTimeout(timer); window.removeEventListener("mousemove", onMove); window.removeEventListener("storage", readBag); };
  }, []);

  const visibleProducts = activeCategory === "all" ? products : products.filter(product => product.category_id === activeCategory);
  const hero = cms.hero;
  const story = cms.story;
  const featured = cms.featured_products;
  const footer = cms.footer;
  const featuredIds = Array.isArray(featured.content_json?.product_ids) ? featured.content_json?.product_ids as string[] : [];
  const catalogProducts = featuredIds.length ? products.filter(product => featuredIds.includes(product.id)) : visibleProducts;

  return <main className="site-shell" style={{ "--mx": `${pointer.x}px`, "--my": `${pointer.y}px` } as React.CSSProperties}>
    <div className={`cursor ${intro ? "cursor-hidden" : ""}`} aria-hidden="true"><span>VIEW</span></div>
    <div className={`intro ${intro ? "intro-visible" : "intro-hidden"}`} aria-hidden={!intro}><div className="intro-mark">LE SHE</div><div className="intro-count">100</div></div>
    <header className="topbar"><a className="brand wordmark" href="#top">LE SHE<br/><span>SAREE</span></a><nav><a href="#shop">Shop</a><a href="#story">Story</a><a href="/bag">Bag ({bagCount})</a></nav><span className="top-meta">INDIA / 2026</span></header>
    <section id="top" className="hero"><p className="eyebrow">{hero.eyebrow}</p><h1>{hero.title?.split(" ").map((word, index) => <span key={`${word}-${index}`}>{word}{index < (hero.title?.split(" ").length || 1) - 1 ? " " : ""}</span>)}</h1><p className="hero-copy">{hero.body}</p><a className="hero-link magnetic" href={hero.link_url || "#shop"}>{hero.link_label || "Explore collection"} <b>↓</b></a></section>
    <section id="shop" className="collection"><div className="section-head"><span>{featured.eyebrow || "01 — COLLECTION"}</span><span>{featured.title || "NEW ARRIVALS"} / {catalogProducts.length}</span></div><div className="category-nav"><button className={activeCategory === "all" ? "selected" : ""} onClick={() => setActiveCategory("all")}>ALL</button>{categories.map(category => <button className={activeCategory === category.id ? "selected" : ""} onClick={() => setActiveCategory(category.id)} key={category.id}>{category.name}</button>)}</div><div className="product-grid">{catalogProducts.map((product, index) => <a className="product-card" href={`/product/${product.slug}`} key={product.id}><div className={`product-image image-${String(index + 1).padStart(2, "0")} tone-${["rose", "stone", "plum", "sand"][index % 4]}`} style={product.image_url ? { backgroundImage: `url(${product.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span>{product.name.split(" ")[0].toUpperCase()}</span><i>VIEW</i></div><div className="product-meta"><span>{product.name}</span><span>₹ {Number(product.price).toLocaleString("en-IN")}</span></div></a>)}</div>{catalogProducts.length === 0 && <div className="admin-empty">NO FEATURED PRODUCTS.</div>}</section>
    <section id="story" className="statement"><span>{story.eyebrow}</span><strong>{story.title?.split(" ").map((word, index) => <span key={`${word}-${index}`}>{word}<br /></span>)}</strong><p>{story.body}</p></section>
    <footer><div className="footer-big">{footer.title || "LE SHE SAREE"}</div><div className="footer-bottom"><span>© 2026 LE SHE SAREE</span><span>{footer.body || "Made to be worn. Made to be remembered."}</span><a href={footer.link_url || "/shipping-and-return"}>{footer.link_label || "Shipping & Returns"}</a></div></footer>
  </main>;
}
