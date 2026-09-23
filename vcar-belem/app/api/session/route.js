import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const c = cookies().get(SESSION_COOKIE_NAME);
  const ok = isValidSession(c && c.value);
  return NextResponse.json({ isAdmin: ok });
}
