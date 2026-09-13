"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Product = { id: string; name: string; price: number; description: string | null; sizes: string[]; stock: number; image_url: string | null; is_active: boolean; slug: string };
type DisplayProduct = { id: string; name: string; price: number; label: string; tone: string; desc: string; sizes: string[]; stock: number; image_url: string | null; slug: string };
type CartItem = { product_id: string; slug: string; name: string; price: number; image_url: string | null; quantity: number; size: string };

const fallback: Record<string, DisplayProduct> = {
  gulab:{id:"gulab",name:"Gulab Silk Saree",price:2499,label:"GULAB",tone:"rose",desc:"A soft, expressive saree inspired by the quiet romance of Indian florals. Finished for an effortless drape.",sizes:["Free Size","Custom"],stock:10,image_url:null,slug:"gulab"},
  noor:{id:"noor",name:"Noor Handloom Saree",price:2899,label:"NOOR",tone:"stone",desc:"A handloom-inspired everyday classic with a calm texture and a modern, fluid silhouette.",sizes:["Free Size","Custom"],stock:10,image_url:null,slug:"noor"},
  madhubani:{id:"madhubani",name:"Madhubani Saree",price:3199,label:"MADHU",tone:"plum",desc:"A richly expressive textile story with artisanal character and a contemporary edge.",sizes:["Free Size","Custom"],stock:10,image_url:null,slug:"madhubani"},
  meher:{id:"meher",name:"Meher Cotton Saree",price:2199,label:"MEHER",tone:"sand",desc:"Light, breathable and easy to wear, made for slow afternoons and everyday rituals.",sizes:["Free Size","Custom"],stock:10,image_url:null,slug:"meher"},
};

export default function ProductPage({params}:{params:Promise<{slug:string}>}){
  const [product,setProduct]=useState<DisplayProduct>(fallback.gulab);
  const [size,setSize]=useState("Free Size");
  const [added,setAdded]=useState(false);
  const [bag,setBag]=useState(0);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let active=true;
    params.then(async ({slug})=>{
      const local=fallback[slug] || fallback.gulab;
      if(active) setProduct(local);
      const supabase=getSupabaseBrowserClient();
      if(supabase){
        const {data}=await supabase.from("products").select("id,name,price,description,sizes,stock,image_url,is_active,slug").eq("slug",slug).eq("is_active",true).maybeSingle();
        if(data && active){
          const live=data as Product;
          const sizes=live.sizes?.length ? live.sizes : local.sizes;
          setProduct({id:live.id,name:live.name,price:Number(live.price),label:live.name.split(" ")[0].toUpperCase(),tone:local.tone,desc:live.description || local.desc,sizes,stock:Number(live.stock || 0),image_url:live.image_url,slug:live.slug});
          setSize(sizes[0] || "Free Size");
        }
      }
      if(active){setBag(Number(localStorage.getItem("leshe-bag-count")||0));setLoading(false);}
    });
    return ()=>{active=false};
  },[params]);

  const add=()=>{
    if(product.stock<=0) return;
    const raw=localStorage.getItem("leshe-bag-items");
    const items:CartItem[]=raw?JSON.parse(raw):[];
    const index=items.findIndex(item=>item.product_id===product.id && item.size===size);
    if(index>=0) items[index].quantity=Math.min(items[index].quantity+1,product.stock);
    else items.push({product_id:product.id,slug:product.slug,name:product.name,price:product.price,image_url:product.image_url,quantity:1,size});
    const total=items.reduce((sum,item)=>sum+item.quantity,0);
    localStorage.setItem("leshe-bag-items",JSON.stringify(items));
    localStorage.setItem("leshe-bag-count",String(total));
    setBag(total);setAdded(true);setTimeout(()=>setAdded(false),900);
  };

  return <main className={`product-page tone-${product.tone}`}>
    <header className="topbar product-top"><a className="wordmark" href="/">LE SHE<br/><span>SAREE</span></a><nav><a href="/">Shop</a><a href="/bag">Bag ({bag})</a></nav><span className="top-meta">PRODUCT / 01</span></header>
    <a className="back-link" href="/">← Back to collection</a>
    <section className="product-detail">
      <div className="product-visual"><div className="product-art" style={product.image_url?{backgroundImage:`url(${product.image_url})`,backgroundSize:"cover",backgroundPosition:"center"}:undefined}><span>{product.label}</span><small>LE SHE SAREE</small></div></div>
      <div className="product-info"><p className="eyebrow">HANDCRAFTED INDIA / 2026</p><h1>{product.name}</h1><div className="price">₹ {product.price.toLocaleString("en-IN")}</div><p className="description">{product.desc}</p><div className="option-label">SIZE <span>{size}</span></div><div className="sizes">{product.sizes.map(s=><button type="button" className={size===s?"selected":""} onClick={()=>setSize(s)} key={s}>{s}</button>)}</div><button className={`add-button ${added?"added":""}`} disabled={loading || product.stock<=0} onClick={add}>{loading?"LOADING…":product.stock<=0?"OUT OF STOCK":added?"ADDED TO BAG ✓":"ADD TO BAG"}<span>↗</span></button><div className="details"><p>Handcrafted textile · Gentle care recommended</p><p>{product.stock>0?`${product.stock} available`:"Currently unavailable"}</p><p>Shipping calculated at checkout</p></div></div>
    </section>
  </main>
}
