"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Product = { id: string; slug: string; name: string; price: number; image_url: string | null; category_id: string | null };
type Category = { id: string; name: string; slug: string };

const fallbackProducts = [
  { id: "01", slug: "gulab", name: "Gulab Silk Saree", price: 2499, image_url: null, category_id: null },
  { id: "02", slug: "noor", name: "Noor Handloom Saree", price: 2899, image_url: null, category_id: null },
  { id: "03", slug: "madhubani", name: "Madhubani Saree", price: 3199, image_url: null, category_id: null },
  { id: "04", slug: "meher", name: "Meher Cotton Saree", price: 2199, image_url: null, category_id: null },
];

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [bagCount, setBagCount] = useState(0);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 1600);
    const onMove = (event: MouseEvent) => setPointer({ x: event.clientX, y: event.clientY });
    const readBag = () => setBagCount(Number(window.localStorage.getItem("leshe-bag-count") || 0));
    const loadCatalog = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const [{ data: productData }, { data: categoryData }] = await Promise.all([
        supabase.from("products").select("id,slug,name,price,image_url,category_id").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name,slug").eq("is_active", true).order("display_order", { ascending: true }),
      ]);
      if (productData?.length) setProducts(productData as Product[]);
      if (categoryData?.length) setCategories(categoryData as Category[]);
    };
    window.addEventListener("mousemove", onMove); window.addEventListener("storage", readBag); readBag(); loadCatalog();
    return () => { window.clearTimeout(timer); window.removeEventListener("mousemove", onMove); window.removeEventListener("storage", readBag); };
  }, []);

  const visibleProducts = activeCategory === "all" ? products : products.filter(product => product.category_id === activeCategory);

  return <main className="site-shell" style={{ "--mx": `${pointer.x}px`, "--my": `${pointer.y}px` } as React.CSSProperties}>
    <div className={`cursor ${intro ? "cursor-hidden" : ""}`} aria-hidden="true"><span>VIEW</span></div>
    <div className={`intro ${intro ? "intro-visible" : "intro-hidden"}`} aria-hidden={!intro}><div className="intro-mark">LE SHE</div><div className="intro-count">100</div></div>
    <header className="topbar"><a className="brand wordmark" href="#top">LE SHE<br/><span>SAREE</span></a><nav><a href="#shop">Shop</a><a href="#story">Story</a><a href="/bag">Bag ({bagCount})</a></nav><span className="top-meta">INDIA / 2026</span></header>
    <section id="top" className="hero"><p className="eyebrow">LE SHE SAREE / HANDCRAFTED INDIA</p><h1>TRADITION<br/><span>IN MOTION.</span></h1><p className="hero-copy">Sarees made with Indian craft, softened by time, and designed for the way you live now.</p><a className="hero-link magnetic" href="#shop">Explore collection <b>↓</b></a></section>
    <section id="shop" className="collection"><div className="section-head"><span>01 — COLLECTION</span><span>NEW ARRIVALS / {visibleProducts.length}</span></div><div className="category-nav"><button className={activeCategory === "all" ? "selected" : ""} onClick={() => setActiveCategory("all")}>ALL</button>{categories.map(category => <button className={activeCategory === category.id ? "selected" : ""} onClick={() => setActiveCategory(category.id)} key={category.id}>{category.name}</button>)}</div><div className="product-grid">{visibleProducts.map((product, index) => <a className="product-card" href={`/product/${product.slug}`} key={product.id}><div className={`product-image image-${String(index + 1).padStart(2, "0")} tone-${["rose", "stone", "plum", "sand"][index % 4]}`} style={product.image_url ? { backgroundImage: `url(${product.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span>{product.name.split(" ")[0].toUpperCase()}</span><i>VIEW</i></div><div className="product-meta"><span>{product.name}</span><span>₹ {Number(product.price).toLocaleString("en-IN")}</span></div></a>)}</div>{visibleProducts.length === 0 && <div className="admin-empty">NO PRODUCTS IN THIS CATEGORY.</div>}</section>
    <section id="story" className="statement"><span>CRAFTED IN INDIA</span><strong>WORN<br/>YOUR WAY.</strong><p>LE SHE SAREE brings the quiet richness of Indian textiles into an expressive, modern wardrobe.</p></section>
    <footer><div className="footer-big">LE SHE<br/>SAREE</div><div className="footer-bottom"><span>© 2026 LE SHE SAREE</span><span>Made to be worn. Made to be remembered.</span><a href="/shipping-and-return">Shipping & Returns</a></div></footer>
  </main>;
}
