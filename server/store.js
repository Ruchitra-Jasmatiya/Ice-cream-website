// Storage layer.
//  * Production  -> Upstash Redis over REST (Vercel Marketplace / Vercel KV). One HTTP call per request
//                   (pipelined), so reads/writes are fast and changes are visible everywhere instantly.
//  * Local dev   -> a tiny Redis-compatible store persisted to ./data/db.json (zero setup).
//  * Vercel without Redis configured -> in-memory only (works, but data is lost on cold start; the
//                   admin panel shows a red warning in this case).
import fs from 'node:fs';
import path from 'node:path';

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
export const isRedis = Boolean(URL_ && TOKEN);
export const isVercel = Boolean(process.env.VERCEL);

/* ------------------------------ Upstash adapter ------------------------------ */
async function upstash(cmds) {
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error(`Redis: ${r.error}`);
    return r.result;
  });
}

/* ------------------------- Mini Redis (dev / fallback) ------------------------ */
const DB_FILE = path.resolve(process.env.DB_FILE || 'data/db.json');
const persistToDisk = !isVercel && !isRedis;
let mem = { h: {}, s: {}, exp: {} };
if (persistToDisk) {
  try {
    mem = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch { /* first run */ }
}
let saveTimer = null;
function scheduleSave() {
  if (!persistToDisk) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(mem));
      fs.renameSync(DB_FILE + '.tmp', DB_FILE);
    } catch (e) { console.error('db save failed', e.message); }
  }, 25);
}
function alive(k) {
  const e = mem.exp[k];
  if (e && e < Date.now()) { delete mem.s[k]; delete mem.exp[k]; return false; }
  return true;
}
function memCmd([cmd, ...a]) {
  switch (String(cmd).toUpperCase()) {
    case 'GET': return alive(a[0]) && a[0] in mem.s ? mem.s[a[0]] : null;
    case 'SET': {
      const nx = a.includes('NX');
      if (nx && alive(a[0]) && a[0] in mem.s) return null;
      mem.s[a[0]] = String(a[1]);
      const ex = a.indexOf('EX');
      if (ex > -1) mem.exp[a[0]] = Date.now() + Number(a[ex + 1]) * 1000; else delete mem.exp[a[0]];
      scheduleSave(); return 'OK';
    }
    case 'DEL': { let n = 0; for (const k of a) { if (k in mem.s) { delete mem.s[k]; delete mem.exp[k]; n++; } if (k in mem.h) { delete mem.h[k]; n++; } } scheduleSave(); return n; }
    case 'INCR': { alive(a[0]); const v = Number(mem.s[a[0]] || 0) + 1; mem.s[a[0]] = String(v); scheduleSave(); return v; }
    case 'EXPIRE': mem.exp[a[0]] = Date.now() + Number(a[1]) * 1000; return 1;
    case 'HGETALL': { const h = mem.h[a[0]] || {}; return Object.entries(h).flat(); }
    case 'HGET': return (mem.h[a[0]] || {})[a[1]] ?? null;
    case 'HSET': { mem.h[a[0]] ||= {}; let n = 0; for (let i = 1; i < a.length; i += 2) { if (!(a[i] in mem.h[a[0]])) n++; mem.h[a[0]][a[i]] = String(a[i + 1]); } scheduleSave(); return n; }
    case 'HDEL': { let n = 0; for (const f of a.slice(1)) if (mem.h[a[0]] && f in mem.h[a[0]]) { delete mem.h[a[0]][f]; n++; } scheduleSave(); return n; }
    case 'HLEN': return Object.keys(mem.h[a[0]] || {}).length;
    default: throw new Error('unsupported cmd ' + cmd);
  }
}
const run = isRedis ? upstash : async (cmds) => cmds.map(memCmd);

/* --------------------------------- Public API --------------------------------- */
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const toObj = (flat) => { const o = {}; for (let i = 0; i < (flat || []).length; i += 2) o[flat[i]] = flat[i + 1]; return o; };

export const db = {
  mode: isRedis ? 'redis' : isVercel ? 'memory' : 'file',
  persistent: isRedis || persistToDisk,
  run,
  /** Run several commands in ONE round trip. */
  async pipe(cmds) { return run(cmds); },
  async cmd(...c) { return (await run([c]))[0]; },

  async all(coll) {
    const flat = await db.cmd('HGETALL', coll);
    return Object.values(toObj(flat)).map(parse).filter(Boolean);
  },
  async get(coll, id) { return parse(await db.cmd('HGET', coll, String(id))); },
  async put(coll, id, val) { await db.cmd('HSET', coll, String(id), JSON.stringify(val)); return val; },
  async del(coll, id) { return db.cmd('HDEL', coll, String(id)); },
  async getJSON(key) { return parse(await db.cmd('GET', key)); },
  async setJSON(key, val, ttl) { return ttl ? db.cmd('SET', key, JSON.stringify(val), 'EX', ttl) : db.cmd('SET', key, JSON.stringify(val)); },
  async nextId(seq) { return db.cmd('INCR', `seq:${seq}`); },
  /** Bump the public "catalog version". Storefronts poll this tiny value and refetch when it changes. */
  async bump() { return db.cmd('INCR', 'ver'); },
  async version() { return Number((await db.cmd('GET', 'ver')) || 0); },
  /** Fixed-window rate limiter. Returns the hit count in the current window. */
  async hit(key, windowSec) {
    const [n] = await db.pipe([['INCR', `rl:${key}`]]);
    if (n === 1) await db.pipe([['EXPIRE', `rl:${key}`, windowSec]]);
    return n;
  },

  /** Catalog in one round trip: products + categories + settings + version. */
  async catalogRaw() {
    const [p, c, s, v] = await run([['HGETALL', 'products'], ['HGETALL', 'categories'], ['GET', 'settings'], ['GET', 'ver']]);
    return {
      products: Object.values(toObj(p)).map(parse).filter(Boolean),
      categories: Object.values(toObj(c)).map(parse).filter(Boolean),
      settings: parse(s) || {},
      version: Number(v || 0),
    };
  },
  async wipeAll() {
    for (const k of ['products', 'categories', 'orders', 'coupons', 'images']) await db.cmd('DEL', k);
    await db.pipe([['DEL', 'meta:seeded'], ['DEL', 'seq:order'], ['DEL', 'seq:product'], ['DEL', 'seq:category']]);
  },
};
