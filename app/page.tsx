"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="site-shell">
      <div className={`intro ${intro ? "intro-visible" : "intro-hidden"}`} aria-hidden={!intro}>
        <div className="intro-mark">LS</div>
        <div className="intro-count">100</div>
      </div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Leshe Saree home">++</a>
        <nav>
          <a href="#shop">Shop</a>
          <a href="/bag">Bag (0)</a>
        </nav>
        <div className="theme-dots" aria-label="Theme selector">
          <button className="dot dot-dark" aria-label="Dark theme" />
          <button className="dot dot-light" aria-label="Light theme" />
          <button className="dot dot-accent" aria-label="Accent theme" />
        </div>
      </header>

      <section id="top" className="hero">
        <p className="eyebrow">LESHE SAREE / 2026</p>
        <h1>TRADITION<br /><span>IN MOTION.</span></h1>
        <p className="hero-copy">Indian craftsmanship, reimagined through a bold contemporary lens.</p>
        <a className="hero-link" href="#shop">Explore collection ↓</a>
      </section>

      <section id="shop" className="collection">
        <div className="section-head">
          <span>01 — COLLECTION</span>
          <span>NEW ARRIVALS</span>
        </div>
        <div className="product-grid">
          {["01", "02", "03", "04"].map((item) => (
            <article className="product-card" key={item}>
              <div className={`product-image image-${item}`}>
                <span>LESHE</span>
              </div>
              <div className="product-meta">
                <span>Signature Saree {item}</span>
                <span>₹ 2,499</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="statement">
        <span>CRAFTED IN INDIA</span>
        <strong>WORN<br />YOUR WAY.</strong>
      </section>

      <footer>
        <div className="footer-big">LESHE<br />SAREE</div>
        <div className="footer-bottom">
          <span>© 2026 LESHE SAREE</span>
          <span>Made to be worn. Made to be remembered.</span>
          <a href="/shipping-and-return">Shipping & Returns</a>
        </div>
      </footer>
    </main>
  );
}
