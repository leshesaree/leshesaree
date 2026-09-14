"use client";

import { useEffect, useState } from "react";

type CartItem = { product_id:string; slug:string; name:string; price:number; image_url:string|null; quantity:number; size:string };

export default function Bag(){
 const [items,setItems]=useState<CartItem[]>([]);
 const [removing,setRemoving]=useState<string|null>(null);
 const count=items.reduce((sum,item)=>sum+item.quantity,0);
 const subtotal=items.reduce((sum,item)=>sum+item.price*item.quantity,0);
 useEffect(()=>{try{const raw=localStorage.getItem("leshe-bag-items");if(raw)setItems(JSON.parse(raw));}catch{}},[]);
 const save=(next:CartItem[])=>{setItems(next);localStorage.setItem("leshe-bag-items",JSON.stringify(next));localStorage.setItem("leshe-bag-count",String(next.reduce((sum,item)=>sum+item.quantity,0)));window.dispatchEvent(new Event("storage"));};
 const change=(index:number,delta:number)=>{const next=[...items];next[index].quantity=Math.max(0,next[index].quantity+delta);save(next.filter(item=>item.quantity>0));};
 const remove=(key:string)=>{setRemoving(key);window.setTimeout(()=>{save(items.filter(item=>`${item.product_id}-${item.size}`!==key));setRemoving(null);},260);};
 const clear=()=>{setRemoving("all");window.setTimeout(()=>{save([]);setRemoving(null);},260);};
 return <main className="bag-page"><header className="topbar"><a className="wordmark" href="/">LE SHE<br/><span>SAREE</span></a><nav><a href="/">Shop</a><a href="/bag">Bag ({count})</a></nav><span className="top-meta">YOUR BAG</span></header><section className="bag-wrap"><div className="section-head"><span>02 — BAG</span><span>{count} ITEM{count===1?"":"S"}</span></div>{items.length===0?<div className="empty-bag"><h1>YOUR BAG<br/>IS QUIET.</h1><a href="/">Return to collection →</a></div>:<div className="bag-content"><div className="bag-list">{items.map((item,index)=>{const key=`${item.product_id}-${item.size}`;return <article className={`bag-item ${removing===key||removing==="all"?"is-removing":""}`} key={key}><div className="bag-art" style={item.image_url?{backgroundImage:`url(${item.image_url})`,backgroundSize:"cover",backgroundPosition:"center"}:undefined}><span>{item.name.split(" ")[0].toUpperCase()}</span></div><div className="bag-copy"><p className="eyebrow">SELECTED PIECE</p><h2>{item.name}</h2><p>Size · {item.size}</p><div className="quantity"><button aria-label="Decrease quantity" onClick={()=>change(index,-1)}>−</button><strong>{item.quantity}</strong><button aria-label="Increase quantity" onClick={()=>change(index,1)}>+</button></div><strong>₹ {(item.price*item.quantity).toLocaleString("en-IN")}</strong><button className="remove-item" onClick={()=>remove(key)}>Remove piece <span>×</span></button></div></article>})}</div><aside className="bag-summary"><p className="eyebrow">ORDER SUMMARY</p><div className="bag-total"><span>Subtotal</span><strong>₹ {subtotal.toLocaleString("en-IN")}</strong></div><p>{count} piece{count===1?"":"s"} selected · Shipping calculated at checkout.</p><a className="checkout-button" href="/checkout">CHECKOUT <span>↗</span></a><button className="text-button" onClick={clear}>Clear bag</button></aside></div>}</section></main>
}
