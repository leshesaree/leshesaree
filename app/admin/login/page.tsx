"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Supabase Auth is ready on the database. Add the project environment keys to enable sign-in.");
  }

  return (
    <main className="admin-login">
      <div className="admin-login-mark">LE SHE<br /><span>SAREE</span></div>
      <div className="admin-login-copy"><span>CONTROL ROOM / 2026</span><h1>WELCOME<br /><i>BACK.</i></h1><p>Authorized access only. Sign in to manage the store.</p></div>
      <form className="admin-login-form" onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@leshesaree.com" /></label>
        <button type="submit">CONTINUE <b>→</b></button>
        {message && <p className="admin-login-error">{message}</p>}
      </form>
    </main>
  );
}
