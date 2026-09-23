import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
export function authConfigured() { return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }
export async function authClient() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: { getAll: () => jar.getAll(), setAll(items) { try { items.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* Server components rely on proxy.ts for refresh. */ } } },
  });
}
export function dataClient() {
  if (!authConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase is not configured');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
