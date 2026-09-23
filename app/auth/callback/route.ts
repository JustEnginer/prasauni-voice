import { NextResponse } from 'next/server';
import { authClient } from '@/lib/supabase/server';
import { safeReturnTo } from '@/lib/auth-utils';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    const client = await authClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeReturnTo(url.searchParams.get('next')), url.origin));
  }
  return NextResponse.redirect(new URL('/login?error=callback', url.origin));
}
