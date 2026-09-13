"use client";

import { useEffect, useState } from "react";

const products = [
  { id: "01", slug: "gulab", name: "Gulab Silk Saree", price: 2499, tone: "rose", label: "GULAB" },
  { id: "02", slug: "noor", name: "Noor Handloom Saree", price: 2899, tone: "stone", label: "NOOR" },
  { id: "03", slug: "madhubani", name: "Madhubani Saree", price: 3199, tone: "plum", label: "MADHU" },
  { id: "04", slug: "meher", name: "Meher Cotton Saree", price: 2199, tone: "sand", label: "MEHER" },
];

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [bagCount, setBagCount] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 1600);
    const onMove = (event: MouseEvent) => setPointer({ x: event.clientX, y: event.clientY });
    const readBag = () => setBagCount(Number(window.localStorage.getItem("leshe-bag-count") || 0));
    window.addEventListener("mousemove", onMove);
    window.addEventListener("storage", readBag);
    readBag();
    return () => { window.clearTimeout(timer); window.removeEventListener("mousemove", onMove); window.removeEventListener("storage", readBag); };
  }, []);

  return (
    <main className="site-shell" style={{ "--mx": `${pointer.x}px`, "--my": `${pointer.y}px` } as React.CSSProperties}>
      <div className={`cursor ${intro ? "cursor-hidden" : ""}`} aria-hidden="true"><span>VIEW</span></div>
      <div className={`intro ${intro ? "intro-visible" : "intro-hidden"}`} aria-hidden={!intro}>
        <div className="intro-mark">LE SHE</div><div className="intro-count">100</div>
      </div>

      <header className="topbar">
        <a className="brand wordmark" href="#top">LE SHE<br /><span>SAREE</span></a>
        <nav><a href="#shop">Shop</a><a href="#story">Story</a><a href="/bag">Bag ({bagCount})</a></nav>
        <span className="top-meta">INDIA / 2026</span>
      </header>

      <section id="top" className="hero">
        <p className="eyebrow">LE SHE SAREE / HANDCRAFTED INDIA</p>
        <h1>TRADITION<br /><span>IN MOTION.</span></h1>
        <p className="hero-copy">Sarees made with Indian craft, softened by time, and designed for the way you live now.</p>
        <a className="hero-link magnetic" href="#shop">Explore collection <b>↓</b></a>
      </section>

      <section id="shop" className="collection">
        <div className="section-head"><span>01 — COLLECTION</span><span>NEW ARRIVALS / {products.length}</span></div>
        <div className="product-grid">
          {products.map((product) => (
            <a className="product-card" href={`/product/${product.slug}`} key={product.id}>
              <div className={`product-image image-${product.id} tone-${product.tone}`}><span>{product.label}</span><i>VIEW</i></div>
              <div className="product-meta"><span>{product.name}</span><span>₹ {product.price.toLocaleString("en-IN")}</span></div>
            </a>
          ))}
        </div>
      </section>

      <section id="story" className="statement"><span>CRAFTED IN INDIA</span><strong>WORN<br />YOUR WAY.</strong><p>LE SHE SAREE brings the quiet richness of Indian textiles into an expressive, modern wardrobe.</p></section>

      <footer><div className="footer-big">LE SHE<br />SAREE</div><div className="footer-bottom"><span>© 2026 LE SHE SAREE</span><span>Made to be worn. Made to be remembered.</span><a href="/shipping-and-return">Shipping & Returns</a></div></footer>
    </main>
  );
}
