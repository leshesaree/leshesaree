"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sku: string | null;
  is_active: boolean;
  category_id: string | null;
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setConnected(false);
      setLoading(false);
      return;
    }
    const { data, error: queryError } = await supabase
      .from("products")
      .select("id,name,slug,price,stock,sku,is_active,category_id")
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div><span>02 — CATALOG</span><h1>PRODUCT<br /><i>ROOM.</i></h1></div>
        <div className="admin-status"><span className={`status-dot ${connected ? "" : "status-off"}`} /> {connected ? "SUPABASE / CONNECTED" : "SUPABASE / ENV NEEDED"}<br /><small>LIVE PRODUCTS DATABASE</small></div>
      </header>

      <section className="admin-section">
        <div className="admin-section-title"><span>PRODUCTS</span><button className="admin-action" onClick={loadProducts}>REFRESH ↻</button></div>
        {loading ? <div className="admin-empty">LOADING PRODUCTS…</div> : error ? <div className="admin-empty">DATABASE ERROR — {error}</div> : products.length === 0 ? <div className="admin-empty">NO PRODUCTS YET — ADD YOUR FIRST SAREE IN SUPABASE.</div> : (
          <div className="admin-table">
            <div className="admin-row admin-row-head"><span>PRODUCT</span><span>SKU</span><span>PRICE</span><span>STOCK</span><span>STATUS</span></div>
            {products.map((product) => <div className="admin-row" key={product.id}><strong>{product.name}</strong><span>{product.sku || "—"}</span><span>₹ {Number(product.price).toLocaleString("en-IN")}</span><span>{product.stock}</span><span className={product.is_active ? "active-label" : "inactive-label"}>{product.is_active ? "ACTIVE" : "HIDDEN"}</span></div>)}
          </div>
        )}
      </section>

      <section className="admin-note"><span>LIVE LAYER</span><p>This screen now reads directly from the Supabase products table. Product creation/editing will be enabled after admin authentication and RLS are wired.</p></section>
    </div>
  );
}
