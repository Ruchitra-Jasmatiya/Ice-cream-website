// Tiny API client for the FreshnFreeze backend (same origin on Vercel; proxied to :3001 in `npm run dev`).
const BASE = import.meta.env.VITE_API_BASE || '';

let memoryId = null;
export function getCartId() {
  try {
    let id = localStorage.getItem('fnf_cart_id');
    if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
      id = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/[^A-Za-z0-9_-]/g, '');
      id = id.padEnd(16, 'x');
      localStorage.setItem('fnf_cart_id', id);
    }
    return id;
  } catch {
    memoryId ||= 'mem' + Math.random().toString(36).slice(2).padEnd(20, 'x');
    return memoryId;
  }
}

export async function api(method, path, body, signal) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    signal,
    headers: { 'Content-Type': 'application/json', 'X-Cart-Id': getCartId() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
