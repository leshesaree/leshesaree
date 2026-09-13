"use client";

import { useEffect, useState } from "react";

const catalog: Record<string,{name:string;price:number;label:string;desc:string;tone:string}> = {
  gulab:{name:"Gulab Silk Saree",price:2499,label:"GULAB",tone:"rose",desc:"A soft, expressive saree inspired by the quiet romance of Indian florals. Finished for an effortless drape."},
  noor:{name:"Noor Handloom Saree",price:2899,label:"NOOR",tone:"stone",desc:"A handloom-inspired everyday classic with a calm texture and a modern, fluid silhouette."},
  madhubani:{name:"Madhubani Saree",price:3199,label:"MADHU",tone:"plum",desc:"A richly expressive textile story with artisanal character and a contemporary edge."},
  meher:{name:"Meher Cotton Saree",price:2199,label:"MEHER",tone:"sand",desc:"Light, breathable and easy to wear, made for slow afternoons and everyday rituals."},
};

export default function ProductPage({params}:{params:Promise<{slug:string}>}){
  const [product,setProduct]=useState(catalog.gulab); const [size,setSize]=useState("Free Size"); const [added,setAdded]=useState(false); const [bag,setBag]=useState(0);
  useEffect(()=>{params.then(p=>setProduct(catalog[p.slug]||catalog.gulab));setBag(Number(localStorage.getItem("leshe-bag-count")||0));},[params]);
  const add=()=>{const next=bag+1;setBag(next);setAdded(true);localStorage.setItem("leshe-bag-count",String(next));setTimeout(()=>setAdded(false),900)};
  return <main className={`product-page tone-${product.tone}`}>
    <header className="topbar product-top"><a className="wordmark" href="/">LE SHE<br/><span>SAREE</span></a><nav><a href="/">Shop</a><a href="/bag">Bag ({bag})</a></nav><span className="top-meta">PRODUCT / 01</span></header>
    <a className="back-link" href="/">← Back to collection</a>
    <section className="product-detail">
      <div className="product-visual"><div className="product-art"><span>{product.label}</span><small>LE SHE SAREE</small></div></div>
      <div className="product-info"><p className="eyebrow">HANDCRAFTED INDIA / 2026</p><h1>{product.name}</h1><div className="price">₹ {product.price.toLocaleString("en-IN")}</div><p className="description">{product.desc}</p><div className="option-label">SIZE <span>{size}</span></div><div className="sizes">{["Free Size","Custom"].map(s=><button className={size===s?"selected":""} onClick={()=>setSize(s)} key={s}>{s}</button>)}</div><button className={`add-button ${added?"added":""}`} onClick={add}>{added?"ADDED TO BAG ✓":"ADD TO BAG"}<span>↗</span></button><div className="details"><p>Handcrafted textile · Gentle care recommended</p><p>Shipping calculated at checkout</p></div></div>
    </section>
  </main>
}
