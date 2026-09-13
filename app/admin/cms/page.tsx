"use client";

import { useState } from "react";

const sections = [
  ["01", "Homepage hero", "TRADITION IN MOTION."],
  ["02", "Collection intro", "Handcrafted Indian sarees."],
  ["03", "Story block", "Made for modern rituals."],
  ["04", "Footer", "LE SHE SAREE"],
];

export default function CmsPage() {
  const [saved, setSaved] = useState(false);
  return <div className="admin-page">
    <header className="admin-page-head"><div><span className="admin-eyebrow">06 — WEBSITE / CMS</span><h1>Shape the <i>store.</i></h1><p>Content controls for the customer-facing experience.</p></div><button className="admin-action" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1400); }}>{saved ? "SAVED ✓" : "SAVE CHANGES"}</button></header>
    <section className="cms-editor"><div className="admin-section-title"><span>LIVE SECTIONS</span><span>DRAG / EDIT / PUBLISH</span></div>{sections.map(([num, title, value]) => <article className="cms-row" key={num}><span>{num}</span><div><small>{title}</small><strong>{value}</strong></div><button type="button">EDIT ↗</button></article>)}</section>
    <section className="cms-note"><span>EDITORIAL SYSTEM</span><p>Keep the storefront minimal, cinematic and product-first. Future CMS fields can connect these controls directly to Supabase.</p></section>
  </div>;
}
