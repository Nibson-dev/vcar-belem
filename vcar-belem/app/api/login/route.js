import { NextResponse } from 'next/server';
import { buildSessionCookie } from '@/lib/auth';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Requisição inválida.' }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD não configurada no servidor. Defina essa variável de ambiente na Vercel.' },
      { status: 500 }
    );
  }

  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Senha incorreta.' }, { status: 401 });
  }

  const cookie = buildSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: cookie.maxAge,
  });
  return res;
}
