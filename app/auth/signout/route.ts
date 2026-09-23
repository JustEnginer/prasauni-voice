import { NextResponse } from 'next/server';
import { authClient } from '@/lib/supabase/server';
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return new Response('Invalid origin', { status: 403 });
  const client = await authClient();
  await client.auth.signOut({ scope: 'local' });
  return NextResponse.redirect(new URL('/login', request.url), 303);
}
