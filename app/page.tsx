"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import MotionEnhancer from "./motion-enhancer";
import ProductCard from "./product-card";

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

function cmsImage(row: CmsRow | undefined) {
  const json = row?.content_json;
  if (!json) return null;
  const candidates = [json.hero_image_url, json.image_url, json.image, json.desktop_image, json.cover_image];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() || null;
}

function displayImageUrl(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && (parsed.hostname === "i.ibb.co" || parsed.hostname === "ibb.co")) return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  } catch {}
  return url;
}

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [bagCount, setBagCount] = useState(0);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cms, setCms] = useState<Record<string, CmsRow>>(fallbackCms);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 900);
    const onMove = (e: MouseEvent) => setPointer({ x: e.clientX, y: e.clientY });
    const readBag = () => setBagCount(Number(window.localStorage.getItem("leshe-bag-count") || 0));
    const load = async () => {
      const s = getSupabaseBrowserClient();
      if (!s) { setLoading(false); return; }
      try {
        const [{ data: p }, { data: c }, { data: m }] = await Promise.all([
          s.from("products").select("id,slug,name,price,image_url,category_id").eq("is_active", true).order("created_at", { ascending: false }),
          s.from("categories").select("id,name,slug").eq("is_active", true).order("display_order", { ascending: true }),
          s.from("storefront_content").select("section,eyebrow,title,body,link_label,link_url,is_active,content_json").eq("is_active", true),
        ]);
        if (p?.length) setProducts(p as Product[]);
        if (c?.length) setCategories(c as Category[]);
        if (m?.length) setCms(cur => ({ ...cur, ...Object.fromEntries((m as CmsRow[]).map(r => [r.section, r])) }));
      } finally { setLoading(false); }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("storage", readBag);
    window.addEventListener("leshe-bag-updated", readBag);
    readBag(); load();
    return () => { window.clearTimeout(timer); window.removeEventListener("mousemove", onMove); window.removeEventListener("storage", readBag); window.removeEventListener("leshe-bag-updated", readBag); };
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); setSearchOpen(true); window.setTimeout(() => document.getElementById("storefront-search")?.focus(), 0);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  const visibleProducts = useMemo(() => {
    const base = activeCategory === "all" ? products : products.filter(p => p.category_id === activeCategory);
    const q = query.trim().toLowerCase();
    return q ? base.filter(p => `${p.name} ${p.slug}`.toLowerCase().includes(q)) : base;
  }, [activeCategory, products, query]);

  const hero = cms.hero, story = cms.story, featured = cms.featured_products, footer = cms.footer;
  const heroImage = cmsImage(hero);
  const featuredIds = Array.isArray(featured.content_json?.product_ids) ? featured.content_json.product_ids as string[] : [];
  const catalogProducts = featuredIds.length ? visibleProducts.filter(p => featuredIds.includes(p.id)) : visibleProducts;
  const categoryImages = useMemo(() => new Map(categories.map(c => [c.id, products.find(p => p.category_id === c.id)?.image_url || null])), [categories, products]);

  return (
    <main id="top" className="site-shell ls-home" style={{ "--mx": `${pointer.x}px`, "--my": `${pointer.y}px` } as React.CSSProperties}>
      <MotionEnhancer />
      <div className={`intro ${intro ? "intro-visible" : "intro-hidden"}`} aria-hidden={!intro}><div className="intro-mark">LE SHE</div><div className="intro-count">100</div></div>

      <div className="ls-promo"><span>FREE SHIPPING ON ALL ORDERS OVER ₹2,000</span><b>|</b><span>AUTHENTIC SAREES</span><b>|</b><span>EASY RETURNS</span></div>
      <header className="ls-header">
        <a className="ls-logo" href="#top" aria-label="LE SHE SAREE home"><strong>LE SHE</strong><small>SAREE</small></a>
        <nav aria-label="Main navigation"><a href="#top">Home</a><a href="#shop">Shop</a><a href="#categories">Categories</a><a href="#shop">New Arrivals</a><a href="#shop">Offers</a><a href="#story">About</a></nav>
        <div className="ls-tools"><button type="button" onClick={() => setSearchOpen(true)} aria-label="Search">⌕</button><Link href="/account" aria-label="Account">♙</Link><Link href="/wishlist" aria-label="Wishlist">♡</Link><a href="/bag" className="ls-bag" aria-label={`Shopping bag, ${bagCount} items`}>🛍<i>{bagCount}</i></a></div>
      </header>

      {searchOpen && <div className="search-panel" role="search"><div className="search-panel-inner"><span>FIND A PIECE</span><input id="storefront-search" autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sarees, collections…"/><button type="button" onClick={() => { setQuery(""); setSearchOpen(false); }} aria-label="Close search">×</button><small>Press / to search · ESC to close</small></div></div>}

      <section className={`ls-hero ${heroImage ? "has-image" : ""}`} aria-labelledby="hero-title">
        {heroImage && <div className="ls-hero-image"><img src={displayImageUrl(heroImage) || heroImage} alt="" loading="eager" fetchPriority="high" /></div>}
        <div className="ls-hero-copy"><p className="ls-eyebrow">{hero.eyebrow || "LE SHE SAREE / HANDCRAFTED INDIA"}</p><h1 id="hero-title">Timeless<br/><em>Elegance</em></h1><p>{hero.body || "Sarees for every story, for every you."}</p><a href={hero.link_url || "#shop"}>SHOP NOW <span>→</span></a></div>
        <div className="ls-hero-script">Wear<br/>Your<br/><em>Story</em> ♥</div>
        <button className="ls-arrow left" aria-label="Previous">‹</button><button className="ls-arrow right" aria-label="Next">›</button><div className="ls-dots"><i/><i className="active"/><i/></div>
      </section>

      <section className="ls-benefits" aria-label="Store benefits"><div><b>♧</b><span><strong>Free Shipping</strong><small>On orders over ₹2,000</small></span></div><div><b>♢</b><span><strong>Secure Payment</strong><small>100% safe & secure</small></span></div><div><b>⟳</b><span><strong>Easy Returns</strong><small>Hassle-free returns</small></span></div><div><b>♧</b><span><strong>Dedicated Support</strong><small>We're here to help</small></span></div></section>

      <section id="categories" className="ls-categories" aria-labelledby="category-title"><div className="ls-section-title"><h2 id="category-title">Shop by Category</h2><a href="#shop">View All →</a></div><div className="ls-category-row">{categories.slice(0, 7).map((c, i) => { const src = displayImageUrl(categoryImages.get(c.id) || heroImage); return <button key={c.id} type="button" className="ls-category" onClick={() => { setActiveCategory(c.id); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>{src ? <img src={src} alt="" /> : <span>{String(i + 1).padStart(2, "0")}</span>}<strong>{c.name}</strong></button>; })}<button className="ls-category all" type="button" onClick={() => { setActiveCategory("all"); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}><span>▦</span><strong>All Categories</strong></button></div></section>

      <section id="shop" className="ls-products" aria-labelledby="products-title"><div className="ls-section-title"><div><h2 id="products-title">Bestsellers</h2><p>Our most loved sarees, chosen by you.</p></div><a href="#shop">View All →</a></div><div className="ls-filter" role="tablist" aria-label="Filter products">{categories.map(c => <button key={c.id} className={activeCategory === c.id ? "active" : ""} onClick={() => setActiveCategory(c.id)}>{c.name}</button>)}</div>{query && <div className="search-results-note">SEARCH / <strong>{query}</strong> / {catalogProducts.length}</div>}{loading ? <div className="product-grid product-grid-loading">{[1, 2, 3, 4].map(i => <div className="product-skeleton" key={i}><div/><span/><span/></div>)}</div> : <div className="ls-product-grid">{catalogProducts.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} categoryName={categories.find(c => c.id === p.category_id)?.name} />)}</div>}{!loading && !catalogProducts.length && <div className="storefront-empty"><strong>NOTHING HERE YET.</strong><span>Try another search or collection.</span><button type="button" onClick={() => { setQuery(""); setActiveCategory("all"); }}>VIEW ALL →</button></div>}</section>

      <section id="story" className="ls-story"><div><p className="ls-eyebrow">{story.eyebrow || "CRAFTED IN INDIA"}</p><h2>Made to be<br/><em>remembered.</em></h2></div><p>{story.body || "LE SHE SAREE brings the quiet richness of Indian textiles into an expressive, modern wardrobe."}</p></section>
      <footer className="ls-footer"><strong>{footer.title || "LE SHE SAREE"}</strong><div><span>© 2026 LE SHE SAREE</span><span>{footer.body || "Made to be worn. Made to be remembered."}</span><a href={footer.link_url || "/shipping-and-return"}>{footer.link_label || "Shipping & Returns"}</a></div></footer>
    </main>
  );
}
