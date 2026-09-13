"use client";

import { useState } from "react";

const campaigns = [
  { name: "Festive Edit", type: "Collection", status: "Draft", detail: "Seasonal saree promotion" },
  { name: "New Customer", type: "Coupon", status: "Ready", detail: "First-order incentive" },
  { name: "Weekend Drop", type: "Flash Sale", status: "Scheduled", detail: "Limited-time collection" },
];

export default function MarketingPage() {
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState(true);

  function save() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">06 / MARKETING</span>
          <h1>CAMPAIGNS<br/><i>THAT MOVE.</i></h1>
          <p>Plan promotions, coupons and limited-time drops from one control room.</p>
        </div>
        <button className="admin-primary" onClick={save}>{saved ? "SAVED ✓" : "SAVE CAMPAIGN →"}</button>
      </header>

      <div className="admin-metrics">
        <div><span>CAMPAIGNS</span><strong>03</strong></div>
        <div><span>ACTIVE</span><strong>{active ? "01" : "00"}</strong></div>
        <div><span>COUPONS</span><strong>01</strong></div>
        <div><span>FLASH SALES</span><strong>01</strong></div>
      </div>

      <div className="admin-panel-grid">
        <div className="admin-panel">
          <span className="admin-eyebrow">CAMPAIGN BUILDER</span>
          <label>Campaign name<input defaultValue="Festive Edit" /></label>
          <label>Campaign type<select defaultValue="Collection"><option>Collection</option><option>Coupon</option><option>Flash Sale</option></select></label>
          <label>Promotion code<input defaultValue="FESTIVE10" /></label>
          <div className="admin-form-row">
            <label>Discount %<input type="number" defaultValue="10" min="0" max="100" /></label>
            <label>Priority<input type="number" defaultValue="1" min="0" /></label>
          </div>
          <label>Short description<textarea defaultValue="A limited festive edit for contemporary Indian sarees." rows={4} /></label>
          <button className={`admin-toggle ${active ? "is-on" : ""}`} onClick={() => setActive(!active)}>
            <span>CAMPAIGN ACTIVE</span><b>{active ? "ON" : "OFF"}</b>
          </button>
        </div>

        <div className="admin-panel">
          <span className="admin-eyebrow">CAMPAIGN QUEUE</span>
          <div className="admin-list">
            {campaigns.map((campaign) => (
              <article key={campaign.name} className="admin-list-row">
                <div><strong>{campaign.name}</strong><span>{campaign.type} · {campaign.detail}</span></div>
                <b>{campaign.status}</b>
              </article>
            ))}
          </div>
          <div className="admin-note"><strong>COMMERCE RULE</strong><span>Campaign controls are prepared for CMS persistence and checkout discount rules.</span></div>
        </div>
      </div>
    </section>
  );
}
