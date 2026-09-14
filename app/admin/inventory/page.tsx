"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Product = { id: string; name: string; sku: string | null; stock: number; is_active: boolean };

export default function InventoryAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const lowStock = 5;

  async function load() {
    setLoading(true); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("SUPABASE ENVIRONMENT VARIABLES ARE NOT CONFIGURED."); setLoading(false); return; }
    const { data, error } = await supabase.from("products").select("id,name,sku,stock,is_active").order("stock", { ascending: true });
    if (error) setMessage(error.message.toUpperCase()); else setProducts((data as Product[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const totalUnits = useMemo(() => products.reduce((sum, p) => sum + Number(p.stock || 0), 0), [products]);
  const lowCount = useMemo(() => products.filter(p => Number(p.stock) <= lowStock).length, [products]);
  const outCount = useMemo(() => products.filter(p => Number(p.stock) === 0).length, [products]);

  async function updateStock(id: string) {
    const raw = draft[id] ?? String(products.find(p => p.id === id)?.stock ?? 0);
    if (!/^\d+$/.test(raw.trim())) { setMessage("STOCK MUST BE A WHOLE NUMBER."); return; }
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 0) { setMessage("STOCK MUST BE A VALID NON-NEGATIVE WHOLE NUMBER."); return; }
    setSaving(id); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("SUPABASE ENVIRONMENT VARIABLES ARE NOT CONFIGURED."); setSaving(null); return; }
    const { error } = await supabase.from("products").update({ stock: value, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setMessage(error.message.toUpperCase()); else { setMessage("STOCK UPDATED."); await load(); }
    setSaving(null);
  }

  return <div className="admin-dashboard">
    <header className="admin-header"><div><span>04 — OPERATIONS</span><h1>STOCK<br/><i>ROOM.</i></h1></div><div className="admin-status"><span className="status-dot"/> SUPABASE / LIVE<br/><small>INVENTORY CONTROL</small></div></header>
    <section className="stat-grid"><div className="stat-card"><strong>{products.length}</strong><span>Products</span></div><div className="stat-card"><strong>{totalUnits}</strong><span>Total units</span></div><div className="stat-card"><strong>{lowCount}</strong><span>Low stock ≤ {lowStock}</span></div><div className="stat-card"><strong>{outCount}</strong><span>Out of stock</span></div></section>
    <section className="admin-section"><div className="admin-section-title"><span>INVENTORY</span><button className="admin-action" onClick={load}>REFRESH ↻</button></div>
      {loading ? <div className="admin-empty">LOADING INVENTORY…</div> : products.length === 0 ? <div className="admin-empty">NO PRODUCTS IN INVENTORY.</div> : <div className="admin-table"><div className="admin-row admin-row-head"><span>PRODUCT</span><span>SKU</span><span>STOCK</span><span>STATUS</span><span>UPDATE</span></div>{products.map(p => <div className={`admin-row ${p.stock === 0 ? "stock-out" : p.stock <= lowStock ? "stock-low" : ""}`} key={p.id}><strong>{p.name}</strong><span>{p.sku || "—"}</span><span><b>{p.stock}</b> {p.stock === 0 ? "OUT" : p.stock <= lowStock ? "LOW" : "IN STOCK"}</span><span>{p.is_active ? "ACTIVE" : "HIDDEN"}</span><span className="row-actions"><input aria-label={`Stock for ${p.name}`} className="stock-input" type="number" min="0" step="1" value={draft[p.id] ?? p.stock} onChange={e => setDraft(d => ({ ...d, [p.id]: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") updateStock(p.id); }} /><button className="table-action" disabled={saving === p.id} onClick={() => updateStock(p.id)}>{saving === p.id ? "…" : "SAVE"}</button></span></div>)}</div>}
    </section>
    {message && <section className="admin-note"><span>INVENTORY STATUS</span><p>{message}</p></section>}
  </div>;
}
