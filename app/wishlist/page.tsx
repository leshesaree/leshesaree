"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Wish = { id:string; slug:string; name:string; price:number; image_url:string|null };

export default function WishlistPage(){
 const [items,setItems]=useState<Wish[]>([]);
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem("leshe-wishlist")||"[]"))}catch{setItems([])}},[]);
 const remove=(id:string)=>{const next=items.filter(x=>x.id!==id);setItems(next);localStorage.setItem("leshe-wishlist",JSON.stringify(next));window.dispatchEvent(new Event("leshe-wishlist-updated"));};
 return <main className="wishlist-page"><header className="topbar"><Link className="wordmark" href="/">LE SHE<br/><span>SAREE</span></Link><nav><Link href="/">Shop</Link><Link href="/account">Account</Link><Link href="/bag">Bag</Link></nav><span className="top-meta">WISHLIST / {items.length}</span></header><section className="wishlist-head"><p>YOUR EDIT / {items.length}</p><h1>Things worth<br/>keeping.</h1><Link href="/">Continue shopping →</Link></section>{items.length===0?<section className="wishlist-empty"><strong>NOTHING SAVED YET.</strong><span>Keep the pieces you love close.</span><Link href="/">EXPLORE THE COLLECTION →</Link></section>:<section className="wishlist-grid">{items.map(item=><article key={item.id} className="wishlist-item"><Link href={`/product/${item.slug}`} className="wishlist-image">{item.image_url?<img src={item.image_url} alt={item.name}/>:<span>{item.name.split(" ")[0].toUpperCase()}</span>}</Link><div><Link href={`/product/${item.slug}`}><strong>{item.name}</strong></Link><span>₹ {Number(item.price).toLocaleString("en-IN")}</span><button type="button" onClick={()=>remove(item.id)}>REMOVE ×</button></div></article>)}</section>}</main>;
}
