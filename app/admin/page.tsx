"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Stats = { products: number; categories: number; orders: number; revenue: number };

const emptyStats: Stats = { products: 0, categories: 0, orders: 0, revenue: 0 };
const queue = ["Products", "Categories", "Inventory", "Orders", "Customers", "Homepage / CMS"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [{ count: products }, { count: categories }, { data: orders }] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total,created_at").gte("created_at", today.toISOString()),
      ]);
      setStats({
        products: products || 0,
        categories: categories || 0,
        orders: orders?.length || 0,
        revenue: (orders || []).reduce((sum, order) => sum + Number(order.total || 0), 0),
      });
      setLoading(false);
    }
    load();
  }, []);

  const statsDisplay = [
    [loading ? "—" : String(stats.products), "Products"],
    [loading ? "—" : String(stats.categories), "Categories"],
    [loading ? "—" : String(stats.orders).padStart(2, "0"), "Orders today"],
    [loading ? "—" : `₹ ${stats.revenue.toLocaleString("en-IN")}`, "Revenue today"],
  ];

  return <div className="admin-dashboard"><header className="admin-header"><div><span>01 — DASHBOARD</span><h1>GOOD<br/><i>MORNING.</i></h1></div><div className="admin-status"><span className="status-dot"/> SUPABASE / LIVE<br/><small>CONTROL ROOM</small></div></header><section className="stat-grid">{statsDisplay.map(([value,label])=><div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</section><section className="admin-section"><div className="admin-section-title"><span>QUICK CONTROL</span><span>STORE / CORE</span></div><div className="control-list">{queue.map((item,index)=><a href={`/admin/${item.toLowerCase().replaceAll(" ","-").replace("/","-")}`} key={item}><span>0{index+1}</span><strong>{item}</strong><b>→</b></a>)}</div></section><section className="admin-note"><span>LIVE SOURCE</span><p>Dashboard metrics now read from Supabase. Products, categories, today's orders and today's revenue update when the control room loads.</p></section></div>;
}
