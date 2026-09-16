"use client";

import { useEffect } from "react";

export default function ProductAutoRotate() {
  useEffect(() => {
    let paused = false;
    const getNext = () => document.querySelector<HTMLButtonElement>(".product-page .product-stage .gallery-arrow.next");
    const stage = document.querySelector<HTMLElement>(".product-page .product-stage");
    if (!stage) return;

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);

    const timer = window.setInterval(() => {
      if (paused || document.hidden) return;
      getNext()?.click();
    }, 4500);

    return () => {
      window.clearInterval(timer);
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return null;
}
