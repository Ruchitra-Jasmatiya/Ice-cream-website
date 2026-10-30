import crypto from 'node:crypto';
import { db } from './store.js';
import { SEED } from './seed.js';

/* ------------------------------- tiny helpers ------------------------------- */
export class HttpError extends Error {
  constructor(status, message, extra = {}) { super(message); this.status = status; this.extra = extra; }
}
export const bad = (msg, extra) => new HttpError(400, msg, extra);
export const str = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
export const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
export const bool = (v, d = false) => (v === undefined || v === null ? d : v === true || v === 'true' || v === 1 || v === '1');
const money = (n) => Math.round(num(n) * 100) / 100;
export const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

function imageUrl(v, label) {
  const s = str(v, 600);
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || /^\/(?!\/)[\w\-./%]*$/.test(s)) return s;
  throw bad(`${label}: must be an http(s) link or an uploaded image`);
}

/* ---------------------------------- seeding ---------------------------------- */
let seeded = false;
export async function ensureSeed() {
  if (seeded) return;
  const first = await db.cmd('SET', 'meta:seeded', '1', 'NX');
  if (first === 'OK') await writeSeed();
  seeded = true;
}
export async function writeSeed() {
  const cmds = [];
  for (const c of SEED.categories) cmds.push(['HSET', 'categories', String(c.id), JSON.stringify(c)]);
  for (const p of SEED.products) cmds.push(['HSET', 'products', String(p.id), JSON.stringify(p)]);
  for (const c of SEED.coupons) cmds.push(['HSET', 'coupons', c.code, JSON.stringify(c)]);
  cmds.push(['SET', 'settings', JSON.stringify(SEED.settings)]);
  cmds.push(['SET', 'seq:product', String(Math.max(...SEED.products.map((p) => p.id)))]);
  cmds.push(['SET', 'seq:category', String(Math.max(...SEED.categories.map((c) => c.id)))]);
  cmds.push(['INCR', 'ver']);
  await db.pipe(cmds);
}

/* --------------------------------- settings --------------------------------- */
export const PUBLIC_SETTINGS = ['shopName', 'currency', 'deliveryFee', 'freeDeliveryAbove', 'acceptingOrders', 'announcement', 'contactPhone', 'minOrder'];
export const publicSettings = (s = {}) => Object.fromEntries(PUBLIC_SETTINGS.map((k) => [k, s[k] ?? SEED.settings[k]]));
export function cleanSettings(b, cur) {
  return {
    ...cur,
    shopName: str(b.shopName ?? cur.shopName, 60) || 'FreshnFreeze',
    currency: str(b.currency ?? cur.currency, 4) || '₹',
    deliveryFee: Math.max(0, money(b.deliveryFee ?? cur.deliveryFee)),
    freeDeliveryAbove: Math.max(0, money(b.freeDeliveryAbove ?? cur.freeDeliveryAbove)),
    minOrder: Math.max(0, money(b.minOrder ?? cur.minOrder)),
    acceptingOrders: bool(b.acceptingOrders, cur.acceptingOrders !== false),
    announcement: str(b.announcement ?? cur.announcement, 200),
    contactPhone: str(b.contactPhone ?? cur.contactPhone, 20),
  };
}

/* ------------------------------ product shaping ------------------------------ */
export function shapeProduct(p, catById) {
  const cat = catById.get(p.categoryId);
  const price = money(p.price);
  const mrp = money(p.mrp) > price ? money(p.mrp) : price;
  return {
    ...p,
    price, mrp,
    category: cat?.name || '',
    image1: p.image1 || p.image2 || '',
    image2: p.image2 || p.image1 || '',
    inStock: p.trackStock === false || num(p.stock) > 0,
    discountPercent: mrp > price ? Math.round((1 - price / mrp) * 100) : 0,
  };
}
export const maps = (cats) => new Map(cats.map((c) => [c.id, c]));
const catOrder = (a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id) || a.id - b.id;
export const visibleProducts = (products, cats) => {
  const cm = maps(cats);
  return products.filter((p) => p.active !== false && cm.get(p.categoryId)?.active !== false).map((p) => shapeProduct(p, cm));
};
export const visibleCategories = (cats, products) => cats.filter((c) => c.active !== false).sort(catOrder)
  .map((c) => ({ ...c, productCount: products.filter((p) => p.active !== false && p.categoryId === c.id).length }));

export function sortProducts(list, sort) {
  const a = [...list];
  const by = {
    'low-high': (x, y) => x.price - y.price,
    'high-low': (x, y) => y.price - x.price,
    newest: (x, y) => y.createdAt - x.createdAt,
    name: (x, y) => x.name.localeCompare(y.name),
    'best-selling': (x, y) => (y.sold || 0) - (x.sold || 0) || Number(y.featured) - Number(x.featured) || x.id - y.id,
  };
  return a.sort(by[sort] || by['best-selling']);
}

/* ----------------------------- product validation ----------------------------- */
export function cleanProduct(b, cats, cur = {}) {
  const get = (k, d) => (b[k] !== undefined ? b[k] : d);
  const name = str(get('name', cur.name), 120);
  if (name.length < 2) throw bad('Product name is required (min 2 characters)');
  const price = money(get('price', cur.price));
  if (!(price >= 0) || price > 1_000_000) throw bad('Enter a valid price');
  const categoryId = Number(get('categoryId', cur.categoryId));
  if (!cats.some((c) => c.id === categoryId)) throw bad('Choose a valid category');
  let ing = get('ingredients', cur.ingredients || []);
  if (typeof ing === 'string') ing = ing.split(/[\n,]/);
  if (!Array.isArray(ing)) ing = [];
  ing = ing.map((i) => str(i, 80)).filter(Boolean).slice(0, 40);
  const mrp = money(get('mrp', cur.mrp)) || price;
  const stock = Math.max(0, Math.min(1_000_000, Math.floor(num(get('stock', cur.stock ?? 50)))));
  const image1 = imageUrl(get('image1', cur.image1), 'Main image');
  const image2 = imageUrl(get('image2', cur.image2), 'Hover image') || image1;
  return {
    id: cur.id, name, price, mrp: mrp < price ? price : mrp, categoryId,
    description: str(get('description', cur.description), 1200),
    image1, image2, ingredients: ing,
    vegetarian: bool(get('vegetarian', cur.vegetarian), true),
    trackStock: bool(get('trackStock', cur.trackStock), true),
    stock,
    active: bool(get('active', cur.active), true),
    featured: bool(get('featured', cur.featured), false),
    sold: cur.sold || 0,
    createdAt: cur.createdAt || Date.now(), updatedAt: Date.now(),
  };
}
export function cleanCategory(b, all, cur = {}) {
  const name = str(b.name ?? cur.name, 60);
  if (name.length < 2) throw bad('Category name is required (min 2 characters)');
  if (all.some((c) => c.id !== cur.id && c.name.toLowerCase() === name.toLowerCase())) throw new HttpError(409, 'A category with this name already exists');
  return {
    id: cur.id, name,
    image: imageUrl(b.image ?? cur.image, 'Image'),
    description: str(b.description ?? cur.description, 300),
    active: bool(b.active, cur.active !== false),
    sortOrder: Number.isFinite(Number(b.sortOrder)) && b.sortOrder !== '' ? Number(b.sortOrder) : (cur.sortOrder ?? 999),
    createdAt: cur.createdAt || Date.now(),
  };
}
export function cleanCoupon(b, cur = {}) {
  const code = str(b.code ?? cur.code, 24).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (code.length < 3) throw bad('Coupon code needs at least 3 letters/numbers');
  const type = (b.type ?? cur.type) === 'flat' ? 'flat' : 'percent';
  const value = money(b.value ?? cur.value);
  if (!(value > 0) || (type === 'percent' && value > 100)) throw bad(type === 'percent' ? 'Percent must be between 1 and 100' : 'Enter a discount amount');
  const exp = b.expiresAt ?? cur.expiresAt;
  return {
    code, type, value,
    minOrder: Math.max(0, money(b.minOrder ?? cur.minOrder)),
    maxDiscount: Math.max(0, money(b.maxDiscount ?? cur.maxDiscount)),
    usageLimit: Math.max(0, Math.floor(num(b.usageLimit ?? cur.usageLimit))),
    used: cur.used || 0,
    active: bool(b.active, cur.active !== false),
    expiresAt: exp ? new Date(exp).getTime() || null : null,
    description: str(b.description ?? cur.description, 120),
  };
}

/* ----------------------------------- coupons ----------------------------------- */
export function evalCoupon(c, subtotal) {
  if (!c || c.active === false) return { ok: false, error: 'Invalid coupon code' };
  if (c.expiresAt && c.expiresAt < Date.now()) return { ok: false, error: 'This coupon has expired' };
  if (c.usageLimit && c.used >= c.usageLimit) return { ok: false, error: 'This coupon has been fully redeemed' };
  if (subtotal < (c.minOrder || 0)) return { ok: false, error: `Add items worth ₹${money(c.minOrder - subtotal)} more to use this coupon` };
  let d = c.type === 'percent' ? (subtotal * c.value) / 100 : c.value;
  if (c.type === 'percent' && c.maxDiscount) d = Math.min(d, c.maxDiscount);
  return { ok: true, discount: money(Math.min(d, subtotal)) };
}

/* ------------------------------------- cart ------------------------------------- */
export const CART_TTL = 60 * 60 * 24 * 30;
export const cartId = (req) => {
  const id = String(req.headers['x-cart-id'] || '');
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) throw bad('Missing or invalid X-Cart-Id header');
  return id;
};
async function loadCart(id) {
  const { run } = db;
  const [p, c, s, cartRaw] = await run([['HGETALL', 'products'], ['HGETALL', 'categories'], ['GET', 'settings'], ['GET', `cart:${id}`]]);
  const obj = (f) => { const o = []; for (let i = 1; i < (f || []).length; i += 2) { try { o.push(JSON.parse(f[i])); } catch { /* skip */ } } return o; };
  let cart = { items: [], coupon: null };
  try { cart = JSON.parse(cartRaw) || cart; } catch { /* new cart */ }
  return { products: obj(p), categories: obj(c), settings: (() => { try { return JSON.parse(s) || {}; } catch { return {}; } })(), cart };
}
export async function priceCart(ctx) {
  const { products, categories, settings, cart } = ctx;
  const cm = maps(categories);
  const warnings = [];
  const items = [];
  for (const line of cart.items) {
    const raw = products.find((p) => p.id === line.productId);
    if (!raw || raw.active === false || cm.get(raw.categoryId)?.active === false) { warnings.push('An item is no longer available and was removed'); continue; }
    const p = shapeProduct(raw, cm);
    let qty = Math.max(1, Math.min(50, Math.floor(line.qty)));
    if (raw.trackStock !== false) {
      if (raw.stock <= 0) { warnings.push(`${p.name} is out of stock and was removed`); continue; }
      if (qty > raw.stock) { qty = raw.stock; warnings.push(`Only ${raw.stock} of ${p.name} left`); }
    }
    items.push({ productId: p.id, name: p.name, price: p.price, mrp: p.mrp, qty, image: p.image1, category: p.category, vegetarian: p.vegetarian, stock: raw.trackStock === false ? null : raw.stock, lineTotal: money(p.price * qty) });
  }
  const subtotal = money(items.reduce((s, i) => s + i.lineTotal, 0));
  let discount = 0; let coupon = null; let couponError = null;
  if (cart.coupon) {
    const c = await db.get('coupons', cart.coupon);
    const r = evalCoupon(c, subtotal);
    if (r.ok) { discount = r.discount; coupon = { code: c.code, description: c.description, type: c.type, value: c.value, discount }; } else couponError = r.error;
  }
  const s = { ...SEED.settings, ...settings };
  const after = subtotal - discount;
  const delivery = items.length === 0 ? 0 : (s.freeDeliveryAbove > 0 && after >= s.freeDeliveryAbove) ? 0 : s.deliveryFee;
  return {
    items, count: items.reduce((n, i) => n + i.qty, 0), subtotal, discount, coupon, couponError, delivery,
    total: money(after + delivery),
    freeDeliveryAbove: s.freeDeliveryAbove,
    amountToFreeDelivery: s.freeDeliveryAbove > 0 && items.length ? Math.max(0, money(s.freeDeliveryAbove - after)) : 0,
    minOrder: s.minOrder, acceptingOrders: s.acceptingOrders !== false, currency: s.currency, warnings,
  };
}
export async function readCart(req) {
  const id = cartId(req);
  const ctx = await loadCart(id);
  return { id, ctx };
}
export async function saveCart(id, ctx, priced) {
  // Persist the cleaned lines (removed / clamped items are dropped) and the valid coupon.
  ctx.cart.items = priced.items.map((i) => ({ productId: i.productId, qty: i.qty }));
  if (!priced.coupon) ctx.cart.coupon = null;
  if (ctx.cart.items.length === 0) { await db.cmd('DEL', `cart:${id}`); return; }
  await db.setJSON(`cart:${id}`, ctx.cart, CART_TTL);
}

/* ------------------------------------ orders ------------------------------------ */
export function cleanCustomer(b = {}) {
  const name = str(b.name, 80);
  const phone = str(b.phone, 20).replace(/[^\d+]/g, '');
  const email = str(b.email, 120);
  const address = str(b.address, 300);
  if (name.length < 2) throw bad('Please enter your name');
  if (phone.replace(/\D/g, '').length < 8 || phone.replace(/\D/g, '').length > 15) throw bad('Please enter a valid phone number');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad('Please enter a valid email address');
  if (address.length < 5) throw bad('Please enter your delivery address');
  return { name, phone, email, address, city: str(b.city, 60), pincode: str(b.pincode, 10), note: str(b.note, 300) };
}
export async function placeOrder(id, ctx, body, ip) {
  const priced = await priceCart(ctx);
  if (!priced.acceptingOrders) throw new HttpError(503, 'We are not accepting orders right now. Please try again later.');
  if (!priced.items.length) throw bad('Your cart is empty', { warnings: priced.warnings });
  if (priced.warnings.length) throw new HttpError(409, priced.warnings[0], { cart: priced });
  if (priced.minOrder && priced.subtotal < priced.minOrder) throw bad(`Minimum order is ₹${priced.minOrder}`);
  const customer = cleanCustomer(body);
  const seq = await db.nextId('order');
  const now = Date.now();
  const order = {
    id: seq, number: `FNF-${1000 + seq}`,
    items: priced.items.map(({ productId, name, price, qty, image, lineTotal }) => ({ productId, name, price, qty, image, lineTotal })),
    subtotal: priced.subtotal, discount: priced.discount, coupon: priced.coupon?.code || null,
    delivery: priced.delivery, total: priced.total, customer,
    payment: 'COD', status: 'pending', history: [{ status: 'pending', at: now }], createdAt: now, ip,
  };
  const cmds = [['HSET', 'orders', String(seq), JSON.stringify(order)]];
  for (const i of priced.items) {
    const p = ctx.products.find((x) => x.id === i.productId);
    if (p.trackStock !== false) p.stock = Math.max(0, p.stock - i.qty);
    p.sold = (p.sold || 0) + i.qty; p.updatedAt = now;
    cmds.push(['HSET', 'products', String(p.id), JSON.stringify(p)]);
  }
  if (order.coupon) { const c = await db.get('coupons', order.coupon); if (c) { c.used = (c.used || 0) + 1; cmds.push(['HSET', 'coupons', c.code, JSON.stringify(c)]); } }
  cmds.push(['DEL', `cart:${id}`], ['INCR', 'ver']);
  await db.pipe(cmds);
  return order;
}
export async function setOrderStatus(order, status, note) {
  if (!ORDER_STATUSES.includes(status)) throw bad('Invalid status');
  if (order.status === status) return order;
  if (order.status === 'cancelled') throw new HttpError(409, 'A cancelled order cannot be re-opened. Ask the customer to place a new order.');
  const cmds = [];
  if (status === 'cancelled') {
    for (const i of order.items) {
      const p = await db.get('products', i.productId);
      if (p) { if (p.trackStock !== false) p.stock += i.qty; p.sold = Math.max(0, (p.sold || 0) - i.qty); cmds.push(['HSET', 'products', String(p.id), JSON.stringify(p)]); }
    }
    cmds.push(['INCR', 'ver']);
  }
  order.status = status;
  order.history.push({ status, at: Date.now(), ...(note ? { note: str(note, 200) } : {}) });
  cmds.push(['HSET', 'orders', String(order.id), JSON.stringify(order)]);
  await db.pipe(cmds);
  return order;
}

/* ------------------------------------- stats ------------------------------------- */
export async function stats(tzMin = 0) {
  const [orders, products, cats] = await Promise.all([db.all('orders'), db.all('products'), db.all('categories')]);
  const live = orders.filter((o) => o.status !== 'cancelled');
  const dayKey = (t) => new Date(t + tzMin * 60000).toISOString().slice(0, 10);
  const today = dayKey(Date.now());
  const days = [];
  for (let i = 6; i >= 0; i--) { const k = dayKey(Date.now() - i * 86400000); days.push({ date: k, orders: 0, revenue: 0 }); }
  for (const o of live) { const d = days.find((x) => x.date === dayKey(o.createdAt)); if (d) { d.orders++; d.revenue = money(d.revenue + o.total); } }
  const t = days.find((d) => d.date === today);
  const sorted = [...orders].sort((a, b) => b.id - a.id);
  return {
    today: { orders: t.orders, revenue: t.revenue },
    totals: { orders: orders.length, revenue: money(live.reduce((s, o) => s + o.total, 0)), products: products.length, categories: cats.length, activeProducts: products.filter((p) => p.active !== false).length },
    pending: orders.filter((o) => o.status === 'pending').length,
    lastOrderId: sorted[0]?.id || 0,
    days,
    topSellers: [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5).map((p) => ({ id: p.id, name: p.name, sold: p.sold || 0, image: p.image1 })),
    lowStock: products.filter((p) => p.trackStock !== false && p.active !== false && p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 8).map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
    recent: sorted.slice(0, 6).map((o) => ({ id: o.id, number: o.number, name: o.customer.name, total: o.total, status: o.status, createdAt: o.createdAt })),
  };
}

export const newImageId = () => crypto.randomBytes(9).toString('hex');
