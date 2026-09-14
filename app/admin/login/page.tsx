"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Store connection is not configured yet.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    setMessage(error ? error.message : "Check your email for the secure sign-in link.");
    setBusy(false);
  }

  return (
    <main className="admin-login">
      <div className="admin-login-mark">LE SHE<br /><span>SAREE</span></div>
      <div className="admin-login-copy"><span>CONTROL ROOM / 2026</span><h1>WELCOME<br /><i>BACK.</i></h1><p>Authorized access only. Use your approved admin email to receive a secure sign-in link.</p></div>
      <form className="admin-login-form" onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@leshesaree.com" autoComplete="email" /></label>
        <button type="submit" disabled={busy}>{busy ? "SENDING…" : "SEND SECURE LINK"} <b>→</b></button>
        {message && <p className="admin-login-error">{message}</p>}
      </form>
    </main>
  );
}
