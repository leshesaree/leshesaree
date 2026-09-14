"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

function textOf(element: Element) {
  return (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

export default function AnalyticsTracker() {
  useEffect(() => {
    const sendPageView = () => {
      trackEvent("page_view", { page_title: document.title });
      if (/^\/product\//.test(window.location.pathname)) {
        trackEvent("view_item", { item_slug: window.location.pathname.split("/").filter(Boolean).pop() });
      }
      if (/^\/order\//.test(window.location.pathname)) {
        const key = `leshe-purchase-tracked:${window.location.pathname}`;
        if (!sessionStorage.getItem(key)) {
          try {
            const order = JSON.parse(localStorage.getItem("leshe-last-order") || "null");
            if (order?.total != null) {
              trackEvent("purchase", { value: Number(order.total), currency: "INR", items: Array.isArray(order.items) ? order.items.length : undefined });
              sessionStorage.setItem(key, "1");
            }
          } catch {}
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const element = target?.closest("a,button") as HTMLElement | null;
      if (!element) return;
      const label = (element.getAttribute("aria-label") || textOf(element)).toLowerCase();
      const href = element.getAttribute("href") || "";

      if (label.includes("wishlist")) trackEvent("add_to_wishlist", { action: label.includes("remove") ? "remove" : "add" });
      else if (label.includes("add to bag") || label.includes("added to bag")) trackEvent("add_to_cart", { item_name: textOf(element.closest("main")?.querySelector("h1") || element) });
      else if (label === "apply" && element.closest(".coupon-row")) trackEvent("select_promotion", { promotion_code: (element.closest(".coupon-row")?.querySelector("input") as HTMLInputElement | null)?.value?.trim() || undefined });
      else if (/search/i.test(label) || /search/i.test(href)) trackEvent("search_interaction", { label });
      else if (/campaign|promo|promotion|shop now|discover/i.test(label)) trackEvent("campaign_cta_click", { label });
      else if (href === "/bag" || href.includes("/checkout")) trackEvent("begin_checkout", { destination: href });
    };

    sendPageView();
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
