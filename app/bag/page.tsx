"use client";

import { useEffect, useState } from "react";

export default function Bag(){
 const [count,setCount]=useState(0);
 useEffect(()=>setCount(Number(localStorage.getItem("leshe-bag-count")||0)),[]);
 const change=(delta:number)=>{const next=Math.max(0,count+delta);setCount(next);localStorage.setItem("leshe-bag-count",String(next))};
 return <main className="bag-page"><header className="topbar"><a className="wordmark" href="/">LE SHE<br/><span>SAREE</span></a><nav><a href="/">Shop</a><a href="/bag">Bag ({count})</a></nav><span className="top-meta">YOUR BAG</span></header><section className="bag-wrap"><div className="section-head"><span>02 — BAG</span><span>{count} ITEM{count===1?"":"S"}</span></div>{count===0?<div className="empty-bag"><h1>YOUR BAG<br/>IS QUIET.</h1><a href="/">Return to collection →</a></div>:<div className="bag-content"><div className="bag-art"><span>LE SHE</span></div><div className="bag-copy"><p className="eyebrow">SELECTED PIECE</p><h1>LE SHE SAREE</h1><p>Quantity</p><div className="quantity"><button onClick={()=>change(-1)}>−</button><strong>{count}</strong><button onClick={()=>change(1)}>+</button></div><div className="bag-total"><span>Subtotal</span><strong>₹ {(2499*count).toLocaleString("en-IN")}</strong></div><a className="checkout-button" href="/checkout">CHECKOUT <span>↗</span></a></div></div>}</section></main>
}
