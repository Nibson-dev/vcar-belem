import crypto from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'vcar_admin';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'vcar-dev-secret-troque-em-producao';
}

function sign(value) {
  const h = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  return `${value}.${h}`;
}

function verify(signed) {
  if (!signed || typeof signed !== 'string') return false;
  const idx = signed.lastIndexOf('.');
  if (idx === -1) return false;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  try {
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    return Number(value) > Date.now();
  } catch {
    return false;
  }
}

export function buildSessionCookie() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  return {
    name: SESSION_COOKIE_NAME,
    value: sign(String(expiresAt)),
    maxAge: MAX_AGE_SECONDS,
  };
}

export function isValidSession(value) {
  return verify(value);
}

// Usado dentro de rotas de API (Route Handlers) para exigir login de admin.
export function requireAdmin() {
  const c = cookies().get(SESSION_COOKIE_NAME);
  return isValidSession(c && c.value);
}
