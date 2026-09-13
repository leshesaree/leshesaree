"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Category = { id: string; name: string; slug: string; description: string | null; display_order: number; is_active: boolean };

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("SUPABASE ENVIRONMENT VARIABLES ARE NOT CONFIGURED."); setLoading(false); return; }
    const { data, error } = await supabase.from("categories").select("id,name,slug,description,display_order,is_active").order("display_order", { ascending: true });
    if (error) setMessage(error.message.toUpperCase()); else setCategories((data as Category[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function makeSlug(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("SUPABASE ENVIRONMENT VARIABLES ARE NOT CONFIGURED."); setSaving(false); return; }
    const { error } = await supabase.from("categories").insert({ name: name.trim(), slug: slug.trim() || makeSlug(name), description: description.trim() || null, display_order: Number(order) || 0, is_active: true });
    if (error) setMessage(error.message.toUpperCase());
    else { setName(""); setSlug(""); setDescription(""); setOrder("0"); setMessage("CATEGORY CREATED."); await load(); }
    setSaving(false);
  }

  async function toggle(id: string, active: boolean) {
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    const { error } = await supabase.from("categories").update({ is_active: !active }).eq("id", id);
    if (error) setMessage(error.message.toUpperCase()); else load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this category? Products linked to it may prevent deletion.")) return;
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) setMessage(error.message.toUpperCase()); else load();
  }

  return <div className="admin-dashboard">
    <header className="admin-header"><div><span>03 — CATALOG</span><h1>CATEGORY<br/><i>ROOM.</i></h1></div><div className="admin-status"><span className="status-dot"/> SUPABASE / LIVE<br/><small>CATEGORY MANAGEMENT</small></div></header>
    <section className="admin-section"><div className="admin-section-title"><span>ADD CATEGORY</span><span>CATALOG / CORE</span></div>
      <form className="admin-form" onSubmit={addCategory}>
        <label>Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Sarees" /></label>
        <label>Slug<input value={slug} onChange={e => setSlug(e.target.value)} placeholder="sarees" /></label>
        <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Category description" rows={2} /></label>
        <label>Display order<input type="number" min="0" value={order} onChange={e => setOrder(e.target.value)} /></label>
        <button className="admin-action admin-submit" disabled={saving}>{saving ? "SAVING…" : "CREATE CATEGORY →"}</button>
      </form>
      {message && <div className="admin-empty">{message}</div>}
    </section>
    <section className="admin-section"><div className="admin-section-title"><span>CATEGORIES</span><button className="admin-action" onClick={load}>REFRESH ↻</button></div>
      {loading ? <div className="admin-empty">LOADING…</div> : categories.length === 0 ? <div className="admin-empty">NO CATEGORIES YET.</div> : <div className="admin-table"><div className="admin-row admin-row-head"><span>NAME</span><span>SLUG</span><span>ORDER</span><span>STATUS</span><span>ACTION</span></div>{categories.map(c => <div className="admin-row" key={c.id}><strong>{c.name}</strong><span>{c.slug}</span><span>{c.display_order}</span><button className="table-action" onClick={() => toggle(c.id, c.is_active)}>{c.is_active ? "ACTIVE" : "HIDDEN"}</button><button className="table-action danger" onClick={() => remove(c.id)}>DELETE</button></div>)}</div>}
    </section>
  </div>;
}
