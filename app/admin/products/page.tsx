"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Product = { id: string; name: string; slug: string; description: string | null; price: number; compare_at_price: number | null; sku: string | null; stock: number; sizes: string[]; image_url: string | null; is_active: boolean; category_id: string | null };
type Category = { id: string; name: string };

const blank = { name: "", slug: "", description: "", price: "", compare: "", sku: "", stock: "0", sizes: "", category: "", image: "", active: true };

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("SUPABASE ENVIRONMENT VARIABLES ARE NOT CONFIGURED."); setLoading(false); return; }
    const [{ data: p, error: pe }, { data: c, error: ce }] = await Promise.all([
      supabase.from("products").select("id,name,slug,description,price,compare_at_price,sku,stock,sizes,image_url,is_active,category_id").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("display_order", { ascending: true })
    ]);
    if (pe) setMessage(pe.message.toUpperCase()); else setProducts((p as Product[]) || []);
    if (!ce) setCategories((c as Category[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function change(key: keyof typeof blank, value: string | boolean) { setForm(f => ({ ...f, [key]: value })); }
  function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

  function edit(product: Product) {
    setEditing(product.id);
    setForm({ name: product.name, slug: product.slug, description: product.description || "", price: String(product.price), compare: product.compare_at_price == null ? "" : String(product.compare_at_price), sku: product.sku || "", stock: String(product.stock), sizes: (product.sizes || []).join(", "), category: product.category_id || "", image: product.image_url || "", active: product.is_active });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditing(null); setForm(blank); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("SUPABASE ENVIRONMENT VARIABLES ARE NOT CONFIGURED."); setSaving(false); return; }
    const payload = { name: form.name.trim(), slug: form.slug.trim() || slugify(form.name), description: form.description.trim() || null, price: Number(form.price) || 0, compare_at_price: form.compare.trim() ? Number(form.compare) : null, sku: form.sku.trim() || null, stock: Math.max(0, Number(form.stock) || 0), sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean), image_url: form.image.trim() || null, category_id: form.category || null, is_active: Boolean(form.active), updated_at: new Date().toISOString() };
    const result = editing ? await supabase.from("products").update(payload).eq("id", editing) : await supabase.from("products").insert(payload);
    if (result.error) setMessage(result.error.message.toUpperCase()); else { setMessage(editing ? "PRODUCT UPDATED." : "PRODUCT CREATED."); reset(); await load(); }
    setSaving(false);
  }

  async function toggle(product: Product) { const supabase = getSupabaseBrowserClient(); if (!supabase) return; const { error } = await supabase.from("products").update({ is_active: !product.is_active, updated_at: new Date().toISOString() }).eq("id", product.id); if (error) setMessage(error.message.toUpperCase()); else load(); }
  async function remove(product: Product) { if (!window.confirm(`Delete ${product.name}?`)) return; const supabase = getSupabaseBrowserClient(); if (!supabase) return; const { error } = await supabase.from("products").delete().eq("id", product.id); if (error) setMessage(error.message.toUpperCase()); else load(); }

  return <div className="admin-dashboard">
    <header className="admin-header"><div><span>02 — CATALOG</span><h1>PRODUCT<br/><i>ROOM.</i></h1></div><div className="admin-status"><span className="status-dot"/> SUPABASE / LIVE<br/><small>PRODUCT CRUD</small></div></header>
    <section className="admin-section"><div className="admin-section-title"><span>{editing ? "EDIT PRODUCT" : "ADD PRODUCT"}</span><span>CATALOG / CORE</span></div>
      <form className="admin-form" onSubmit={save}>
        <label>Product name<input required value={form.name} onChange={e => change("name", e.target.value)} placeholder="Gulab Silk Saree" /></label>
        <label>Slug<input value={form.slug} onChange={e => change("slug", e.target.value)} placeholder="gulab-silk-saree" /></label>
        <label>Category<select value={form.category} onChange={e => change("category", e.target.value)}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Description<textarea value={form.description} onChange={e => change("description", e.target.value)} rows={3} /></label>
        <div className="form-row"><label>Price<input required type="number" min="0" step="0.01" value={form.price} onChange={e => change("price", e.target.value)} /></label><label>Compare price<input type="number" min="0" step="0.01" value={form.compare} onChange={e => change("compare", e.target.value)} /></label></div>
        <div className="form-row"><label>SKU<input value={form.sku} onChange={e => change("sku", e.target.value)} /></label><label>Stock<input type="number" min="0" value={form.stock} onChange={e => change("stock", e.target.value)} /></label></div>
        <label>Sizes <small>comma separated</small><input value={form.sizes} onChange={e => change("sizes", e.target.value)} placeholder="Free Size, 36, 38" /></label>
        <label>Image URL<input value={form.image} onChange={e => change("image", e.target.value)} placeholder="https://..." /></label>
        <label className="check-row"><input type="checkbox" checked={form.active} onChange={e => change("active", e.target.checked)} /> Active on storefront</label>
        <div className="form-actions"><button className="admin-action admin-submit" disabled={saving}>{saving ? "SAVING…" : editing ? "UPDATE PRODUCT →" : "CREATE PRODUCT →"}</button>{editing && <button type="button" className="admin-action" onClick={reset}>CANCEL</button>}</div>
      </form>{message && <div className="admin-empty">{message}</div>}
    </section>
    <section className="admin-section"><div className="admin-section-title"><span>PRODUCTS</span><button className="admin-action" onClick={load}>REFRESH ↻</button></div>
      {loading ? <div className="admin-empty">LOADING PRODUCTS…</div> : products.length === 0 ? <div className="admin-empty">NO PRODUCTS YET.</div> : <div className="admin-table"><div className="admin-row admin-row-head"><span>PRODUCT</span><span>SKU</span><span>PRICE</span><span>STOCK</span><span>ACTION</span></div>{products.map(p => <div className="admin-row" key={p.id}><strong>{p.name}</strong><span>{p.sku || "—"}</span><span>₹ {Number(p.price).toLocaleString("en-IN")}</span><span>{p.stock}</span><span className="row-actions"><button className="table-action" onClick={() => edit(p)}>EDIT</button><button className="table-action" onClick={() => toggle(p, p.is_active)}>{p.is_active ? "HIDE" : "SHOW"}</button><button className="table-action danger" onClick={() => remove(p)}>DELETE</button></span></div>)}</div>}
    </section>
  </div>;
}
