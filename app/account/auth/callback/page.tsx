"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountAuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const run = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) await supabase.auth.exchangeCodeForSession(code);
      router.replace("/account");
    };
    run();
  }, [router]);
  return <main className="account-shell"><section className="account-card"><h1>Signing you in…</h1></section></main>;
}
