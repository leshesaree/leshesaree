"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Banner={eyebrow:string|null;title:string|null;body:string|null;link_label:string|null;link_url:string|null};
export default function MarketingBar(){
 const [banner,setBanner]=useState<Banner|null>(null);
 useEffect(()=>{let active=true;const load=async()=>{const s=getSupabaseBrowserClient();if(!s)return;const {data}=await s.from("storefront_content").select("eyebrow,title,body,link_label,link_url").eq("section","banner").eq("is_active",true).maybeSingle();if(active&&data)setBanner(data as Banner)};load();return()=>{active=false}},[]);
 if(!banner)return null;
 return <aside className="marketing-bar" aria-label="Current promotion"><div><span>{banner.eyebrow||"LE SHE SAREE"}</span>{banner.title&&<strong>{banner.title}</strong>}{banner.body&&<p>{banner.body}</p>}</div>{banner.link_url&&<a href={banner.link_url}>{banner.link_label||"EXPLORE →"}</a>}</aside>;
}
