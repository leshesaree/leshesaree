"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setMessage(error?.message || "Unable to sign in.");
      setBusy(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active || !["admin", "master_admin"].includes(profile.role)) {
      await supabase.auth.signOut();
      setMessage("This account is not authorized for the control room.");
      setBusy(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="admin-login">
      <div className="admin-login-mark">LE SHE<br /><span>SAREE</span></div>
      <div className="admin-login-copy">
        <span>CONTROL ROOM / 2026</span>
        <h1>WELCOME<br /><i>BACK.</i></h1>
        <p>Authorized access only. Sign in with your approved Supabase email and password.</p>
      </div>
      <form className="admin-login-form" onSubmit={submit}>
        <label>Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@leshesaree.com"
            autoComplete="username"
          />
        </label>
        <label>Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "SIGNING IN…" : "SIGN IN"} <b>→</b>
        </button>
        {message && <p className="admin-login-error">{message}</p>}
      </form>
    </main>
  );
}
