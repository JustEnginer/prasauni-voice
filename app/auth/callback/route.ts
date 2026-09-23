import { NextResponse } from 'next/server';
import { authClient } from '@/lib/supabase/server';
import { safeReturnTo } from '@/lib/auth-utils';
import { ensureMemberProfile } from '@/lib/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    const client = await authClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await client.auth.getUser();
      if (user) await ensureMemberProfile(user);
      return NextResponse.redirect(new URL(safeReturnTo(url.searchParams.get('next')), url.origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=callback', url.origin));
}
