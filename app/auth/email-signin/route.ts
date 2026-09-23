import { NextResponse } from 'next/server';
import { authClient } from '@/lib/supabase/server';
import { safeReturnTo } from '@/lib/auth-utils';
import { ensureMemberProfile } from '@/lib/server';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  const next = safeReturnTo(String(form.get('next') || '/'));

  if (!email || !password || password.length < 6) {
    return NextResponse.redirect(new URL('/login?error=credentials&next=' + encodeURIComponent(next), request.url));
  }

  const client = await authClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.redirect(new URL('/login?error=credentials&next=' + encodeURIComponent(next), request.url));
  }

  await ensureMemberProfile(data.user);
  return NextResponse.redirect(new URL(next, request.url));
}
