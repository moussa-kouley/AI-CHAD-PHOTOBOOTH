import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "media";

let cached: SupabaseClient | null | undefined;

export function mediaBucket() {
  return BUCKET;
}

export function supabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return cached;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
