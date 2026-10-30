import crypto from 'node:crypto';
import { db } from './store.js';

const COOKIE = 'fnf_admin';
const TTL_SEC = 60 * 60 * 12; // 12h session

const b64u = (b) => Buffer.from(b).toString('base64url');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

export function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return { salt, hash };
}
function safeEq(a, b) {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Active password = stored (changed in the panel) unless forced back to the env value. */
async function credential(settings) {
  const env = process.env.ADMIN_PASSWORD;
  const forceEnv = String(process.env.ADMIN_FORCE_ENV_PASSWORD || '').toLowerCase() === 'true';
  if (!forceEnv && settings?.passwordHash) return { kind: 'stored', salt: settings.passwordSalt, hash: settings.passwordHash };
  if (env) return { kind: 'env', value: env };
  if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') return { kind: 'env', value: 'admin123', isDefault: true };
  return null;
}
export async function verifyPassword(pw, settings) {
  const c = await credential(settings);
  if (!c) return { ok: false, notConfigured: true };
  if (typeof pw !== 'string' || !pw) return { ok: false };
  if (c.kind === 'env') return { ok: safeEq(sha(pw), sha(c.value)), isDefault: !!c.isDefault };
  return { ok: safeEq(hashPassword(pw, c.salt).hash, c.hash) };
}
async function secret(settings) {
  const c = await credential(settings);
  const base = process.env.ADMIN_SECRET || 'fnf-dev-secret';
  return sha(base + '|' + (c ? (c.kind === 'env' ? c.value : c.hash) : 'none'));
}
export async function signToken(settings) {
  const body = b64u(JSON.stringify({ exp: Date.now() + TTL_SEC * 1000, n: crypto.randomBytes(6).toString('hex') }));
  const sig = crypto.createHmac('sha256', await secret(settings)).update(body).digest('base64url');
  return `${body}.${sig}`;
}
export async function verifyToken(token, settings) {
  if (!token || !token.includes('.')) return false;
  const [body, sig] = token.split('.');
  const good = crypto.createHmac('sha256', await secret(settings)).update(body).digest('base64url');
  if (!safeEq(sig, good)) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}
export function readCookie(req, name = COOKIE) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}
export function sessionCookie(req, token) {
  const secure = (req.headers['x-forwarded-proto'] || '').includes('https') || process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE}=${token ? encodeURIComponent(token) : ''}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token ? TTL_SEC : 0}${secure}`;
}
export async function isAdmin(req) {
  const settings = await db.getJSON('settings');
  return verifyToken(readCookie(req), settings || {});
}
