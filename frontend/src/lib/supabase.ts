import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If variables are missing (like during a build step), 
  // return a dummy client or null to prevent build crash
  if (!url || !anonKey) {
    return {} as any; 
  }

  return createBrowserClient(url, anonKey);
}