"use client";

import { useEffect } from "react";

export default function MotionEnhancer() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".reveal-card"));
    const reveal = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          reveal.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    cards.forEach(card => reveal.observe(card));

    const onScroll = () => {
      const y = window.scrollY;
      document.documentElement.style.setProperty("--ls-scroll", `${y}`);
      document.querySelectorAll<HTMLElement>(".parallax-image").forEach(el => {
        const rect = el.getBoundingClientRect();
        const shift = Math.max(-18, Math.min(18, (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * 0.035));
        el.style.setProperty("--parallax-y", `${shift}px`);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      reveal.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
