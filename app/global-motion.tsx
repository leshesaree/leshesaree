"use client";

import { useEffect } from "react";

export default function GlobalMotion(){
 useEffect(()=>{
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root=document.documentElement;
  const setMetrics=()=>{
   const height=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
   root.style.setProperty("--ls-page-height",`${height}`);
  };
  const onScroll=()=>{
   root.style.setProperty("--ls-scroll",`${window.scrollY}`);
   root.classList.add("ls-scrolling");
   window.clearTimeout((onScroll as any).t);
   (onScroll as any).t=window.setTimeout(()=>root.classList.remove("ls-scrolling"),120);
  };
  const onClick=(e:MouseEvent)=>{
   const target=e.target as HTMLElement|null;
   const link=target?.closest<HTMLAnchorElement>("a[href]");
   if(!link||reduce)return;
   const href=link.getAttribute("href")||"";
   if(link.target==="_blank"||href.startsWith("#")||href.startsWith("http")||href.startsWith("mailto:")||href.startsWith("tel:")||href.startsWith("javascript:"))return;
   const url=new URL(href,window.location.href);
   if(url.origin!==window.location.origin)return;
   e.preventDefault();
   root.classList.add("ls-page-leave");
   window.setTimeout(()=>{window.location.href=url.href},260);
  };
  setMetrics();
  onScroll();
  window.addEventListener("resize",setMetrics,{passive:true});
  window.addEventListener("scroll",onScroll,{passive:true});
  document.addEventListener("click",onClick);
  return()=>{
   window.removeEventListener("resize",setMetrics);
   window.removeEventListener("scroll",onScroll);
   document.removeEventListener("click",onClick);
  };
 },[]);
 return null;
}
