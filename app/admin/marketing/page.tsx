"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Campaign = {
  id: string;
  name: string;
  type: string;
  code: string | null;
  discount_percent: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  description: string | null;
  priority: number;
};

const emptyForm = {
  name: "",
  type: "Collection",
  code: "",
  discount: "10",
  priority: "1",
  description: "",
  startsAt: "",
  endsAt: "",
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCampaigns() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Store connection is not configured yet.");
      setLoading(false);
      return;
    }
    const { data, error: loadError } = await supabase
      .from("marketing_campaigns")
      .select("id,name,type,code,discount_percent,starts_at,ends_at,is_active,description,priority")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setCampaigns((data || []) as Campaign[]);
    setLoading(false);
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  const metrics = useMemo(() => ({
    total: campaigns.length,
    active: campaigns.filter((item) => item.is_active).length,
    coupons: campaigns.filter((item) => item.type === "Coupon").length,
    flash: campaigns.filter((item) => item.type === "Flash Sale").length,
  }), [campaigns]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editCampaign(campaign: Campaign) {
    setEditingId(campaign.id);
    setActive(campaign.is_active);
    setForm({
      name: campaign.name,
      type: campaign.type,
      code: campaign.code || "",
      discount: String(campaign.discount_percent),
      priority: String(campaign.priority),
      description: campaign.description || "",
      startsAt: campaign.starts_at ? campaign.starts_at.slice(0, 16) : "",
      endsAt: campaign.ends_at ? campaign.ends_at.slice(0, 16) : "",
    });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setActive(true);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Store connection is not configured yet.");
      setBusy(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      code: form.code.trim() || null,
      discount_percent: Math.max(0, Math.min(100, Number(form.discount) || 0)),
      priority: Math.max(0, Number(form.priority) || 0),
      description: form.description.trim() || null,
      starts_at: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      is_active: active,
      updated_at: new Date().toISOString(),
    };

    if (!payload.name) {
      setError("Campaign name is required.");
      setBusy(false);
      return;
    }

    const result = editingId
      ? await supabase.from("marketing_campaigns").update(payload).eq("id", editingId)
      : await supabase.from("marketing_campaigns").insert(payload);

    if (result.error) setError(result.error.message);
    else {
      setMessage(editingId ? "CAMPAIGN UPDATED ✓" : "CAMPAIGN CREATED ✓");
      resetForm();
      await loadCampaigns();
    }
    setBusy(false);
  }

  async function toggleCampaign(campaign: Campaign) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error: toggleError } = await supabase
      .from("marketing_campaigns")
      .update({ is_active: !campaign.is_active, updated_at: new Date().toISOString() })
      .eq("id", campaign.id);
    if (toggleError) setError(toggleError.message);
    else await loadCampaigns();
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">06 / MARKETING</span>
          <h1>CAMPAIGNS<br/><i>THAT MOVE.</i></h1>
          <p>Plan promotions, coupons and limited-time drops from one control room.</p>
        </div>
        <button className="admin-primary" type="submit" form="campaign-form" disabled={busy}>{busy ? "SAVING…" : editingId ? "UPDATE CAMPAIGN →" : "SAVE CAMPAIGN →"}</button>
      </header>

      <div className="admin-metrics">
        <div><span>CAMPAIGNS</span><strong>{String(metrics.total).padStart(2, "0")}</strong></div>
        <div><span>ACTIVE</span><strong>{String(metrics.active).padStart(2, "0")}</strong></div>
        <div><span>COUPONS</span><strong>{String(metrics.coupons).padStart(2, "0")}</strong></div>
        <div><span>FLASH SALES</span><strong>{String(metrics.flash).padStart(2, "0")}</strong></div>
      </div>

      <div className="admin-panel-grid">
        <form id="campaign-form" className="admin-panel" onSubmit={save}>
          <span className="admin-eyebrow">{editingId ? "EDIT CAMPAIGN" : "CAMPAIGN BUILDER"}</span>
          <label>Campaign name<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Festive Edit" /></label>
          <label>Campaign type<select value={form.type} onChange={(event) => updateField("type", event.target.value)}><option>Collection</option><option>Coupon</option><option>Flash Sale</option></select></label>
          <label>Promotion code<input value={form.code} onChange={(event) => updateField("code", event.target.value.toUpperCase())} placeholder="FESTIVE10" /></label>
          <div className="admin-form-row">
            <label>Discount %<input type="number" value={form.discount} onChange={(event) => updateField("discount", event.target.value)} min="0" max="100" /></label>
            <label>Priority<input type="number" value={form.priority} onChange={(event) => updateField("priority", event.target.value)} min="0" /></label>
          </div>
          <div className="admin-form-row">
            <label>Starts<input type="datetime-local" value={form.startsAt} onChange={(event) => updateField("startsAt", event.target.value)} /></label>
            <label>Ends<input type="datetime-local" value={form.endsAt} onChange={(event) => updateField("endsAt", event.target.value)} /></label>
          </div>
          <label>Short description<textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="A limited festive edit for contemporary Indian sarees." rows={4} /></label>
          <button type="button" className={`admin-toggle ${active ? "is-on" : ""}`} onClick={() => setActive(!active)}><span>CAMPAIGN ACTIVE</span><b>{active ? "ON" : "OFF"}</b></button>
          {editingId && <button type="button" className="admin-secondary" onClick={resetForm}>CANCEL EDIT</button>}
          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}
        </form>

        <div className="admin-panel">
          <div className="admin-panel-head"><span className="admin-eyebrow">CAMPAIGN QUEUE</span><button className="admin-secondary" onClick={resetForm}>+ NEW</button></div>
          <div className="admin-list">
            {loading ? <div className="admin-note">Loading campaigns…</div> : campaigns.length === 0 ? <div className="admin-note"><strong>NO CAMPAIGNS YET</strong><span>Create your first campaign from the builder.</span></div> : campaigns.map((campaign) => (
              <article key={campaign.id} className="admin-list-row">
                <button className="admin-list-main" onClick={() => editCampaign(campaign)}>
                  <div><strong>{campaign.name}</strong><span>{campaign.type} · {campaign.code || "No code"} · {campaign.discount_percent}%</span></div>
                  <b>{campaign.is_active ? "ACTIVE" : "OFF"}</b>
                </button>
                <button className="admin-secondary" onClick={() => toggleCampaign(campaign)}>{campaign.is_active ? "PAUSE" : "ACTIVATE"}</button>
              </article>
            ))}
          </div>
          <div className="admin-note"><strong>LIVE DATABASE</strong><span>Campaigns are now stored in Supabase and protected by the admin RLS policy.</span></div>
        </div>
      </div>
    </section>
  );
}
