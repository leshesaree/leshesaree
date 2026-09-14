"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  return <div className="admin-page">
    <header className="admin-page-head"><div><span className="admin-eyebrow">07 — SETTINGS</span><h1>Store <i>rules.</i></h1><p>Core operational settings for LE SHE SAREE.</p></div><button className="admin-action" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1400); }}>{saved ? "SAVED ✓" : "SAVE SETTINGS"}</button></header>
    <section className="settings-list">
      <label><span>STORE STATUS</span><select defaultValue="live"><option value="live">LIVE</option><option value="paused">PAUSED</option></select></label>
      <label><span>CURRENCY</span><input defaultValue="INR (₹)" readOnly /></label>
      <label><span>DEFAULT SHIPPING</span><input defaultValue="Calculated at checkout" /></label>
      <label><span>ORDER STATUS</span><select defaultValue="pending"><option value="pending">PENDING</option><option value="confirmed">CONFIRMED</option><option value="processing">PROCESSING</option></select></label>
    </section>
    <div className="cms-note"><span>SECURITY NOTE</span><p>Authentication, roles, RLS and server-side permissions should remain the source of truth for protected operations.</p></div>
  </div>;
}
