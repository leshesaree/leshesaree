"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type CartItem={product_id:string;slug:string;name:string;price:number;image_url:string|null;quantity:number;size:string};

export default function CheckoutPage(){
 const [items,setItems]=useState<CartItem[]>([]);
 const [submitted,setSubmitted]=useState(false);
 const [orderId,setOrderId]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem("leshe-bag-items");if(raw)setItems(JSON.parse(raw));}catch{}},[]);
 const subtotal=items.reduce((sum,item)=>sum+item.price*item.quantity,0);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");
  if(!items.length){setError("Your bag is empty. Please add a saree first.");return;}
  setBusy(true);
  const form=new FormData(event.currentTarget);
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setError("Store connection is not configured yet.");setBusy(false);return;}
  const {data,error:rpcError}=await supabase.rpc("place_order",{p_customer_name:String(form.get("name")||""),p_email:String(form.get("email")||""),p_phone:String(form.get("phone")||""),p_address:String(form.get("address")||""),p_city:String(form.get("city")||""),p_pin_code:String(form.get("pin")||""),p_items:items.map(item=>({product_id:item.product_id,quantity:item.quantity,size:item.size}))});
  if(rpcError){setError(rpcError.message||"We couldn't place the order. Please try again.");setBusy(false);return;}
  const id=String(data);setOrderId(id);setSubmitted(true);localStorage.removeItem("leshe-bag-items");localStorage.setItem("leshe-bag-count","0");setBusy(false);
 }
 return <main className="checkout-shell"><header className="checkout-header"><a className="wordmark" href="/">LE SHE<br/><span>SAREE</span></a><a href="/bag">Bag ({items.reduce((s,i)=>s+i.quantity,0)})</a></header><section className="checkout-grid"><div className="checkout-intro"><span>03 — CHECKOUT</span><h1>MAKE IT<br/><i>YOURS.</i></h1><p>Complete your details and we'll prepare your order with care.</p>{items.length>0&&<div className="checkout-total"><span>ORDER TOTAL</span><strong>₹ {subtotal.toLocaleString("en-IN")}</strong></div>}</div>{!submitted?<form className="checkout-form" onSubmit={submit}><label>Full name<input required name="name" placeholder="Your name"/></label><label>Email<input required type="email" name="email" placeholder="you@example.com"/></label><label>Phone<input required name="phone" placeholder="+91"/></label><label>Address<textarea required name="address" placeholder="Delivery address" rows={3}/></label><div className="form-row"><label>City<input required name="city" placeholder="City"/></label><label>PIN code<input required name="pin" inputMode="numeric" placeholder="000000"/></label></div>{error&&<p className="form-error">{error}</p>}<button className="checkout-button" type="submit" disabled={busy||!items.length}><span>{busy?"PLACING ORDER…":"PLACE ORDER"}</span><b>→</b></button></form>:<div className="order-success"><span>ORDER / RECEIVED</span><h2>THANK<br/>YOU.</h2><p>Your order has been placed successfully.</p><p><strong>Order ID</strong><br/>{orderId}</p><a href="/">Continue shopping →</a></div>}</section></main>
}
