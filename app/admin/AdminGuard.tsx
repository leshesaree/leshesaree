"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      if (active) setReady(true);
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile || !["admin", "master_admin"].includes(profile.role)) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return <div className="admin-loading"><span>LE SHE / CONTROL ROOM</span><strong>VERIFYING ACCESS…</strong></div>;
  }

  return <>{children}</>;
}
