import { getSupabaseBrowserClient } from "./supabase-browser";

// Backward-compatible browser client export for account/auth pages.
// The underlying client reads NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from the public runtime environment.
export const supabase = getSupabaseBrowserClient()!;
