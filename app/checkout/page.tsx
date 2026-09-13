"use client";

import { FormEvent, useEffect, useState } from "react";

export default function CheckoutPage() {
  const [count, setCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => setCount(Number(window.localStorage.getItem("leshe-bag-count") || 0)), []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="checkout-shell">
      <header className="checkout-header"><a className="wordmark" href="/">LE SHE<br /><span>SAREE</span></a><a href="/bag">Bag ({count})</a></header>
      <section className="checkout-grid">
        <div className="checkout-intro"><span>03 — CHECKOUT</span><h1>MAKE IT<br /><i>YOURS.</i></h1><p>Complete your details and we&apos;ll prepare your order with care.</p></div>
        {!submitted ? (
          <form className="checkout-form" onSubmit={submit}>
            <label>Full name<input required name="name" placeholder="Your name" /></label>
            <label>Email<input required type="email" name="email" placeholder="you@example.com" /></label>
            <label>Phone<input required name="phone" placeholder="+91" /></label>
            <label>Address<textarea required name="address" placeholder="Delivery address" rows={3} /></label>
            <div className="form-row"><label>City<input required name="city" placeholder="City" /></label><label>PIN code<input required name="pin" inputMode="numeric" placeholder="000000" /></label></div>
            <button className="checkout-button" type="submit"><span>PLACE ORDER</span><b>→</b></button>
          </form>
        ) : (
          <div className="order-success"><span>ORDER / RECEIVED</span><h2>THANK<br />YOU.</h2><p>Your order request has been received. We&apos;ll contact you to confirm the details.</p><a href="/">Continue shopping →</a></div>
        )}
      </section>
    </main>
  );
}
