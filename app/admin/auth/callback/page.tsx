"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("VERIFYING ACCESS…");

  useEffect(() => {
    async function finish() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMessage("Store connection is not configured yet.");
        return;
      }
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (sessionError) {
        setMessage("This sign-in link is invalid or expired.");
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setMessage("Unable to verify your account.");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (!profile || !["admin", "master_admin"].includes(profile.role)) {
        await supabase.auth.signOut();
        setMessage("This account is not authorized for the control room.");
        return;
      }
      router.replace("/admin");
    }
    finish();
  }, [router]);

  return <main className="admin-login"><div className="admin-login-mark">LE SHE<br /><span>SAREE</span></div><div className="admin-login-copy"><span>CONTROL ROOM / 2026</span><h1>VERIFYING<br /><i>ACCESS.</i></h1><p>{message}</p></div></main>;
}
