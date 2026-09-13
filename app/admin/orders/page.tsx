"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Order = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pin_code: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
};

type Item = { id: string; product_name: string; quantity: number; unit_price: number; size: string | null };

const statuses = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("Supabase connection is not configured."); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("id,customer_name,email,phone,address,city,pin_code,status,payment_status,subtotal,shipping_fee,total,created_at").order("created_at", { ascending: false });
    if (error) setMessage(error.message); else setOrders((data || []) as Order[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openOrder(order: Order) {
    setSelected(order);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.from("order_items").select("id,product_name,quantity,unit_price,size").eq("order_id", order.id).order("created_at");
    setItems((data || []) as Item[]);
  }

  const visible = useMemo(() => filter === "all" ? orders : orders.filter(o => o.status === filter), [orders, filter]);
  const money = (value: number) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
  const date = (value: string) => new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return <div className="admin-page">
    <header className="admin-page-head">
      <div><span className="admin-eyebrow">05 — ORDERS</span><h1>Order <i>Desk.</i></h1><p>Every order, from first click to delivery.</p></div>
      <button className="admin-action" onClick={load}>REFRESH ↻</button>
    </header>

    <div className="admin-tabs">{statuses.map(s => <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>{s.toUpperCase()}</button>)}</div>

    {message && <div className="admin-notice">{message}</div>}
    {loading ? <div className="admin-empty">Loading orders…</div> : visible.length === 0 ? <div className="admin-empty"><h2>No orders yet.</h2><p>New customer orders will appear here automatically.</p></div> : <div className="order-table">
      <div className="order-row order-head"><span>ORDER</span><span>CUSTOMER</span><span>STATUS</span><span>TOTAL</span><span>DATE</span></div>
      {visible.map(order => <button className="order-row" key={order.id} onClick={() => openOrder(order)}><span>#{order.id.slice(0, 8).toUpperCase()}</span><span><strong>{order.customer_name}</strong><small>{order.phone}</small></span><span><em className={`status status-${order.status}`}>{order.status}</em><small>Payment: {order.payment_status}</small></span><span>{money(order.total)}</span><span>{date(order.created_at)}</span></button>)}
    </div>}

    {selected && <div className="order-drawer-backdrop" onClick={() => setSelected(null)}><aside className="order-drawer" onClick={e => e.stopPropagation()}>
      <button className="drawer-close" onClick={() => setSelected(null)}>CLOSE ×</button>
      <span className="admin-eyebrow">ORDER / {selected.id.slice(0, 8).toUpperCase()}</span>
      <h2>{selected.customer_name}</h2>
      <div className="drawer-meta"><p>{selected.email}</p><p>{selected.phone}</p><p>{selected.address}, {selected.city} — {selected.pin_code}</p></div>
      <div className="drawer-items">{items.map(item => <div className="drawer-item" key={item.id}><span>{item.product_name}<small>{item.size || "Free Size"} · ×{item.quantity}</small></span><strong>{money(item.unit_price * item.quantity)}</strong></div>)}</div>
      <div className="drawer-total"><span>SUBTOTAL</span><strong>{money(selected.subtotal)}</strong><span>SHIPPING</span><strong>{money(selected.shipping_fee)}</strong><span>TOTAL</span><strong>{money(selected.total)}</strong></div>
      <div className="drawer-status"><span>STATUS</span><b>{selected.status.toUpperCase()}</b><span>PAYMENT</span><b>{selected.payment_status.toUpperCase()}</b></div>
    </aside></div>}
  </div>;
}
