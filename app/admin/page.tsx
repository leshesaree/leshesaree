"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Stats = { products: number; categories: number; orders: number; revenue: number };
const emptyStats: Stats = { products: 0, categories: 0, orders: 0, revenue: 0 };
const controls = [["Products","/admin/products"],["Categories","/admin/categories"],["Inventory","/admin/inventory"],["Orders","/admin/orders"],["Customers","/admin/customers"],["Homepage / CMS","/admin/cms"]];

export default function AdminDashboard() {
 const [stats,setStats]=useState<Stats>(emptyStats); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [updated,setUpdated]=useState<Date|null>(null);
 async function load(){
  setLoading(true); setError(""); const s=getSupabaseBrowserClient();
  if(!s){setError("SUPABASE ENVIRONMENT VARIABLES ARE NOT CONFIGURED.");setLoading(false);return;}
  const today=new Date(); today.setHours(0,0,0,0);
  const [{count:products,error:productsError},{count:categories,error:categoriesError},{data:orders,error:ordersError}]=await Promise.all([
   s.from("products").select("id",{count:"exact",head:true}),
   s.from("categories").select("id",{count:"exact",head:true}),
   s.from("orders").select("total,created_at").gte("created_at",today.toISOString()),
  ]);
  const firstError=productsError||categoriesError||ordersError;
  if(firstError)setError(firstError.message.toUpperCase());
  setStats({products:products||0,categories:categories||0,orders:orders?.length||0,revenue:(orders||[]).reduce((sum,order)=>sum+Number(order.total||0),0)});
  setUpdated(new Date()); setLoading(false);
 }
 useEffect(()=>{load()},[]);
 const statsDisplay=[[loading?"—":String(stats.products),"Products"],[loading?"—":String(stats.categories),"Categories"],[loading?"—":String(stats.orders).padStart(2,"0"),"Orders today"],[loading?"—":`₹ ${stats.revenue.toLocaleString("en-IN")}`,"Revenue today"]];
 return <div className="admin-dashboard">
  <header className="admin-header"><div><span>01 — DASHBOARD</span><h1>GOOD<br/><i>MORNING.</i></h1><div className="admin-header-tools"><button className="admin-action" onClick={load} disabled={loading}>{loading?"REFRESHING…":"REFRESH ↻"}</button><Link className="admin-action" href="/">VIEW STORE ↗</Link></div></div><div className="admin-status"><span className="status-dot"/> SUPABASE / LIVE<br/><small>{updated?`UPDATED ${updated.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`:"CONNECTING…"}</small></div></header>
  {error&&<div className="admin-empty admin-error" role="alert">{error}</div>}
  <section className="stat-grid">{statsDisplay.map(([value,label])=><div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
  <section className="admin-section"><div className="admin-section-title"><span>QUICK CONTROL</span><span>STORE / CORE</span></div><div className="control-list">{controls.map(([label,href],index)=><Link href={href} key={href}><span>{String(index+1).padStart(2,"0")}</span><strong>{label}</strong><b>→</b></Link>)}</div></section>
  <section className="admin-note"><span>LIVE SOURCE</span><p>Catalog counts and today’s order revenue are read directly from Supabase. Use the control room navigation for operational changes.</p></section>
 </div>;
}
