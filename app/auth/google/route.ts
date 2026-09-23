import { NextResponse } from 'next/server';
import { authClient, authConfigured } from '@/lib/supabase/server';
import { safeReturnTo } from '@/lib/auth-utils';
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!authConfigured()) return NextResponse.redirect(new URL('/login?error=setup', url.origin));
  const callback = new URL('/auth/callback', url.origin);
  callback.searchParams.set('next', safeReturnTo(url.searchParams.get('next')));
  const client = await authClient();
  const { data, error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback.toString(), queryParams: { prompt: 'select_account' } } });
  return NextResponse.redirect(error || !data.url ? new URL('/login?error=google', url.origin) : data.url);
}
