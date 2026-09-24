import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function b64urlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export interface UserTokenPayload {
  sub: string;
  email: string;
  name: string;
  plan: string;
}

export function signUserToken(payload: UserTokenPayload, secret: string, ttlSec = 60 * 60 * 24 * 7): string {
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const body = b64urlJson({ ...payload, iat: now, exp: now + ttlSec });
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyUserToken(token: string, secret: string): UserTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as UserTokenPayload & {
      exp?: number;
    };
    if (!payload.sub || !payload.email) return null;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function looksLikeJwt(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}
