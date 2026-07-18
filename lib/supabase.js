import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Explicitly force every underlying request to skip caching at the fetch level —
// this is more direct than route-level config and bypasses any caching layer
// (Next.js fetch cache, Vercel Data Cache, or otherwise) that respects standard
// cache directives.
const noCacheFetch = (url, options = {}) => fetch(url, { ...options, cache: "no-store" });

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: noCacheFetch },
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  global: { fetch: noCacheFetch },
});
