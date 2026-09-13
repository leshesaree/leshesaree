"use client";

import { useEffect } from "react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the production error boundary intentionally quiet for customers.
  }, []);

  return (
    <main className="checkout-shell">
      <header className="checkout-header">
        <a className="wordmark" href="/">LE SHE<br/><span>SAREE</span></a>
        <a href="/">Shop</a>
      </header>
      <section className="order-receipt">
        <div className="order-success">
          <span>STORE / SOMETHING WENT WRONG</span>
          <h2>ONE<br/><i>MORE TRY.</i></h2>
          <p>We hit a temporary problem while preparing this page.</p>
          <button className="checkout-button" type="button" onClick={() => reset()}>
            TRY AGAIN <span>↻</span>
          </button>
        </div>
      </section>
    </main>
  );
}
