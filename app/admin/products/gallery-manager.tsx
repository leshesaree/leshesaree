"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { uploadProductImage } from "@/lib/product-image-upload";

type Image = { id:string; product_id:string; image_url:string; alt_text:string|null; display_order:number; is_primary:boolean };
const MAX_GALLERY_IMAGES = 5;

export default function ProductGalleryManager({productId,slug,name}:{productId:string;slug:string;name:string}){
 const [images,setImages]=useState<Image[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [url,setUrl]=useState("");
 const supabase=getSupabaseBrowserClient();
 async function load(){if(!supabase)return;const {data,error}=await supabase.from("product_images").select("id,product_id,image_url,alt_text,display_order,is_primary").eq("product_id",productId).order("display_order",{ascending:true});if(error)setMessage(error.message);else setImages((data||[]) as Image[])}
 useEffect(()=>{load()},[productId]);
 async function insertImage(imageUrl:string, order:number, isFirst:boolean){
  if(!supabase)return;
  const clean=imageUrl.trim();
  if(!clean)return;
  try{new URL(clean)}catch{throw new Error(`INVALID IMAGE URL: ${clean}`)}
  const {error}=await supabase.from("product_images").insert({product_id:productId,image_url:clean,alt_text:name,display_order:order,is_primary:isFirst});
  if(error)throw error;
 }
 async function add(e:ChangeEvent<HTMLInputElement>){const files=Array.from(e.target.files||[]);if(!files.length||!supabase)return;const remaining=MAX_GALLERY_IMAGES-images.length;if(remaining<=0){setMessage("MAXIMUM 5 PHOTOS ALREADY ADDED.");e.target.value="";return}if(files.length>remaining){setMessage(`YOU CAN ADD ONLY ${remaining} MORE PHOTO${remaining>1?"S":""}. MAXIMUM GALLERY SIZE IS 5.`);e.target.value="";return}setBusy(true);setMessage("");try{let nextOrder=images.length?Math.max(...images.map(x=>x.display_order))+1:0;for(const file of files){if(file.size>5*1024*1024)throw new Error(`${file.name}: MAXIMUM FILE SIZE IS 5MB.`);const uploadUrl=await uploadProductImage(supabase,file,slug);const isFirst=images.length===0&&nextOrder===0;const {error}=await supabase.from("product_images").insert({product_id:productId,image_url:uploadUrl,alt_text:name,display_order:nextOrder,is_primary:isFirst});if(error)throw error;nextOrder++}await load();setMessage(`${files.length} PHOTO${files.length>1?"S":""} ADDED. 1 = PRIMARY · 2 = HOVER.`)}catch(err){setMessage(err instanceof Error?err.message:"IMAGE UPLOAD FAILED.")}finally{setBusy(false);e.target.value=""}}
 async function addUrl(){
  if(!supabase||!url.trim())return;
  const urls=url.split(/\r?\n|,|;|\s{2,}/).map(v=>v.trim()).filter(Boolean);
  const remaining=MAX_GALLERY_IMAGES-images.length;
  if(urls.length>remaining){setMessage(`YOU CAN ADD ONLY ${remaining} MORE IMAGE${remaining>1?"S":""}. MAXIMUM GALLERY SIZE IS 5.`);return}
  setBusy(true);setMessage("");
  try{
   let nextOrder=images.length?Math.max(...images.map(x=>x.display_order))+1:0;
   for(const imageUrl of urls){await insertImage(imageUrl,nextOrder,images.length===0&&nextOrder===0);nextOrder++}
   setUrl("");await load();setMessage(`${urls.length} IMAGE URL${urls.length>1?"S":""} ADDED. 1 = PRIMARY · 2 = HOVER.`)
  }catch(err){setMessage(err instanceof Error?err.message:"IMAGE URL COULD NOT BE ADDED.")}finally{setBusy(false)}
 }
 async function primary(image:Image){if(!supabase)return;const {error:clearError}=await supabase.from("product_images").update({is_primary:false}).eq("product_id",productId);if(clearError){setMessage(clearError.message);return}const {error}=await supabase.from("product_images").update({is_primary:true}).eq("id",image.id);if(error)setMessage(error.message);else{await supabase.from("products").update({image_url:image.image_url,updated_at:new Date().toISOString()}).eq("id",productId);await load();setMessage("PRIMARY IMAGE UPDATED. IMAGE 2 IS USED FOR HOMEPAGE HOVER.")}}
 async function remove(image:Image){if(!supabase||!window.confirm("Remove this gallery image?"))return;const {error}=await supabase.from("product_images").delete().eq("id",image.id);if(error){setMessage(error.message);return}const next=images.filter(x=>x.id!==image.id);if(image.is_primary&&next[0])await primary(next[0]);else await load();setMessage("GALLERY IMAGE REMOVED.")}
 return <section className="admin-section admin-gallery-section"><div className="admin-section-title"><div><span>PRODUCT PHOTOS / {images.length} OF {MAX_GALLERY_IMAGES}</span><small className="admin-gallery-hint">ONE IMAGE BOX · LOCAL UPLOAD OR MULTIPLE IMAGE URLS · JPG / PNG / WEBP · MAX 5MB EACH</small></div></div><div className="admin-gallery-input-box"><label className="admin-gallery-dropzone"><strong>{busy?"UPLOADING…":"ADD PRODUCT PHOTOS"}</strong><span>Choose 1–5 local photos at once</span><small>IMAGE 1 = PRIMARY · IMAGE 2 = HOVER · IMAGES 3–5 = PDP GALLERY</small><input hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={add} disabled={busy||images.length>=MAX_GALLERY_IMAGES}/></label><div className="admin-gallery-url-row"><textarea value={url} onChange={e=>setUrl(e.target.value)} placeholder="Paste multiple image URLs — one per line…" aria-label="Product image URLs" rows={3} disabled={busy||images.length>=MAX_GALLERY_IMAGES}/><button type="button" className="admin-action" onClick={addUrl} disabled={busy||images.length>=MAX_GALLERY_IMAGES||!url.trim()}>ADD URLS +</button></div></div>{message&&<div className="admin-empty">{message}</div>}<div className="admin-gallery-grid">{images.map((image,index)=><div className="admin-gallery-card" key={image.id}><div className="admin-gallery-media"><img src={image.image_url} alt={image.alt_text||name}/><span>{image.is_primary?"PRIMARY":index===1?"HOVER":"GALLERY"}</span></div><div><strong>IMAGE {index+1}</strong><small>{index===0?"Homepage default":index===1?"Homepage mouse hover":"Product gallery"}</small></div><div className="row-actions"><button type="button" className="table-action" onClick={()=>primary(image)} disabled={image.is_primary}>{image.is_primary?"PRIMARY":"MAKE PRIMARY"}</button><button type="button" className="table-action danger" onClick={()=>remove(image)}>REMOVE</button></div></div>)}</div>{images.length===0&&!message?<div className="admin-empty">NO PHOTOS YET. USE THE SINGLE BOX ABOVE FOR LOCAL PHOTOS OR MULTIPLE IMAGE URLS.</div>:null}</section>;
}
