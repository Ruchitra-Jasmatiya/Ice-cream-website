// Single request handler for every /api/* route (one Vercel function = one cold start, always warm-ish).
import { db } from './store.js';
import * as auth from './auth.js';
import {
  HttpError, bad, str, num, bool, ORDER_STATUSES, ensureSeed, writeSeed, publicSettings, cleanSettings,
  visibleProducts, visibleCategories, sortProducts, shapeProduct, maps, cleanProduct, cleanCategory, cleanCoupon,
  evalCoupon, cartId, readCart, priceCart, saveCart, placeOrder, setOrderStatus, stats, newImageId,
} from './shop.js';

/* ------------------------------ request plumbing ------------------------------ */
const routes = [];
const add = (method, pattern, handler, opts = {}) => {
  const keys = [];
  const rx = new RegExp('^' + pattern.replace(/:([a-z]+)/gi, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ method, rx, keys, handler, ...opts });
};
const pub = (m, p, h, o) => add(m, p, h, o);
const adm = (m, p, h, o) => add(m, p, h, { ...o, admin: true });

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && !(req.body instanceof Uint8Array)) {
    if (typeof req.body === 'string') { if (!req.body.trim()) return {}; try { return JSON.parse(req.body); } catch { throw bad('Invalid JSON'); } }
    return req.body;
  }
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > 4_000_000) throw new HttpError(413, 'Request too large'); chunks.push(c); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw bad('Invalid JSON'); }
}
function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.statusCode = status;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers };
  for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
  res.end(status === 204 || status === 304 ? undefined : body);
}
const ipOf = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

function cors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const o = req.headers.origin;
  if (o && allowed.includes(o)) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Cart-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  }
}

export default async function handler(req, res) {
  const t0 = Date.now();
  try {
    cors(req, res);
    if (req.method === 'OPTIONS') return send(res, 204, '');
    const u = new URL(req.url, 'http://x');
    const p = u.pathname.replace(/^\/api/, '') || '/';
    const route = routes.map((r) => { const m = r.method === req.method && p.match(r.rx); return m ? { r, m } : null; }).find(Boolean);
    if (!route) return send(res, 404, { error: 'Not found' });
    const { r, m } = route;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));

    await ensureSeed();

    if (r.admin) {
      if (!(await auth.isAdmin(req))) return send(res, 401, { error: 'Please log in' });
      if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'fnf-admin') return send(res, 403, { error: 'Forbidden' });
    }
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req) : {};
    const out = await r.handler({ req, res, params, query: Object.fromEntries(u.searchParams), body, ip: ipOf(req) });
    if (out === undefined) return; // handler wrote the response itself
    if (out.__raw) return send(res, out.__status || 200, out.body, out.__headers);
    const { __status, __headers, ...data } = out;
    send(res, __status || 200, data, { ...(__headers || {}), 'Server-Timing': `app;dur=${Date.now() - t0}` });
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message, ...e.extra });
    console.error('API error:', e);
    send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}

/* ================================== PUBLIC ================================== */
pub('GET', '/health', async () => ({ ok: true, storage: db.mode, persistent: db.persistent, time: Date.now() }));
pub('GET', '/version', async () => ({ v: await db.version() }));

// Everything the storefront needs in ONE call. Uses the version as an ETag so polling is a cheap 304.
pub('GET', '/catalog', async ({ req }) => {
  const { products, categories, settings, version } = await db.catalogRaw();
  const etag = `W/"c${version}"`;
  if (req.headers['if-none-match'] === etag) return { __raw: true, __status: 304, body: '', __headers: { ETag: etag } };
  const vp = visibleProducts(products, categories);
  return {
    __headers: { ETag: etag },
    version,
    settings: publicSettings(settings),
    categories: visibleCategories(categories, products),
    products: sortProducts(vp, 'best-selling'),
  };
});

pub('GET', '/categories', async () => {
  const { products, categories, version } = await db.catalogRaw();
  return { version, categories: visibleCategories(categories, products) };
});

pub('GET', '/products', async ({ query }) => {
  const { products, categories, version } = await db.catalogRaw();
  let list = visibleProducts(products, categories);
  if (query.category) {
    const q = String(query.category).toLowerCase();
    const cat = categories.find((c) => String(c.id) === q || c.name.toLowerCase() === q);
    list = cat ? list.filter((p) => p.categoryId === cat.id) : [];
  }
  if (query.q) { const q = String(query.q).toLowerCase(); list = list.filter((p) => `${p.name} ${p.description} ${p.category} ${p.ingredients.join(' ')}`.toLowerCase().includes(q)); }
  if (bool(query.veg)) list = list.filter((p) => p.vegetarian);
  if (bool(query.featured)) list = list.filter((p) => p.featured);
  if (query.min) list = list.filter((p) => p.price >= num(query.min));
  if (query.max) list = list.filter((p) => p.price <= num(query.max));
  list = sortProducts(list, query.sort);
  const total = list.length;
  const limit = Math.min(100, Math.max(1, Math.floor(num(query.limit, 100))));
  const page = Math.max(1, Math.floor(num(query.page, 1)));
  return { version, total, page, products: list.slice((page - 1) * limit, page * limit) };
});

pub('GET', '/products/:id', async ({ params }) => {
  const { products, categories } = await db.catalogRaw();
  const p = visibleProducts(products, categories).find((x) => String(x.id) === params.id);
  if (!p) throw new HttpError(404, 'Product not found');
  return { product: p };
});

pub('GET', '/images/:id', async ({ params, res }) => {
  const data = await db.cmd('HGET', 'images', params.id);
  const m = data && String(data).match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/s);
  if (!m) throw new HttpError(404, 'Image not found');
  res.statusCode = 200;
  res.setHeader('Content-Type', m[1]);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(Buffer.from(m[2], 'base64'));
});

/* ----------------------------------- cart ----------------------------------- */
const cartResponse = async (id, ctx, extra = {}) => {
  const priced = await priceCart(ctx);
  await saveCart(id, ctx, priced);
  return { cart: priced, ...extra };
};
pub('GET', '/cart', async ({ req }) => { const { id, ctx } = await readCart(req); return { cart: await priceCart(ctx) , id }; });

pub('POST', '/cart/items', async ({ req, body }) => {
  const { id, ctx } = await readCart(req);
  const productId = Number(body.productId);
  const qty = Math.max(1, Math.min(50, Math.floor(num(body.qty, 1))));
  const raw = ctx.products.find((p) => p.id === productId);
  const cm = maps(ctx.categories);
  if (!raw || raw.active === false || cm.get(raw.categoryId)?.active === false) throw new HttpError(404, 'This product is no longer available');
  if (raw.trackStock !== false && raw.stock <= 0) throw new HttpError(409, `${raw.name} is out of stock`);
  const line = ctx.cart.items.find((i) => i.productId === productId);
  if (line) line.qty += qty; else ctx.cart.items.push({ productId, qty });
  return cartResponse(id, ctx);
});
pub('PATCH', '/cart/items/:productId', async ({ req, params, body }) => {
  const { id, ctx } = await readCart(req);
  const pid = Number(params.productId);
  const qty = Math.floor(num(body.qty, 1));
  const line = ctx.cart.items.find((i) => i.productId === pid);
  if (!line) throw new HttpError(404, 'Item not in cart');
  if (qty <= 0) ctx.cart.items = ctx.cart.items.filter((i) => i !== line); else line.qty = Math.min(50, qty);
  return cartResponse(id, ctx);
});
pub('DELETE', '/cart/items/:productId', async ({ req, params }) => {
  const { id, ctx } = await readCart(req);
  ctx.cart.items = ctx.cart.items.filter((i) => i.productId !== Number(params.productId));
  return cartResponse(id, ctx);
});
pub('DELETE', '/cart', async ({ req }) => { const { id, ctx } = await readCart(req); ctx.cart = { items: [], coupon: null }; return cartResponse(id, ctx); });
pub('POST', '/cart/coupon', async ({ req, body }) => {
  const { id, ctx } = await readCart(req);
  const code = str(body.code, 24).toUpperCase();
  const c = await db.get('coupons', code);
  const priced = await priceCart(ctx);
  const r = evalCoupon(c, priced.subtotal);
  if (!r.ok) throw bad(r.error);
  ctx.cart.coupon = code;
  return cartResponse(id, ctx);
});
pub('DELETE', '/cart/coupon', async ({ req }) => { const { id, ctx } = await readCart(req); ctx.cart.coupon = null; return cartResponse(id, ctx); });

/* ---------------------------------- orders ---------------------------------- */
pub('POST', '/orders', async ({ req, body, ip }) => {
  if ((await db.hit(`order:${ip}`, 3600)) > 15) throw new HttpError(429, 'Too many orders from this device. Please try later.');
  const { id, ctx } = await readCart(req);
  const order = await placeOrder(id, ctx, body, ip);
  const { ip: _ip, ...safe } = order;
  return { __status: 201, order: safe };
});
pub('GET', '/orders/track', async ({ query, ip }) => {
  if ((await db.hit(`track:${ip}`, 600)) > 30) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
  const number = str(query.number, 20).toUpperCase();
  const phone = str(query.phone, 20).replace(/\D/g, '');
  const o = (await db.all('orders')).find((x) => x.number === number);
  if (!o || !phone || o.customer.phone.replace(/\D/g, '').slice(-8) !== phone.slice(-8)) throw new HttpError(404, 'Order not found. Check the order number and phone.');
  const { ip: _ip, customer, ...rest } = o;
  return { order: { ...rest, customer: { name: customer.name } } };
});

/* =================================== ADMIN =================================== */
pub('POST', '/admin/login', async ({ req, res, body, ip }) => {
  if ((await db.hit(`login:${ip}`, 900)) > 8) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');
  const settings = (await db.getJSON('settings')) || {};
  const r = await auth.verifyPassword(body.password, settings);
  if (r.notConfigured) throw new HttpError(503, 'Admin password is not configured. Add ADMIN_PASSWORD in your Vercel project environment variables and redeploy.');
  if (!r.ok) throw new HttpError(401, 'Wrong password');
  res.setHeader('Set-Cookie', auth.sessionCookie(req, await auth.signToken(settings)));
  return { ok: true, usingDefaultPassword: !!r.isDefault };
});
pub('POST', '/admin/logout', async ({ req, res }) => { res.setHeader('Set-Cookie', auth.sessionCookie(req, '')); return { ok: true }; });
pub('GET', '/admin/session', async ({ req }) => ({
  authenticated: await auth.isAdmin(req),
  storage: { mode: db.mode, persistent: db.persistent },
}));

adm('POST', '/admin/password', async ({ req, res, body }) => {
  const settings = (await db.getJSON('settings')) || {};
  const ok = await auth.verifyPassword(body.current, settings);
  if (!ok.ok) throw new HttpError(403, 'Current password is wrong');
  const next = String(body.next || '');
  if (next.length < 8) throw bad('New password must be at least 8 characters');
  const { salt, hash } = auth.hashPassword(next);
  const upd = { ...settings, passwordSalt: salt, passwordHash: hash };
  await db.setJSON('settings', upd);
  res.setHeader('Set-Cookie', auth.sessionCookie(req, await auth.signToken(upd)));
  return { ok: true };
});

adm('GET', '/admin/stats', async ({ query }) => stats(num(query.tz, 0)));

/* products */
const imgUrlsOf = (o) => [o?.image1, o?.image2, o?.image].filter((u) => typeof u === 'string' && u.startsWith('/api/images/'));
async function dropUnusedImages(before, after) {
  const keep = new Set(imgUrlsOf(after));
  const gone = imgUrlsOf(before).filter((u) => !keep.has(u));
  if (gone.length) await db.pipe([...new Set(gone)].map((u) => ['HDEL', 'images', u.split('/').pop()]));
}
adm('GET', '/admin/products', async () => {
  const { products, categories } = await db.catalogRaw();
  const cm = maps(categories);
  return { products: products.map((p) => shapeProduct(p, cm)).sort((a, b) => b.id - a.id) };
});
adm('POST', '/admin/products', async ({ body }) => {
  const cats = await db.all('categories');
  const id = await db.nextId('product');
  const p = cleanProduct(body, cats, { id, createdAt: Date.now() });
  await db.pipe([['HSET', 'products', String(id), JSON.stringify(p)], ['INCR', 'ver']]);
  return { __status: 201, product: shapeProduct(p, maps(cats)) };
});
adm('PUT', '/admin/products/:id', async ({ params, body }) => {
  const cur = await db.get('products', params.id);
  if (!cur) throw new HttpError(404, 'Product not found');
  const cats = await db.all('categories');
  const p = cleanProduct(body, cats, cur);
  await db.pipe([['HSET', 'products', String(cur.id), JSON.stringify(p)], ['INCR', 'ver']]);
  await dropUnusedImages(cur, p);
  return { product: shapeProduct(p, maps(cats)) };
});
adm('PATCH', '/admin/products/:id', async ({ params, body }) => { // quick toggles: active / featured / stock / price
  const cur = await db.get('products', params.id);
  if (!cur) throw new HttpError(404, 'Product not found');
  const cats = await db.all('categories');
  const allowed = {}; for (const k of ['active', 'featured', 'stock', 'price', 'mrp']) if (body[k] !== undefined) allowed[k] = body[k];
  const p = cleanProduct(allowed, cats, cur);
  await db.pipe([['HSET', 'products', String(cur.id), JSON.stringify(p)], ['INCR', 'ver']]);
  return { product: shapeProduct(p, maps(cats)) };
});
adm('POST', '/admin/products/:id/duplicate', async ({ params }) => {
  const cur = await db.get('products', params.id);
  if (!cur) throw new HttpError(404, 'Product not found');
  const id = await db.nextId('product');
  const copy = { ...cur, id, name: `${cur.name} (copy)`.slice(0, 120), active: false, sold: 0, createdAt: Date.now(), updatedAt: Date.now() };
  await db.pipe([['HSET', 'products', String(id), JSON.stringify(copy)], ['INCR', 'ver']]);
  return { __status: 201, product: copy };
});
adm('DELETE', '/admin/products/:id', async ({ params }) => {
  const cur = await db.get('products', params.id);
  if (!cur) throw new HttpError(404, 'Product not found');
  await db.pipe([['HDEL', 'products', String(cur.id)], ['INCR', 'ver']]);
  await dropUnusedImages(cur, null);
  return { ok: true };
});

/* categories */
adm('GET', '/admin/categories', async () => {
  const { products, categories } = await db.catalogRaw();
  return { categories: categories.sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id)).map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length })) };
});
adm('POST', '/admin/categories', async ({ body }) => {
  const all = await db.all('categories');
  const id = await db.nextId('category');
  const c = cleanCategory(body, all, { id, createdAt: Date.now(), sortOrder: all.length + 1 });
  await db.pipe([['HSET', 'categories', String(id), JSON.stringify(c)], ['INCR', 'ver']]);
  return { __status: 201, category: c };
});
adm('PUT', '/admin/categories/:id', async ({ params, body }) => {
  const all = await db.all('categories');
  const cur = all.find((c) => String(c.id) === params.id);
  if (!cur) throw new HttpError(404, 'Category not found');
  const c = cleanCategory(body, all, cur);
  await db.pipe([['HSET', 'categories', String(cur.id), JSON.stringify(c)], ['INCR', 'ver']]);
  await dropUnusedImages(cur, c);
  return { category: c };
});
adm('DELETE', '/admin/categories/:id', async ({ params }) => {
  const cur = await db.get('categories', params.id);
  if (!cur) throw new HttpError(404, 'Category not found');
  const n = (await db.all('products')).filter((p) => p.categoryId === cur.id).length;
  if (n) throw new HttpError(409, `This category still has ${n} product${n > 1 ? 's' : ''}. Move or delete them first.`);
  await db.pipe([['HDEL', 'categories', String(cur.id)], ['INCR', 'ver']]);
  await dropUnusedImages(cur, null);
  return { ok: true };
});

/* orders */
adm('GET', '/admin/orders', async ({ query }) => {
  let list = (await db.all('orders')).sort((a, b) => b.id - a.id);
  if (query.status && ORDER_STATUSES.includes(query.status)) list = list.filter((o) => o.status === query.status);
  if (query.q) { const q = String(query.q).toLowerCase(); list = list.filter((o) => `${o.number} ${o.customer.name} ${o.customer.phone} ${o.customer.address}`.toLowerCase().includes(q)); }
  const total = list.length;
  const limit = Math.min(200, Math.max(1, Math.floor(num(query.limit, 50))));
  const page = Math.max(1, Math.floor(num(query.page, 1)));
  return { total, page, orders: list.slice((page - 1) * limit, page * limit) };
});
adm('PATCH', '/admin/orders/:id', async ({ params, body }) => {
  const o = await db.get('orders', params.id);
  if (!o) throw new HttpError(404, 'Order not found');
  return { order: await setOrderStatus(o, str(body.status, 30), body.note) };
});
adm('DELETE', '/admin/orders/:id', async ({ params }) => {
  const o = await db.get('orders', params.id);
  if (!o) throw new HttpError(404, 'Order not found');
  await db.del('orders', o.id);
  return { ok: true };
});

/* coupons */
adm('GET', '/admin/coupons', async () => ({ coupons: (await db.all('coupons')).sort((a, b) => a.code.localeCompare(b.code)) }));
adm('POST', '/admin/coupons', async ({ body }) => {
  const c = cleanCoupon(body);
  if (await db.get('coupons', c.code)) throw new HttpError(409, 'A coupon with this code already exists');
  await db.put('coupons', c.code, c);
  return { __status: 201, coupon: c };
});
adm('PUT', '/admin/coupons/:code', async ({ params, body }) => {
  const cur = await db.get('coupons', params.code.toUpperCase());
  if (!cur) throw new HttpError(404, 'Coupon not found');
  const c = cleanCoupon({ ...body, code: cur.code }, cur);
  await db.put('coupons', c.code, c);
  return { coupon: c };
});
adm('DELETE', '/admin/coupons/:code', async ({ params }) => { await db.del('coupons', params.code.toUpperCase()); return { ok: true }; });

/* settings */
adm('GET', '/admin/settings', async () => {
  const { passwordHash, passwordSalt, ...s } = (await db.getJSON('settings')) || {};
  return { settings: s, storage: { mode: db.mode, persistent: db.persistent } };
});
adm('PUT', '/admin/settings', async ({ body }) => {
  const cur = (await db.getJSON('settings')) || {};
  const next = cleanSettings(body, cur);
  await db.pipe([['SET', 'settings', JSON.stringify(next)], ['INCR', 'ver']]);
  const { passwordHash, passwordSalt, ...s } = next;
  return { settings: s };
});

/* image upload (browser compresses first; stored in Redis, served at /api/images/:id with 1y immutable cache) */
adm('POST', '/admin/upload', async ({ body }) => {
  const m = String(body.dataUrl || '').match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw bad('Please upload a PNG, JPG, WEBP or GIF image');
  const bytes = Buffer.byteLength(m[2], 'base64');
  if (bytes > 700_000) throw new HttpError(413, 'Image is too large (max ~700 KB after compression)');
  const id = newImageId();
  await db.cmd('HSET', 'images', id, body.dataUrl);
  return { __status: 201, url: `/api/images/${id}`, bytes };
});

/* backup / restore */
adm('GET', '/admin/export', async ({ res }) => {
  const [products, categories, coupons, orders, settings] = await Promise.all([db.all('products'), db.all('categories'), db.all('coupons'), db.all('orders'), db.getJSON('settings')]);
  const { passwordHash, passwordSalt, ...s } = settings || {};
  const imgs = {};
  for (const u of new Set([...products.flatMap(imgUrlsOf), ...categories.flatMap(imgUrlsOf)])) imgs[u.split('/').pop()] = await db.cmd('HGET', 'images', u.split('/').pop());
  return { __raw: true, body: JSON.stringify({ exportedAt: new Date().toISOString(), products, categories, coupons, orders, settings: s, images: imgs }), __headers: { 'Content-Disposition': `attachment; filename="freshnfreeze-backup-${new Date().toISOString().slice(0, 10)}.json"` } };
});
adm('POST', '/admin/import', async ({ body }) => {
  if (!Array.isArray(body.products) || !Array.isArray(body.categories)) throw bad('This does not look like a FreshnFreeze backup file');
  await db.wipeAll();
  const cmds = [];
  for (const c of body.categories) cmds.push(['HSET', 'categories', String(c.id), JSON.stringify(c)]);
  for (const p of body.products) cmds.push(['HSET', 'products', String(p.id), JSON.stringify(p)]);
  for (const c of body.coupons || []) cmds.push(['HSET', 'coupons', c.code, JSON.stringify(c)]);
  for (const o of body.orders || []) cmds.push(['HSET', 'orders', String(o.id), JSON.stringify(o)]);
  for (const [id, d] of Object.entries(body.images || {})) if (/^[a-f0-9]+$/.test(id) && d) cmds.push(['HSET', 'images', id, d]);
  const cur = (await db.getJSON('settings')) || {};
  cmds.push(['SET', 'settings', JSON.stringify({ ...cur, ...cleanSettings(body.settings || {}, cur) })]);
  cmds.push(['SET', 'meta:seeded', '1']);
  cmds.push(['SET', 'seq:product', String(Math.max(0, ...body.products.map((p) => p.id)))]);
  cmds.push(['SET', 'seq:category', String(Math.max(0, ...body.categories.map((c) => c.id)))]);
  cmds.push(['SET', 'seq:order', String(Math.max(0, ...(body.orders || []).map((o) => o.id)))]);
  cmds.push(['INCR', 'ver']);
  await db.pipe(cmds);
  return { ok: true };
});
adm('POST', '/admin/reset', async ({ body }) => {
  if (body.confirm !== 'RESET') throw bad('Type RESET to confirm');
  await db.wipeAll();
  await db.cmd('SET', 'meta:seeded', '1');
  await writeSeed();
  return { ok: true };
});
