"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Customer = { id: string; full_name: string | null; created_at: string };

type Order = { id: string; email: string; customer_name: string; total: number; created_at: string };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const [{ data: customerData }, { data: orderData }] = await Promise.all([
        supabase.from("profiles").select("id,full_name,created_at").eq("role", "customer").order("created_at", { ascending: false }),
        supabase.from("orders").select("id,email,customer_name,total,created_at").order("created_at", { ascending: false }).limit(200),
      ]);
      setCustomers((customerData || []) as Customer[]);
      setOrders((orderData || []) as Order[]);
      setLoading(false);
    }
    load();
  }, []);

  const uniqueEmails = new Set(orders.map((order) => order.email.toLowerCase())).size;
  const orderValue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return <div className="admin-page">
    <header className="admin-page-head"><div><span className="admin-eyebrow">05 — CUSTOMERS</span><h1>People who <i>shop.</i></h1><p>Customer accounts and recent purchasing activity.</p></div><span className="admin-live">{loading ? "LOADING…" : `${customers.length} ACCOUNTS`}</span></header>
    <section className="admin-metrics">
      <article><span>ACCOUNTS</span><strong>{customers.length}</strong></article>
      <article><span>BUYERS IN ORDERS</span><strong>{uniqueEmails}</strong></article>
      <article><span>RECENT ORDER VALUE</span><strong>₹ {orderValue.toLocaleString("en-IN")}</strong></article>
    </section>
    <section className="customer-panel">
      <div className="admin-section-title"><span>CUSTOMER ACCOUNTS</span><span>{customers.length}</span></div>
      {loading ? <div className="admin-empty">Loading customers…</div> : customers.length === 0 ? <div className="admin-empty">No customer accounts yet.</div> : customers.map((customer) => <article className="customer-row" key={customer.id}><div><strong>{customer.full_name || "Unnamed customer"}</strong><small>Joined {new Date(customer.created_at).toLocaleDateString("en-IN")}</small></div><span>{customer.id.slice(0, 8)}…</span></article>)}
    </section>
    <section className="customer-panel">
      <div className="admin-section-title"><span>RECENT ORDERS</span><span>{orders.length}</span></div>
      {orders.length === 0 ? <div className="admin-empty">No orders yet.</div> : orders.slice(0, 12).map((order) => <article className="customer-row" key={order.id}><div><strong>{order.customer_name}</strong><small>{order.email} · {new Date(order.created_at).toLocaleDateString("en-IN")}</small></div><strong>₹ {Number(order.total).toLocaleString("en-IN")}</strong></article>)}
    </section>
  </div>;
}
