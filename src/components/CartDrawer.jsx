import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Tag, PackageCheck, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { api, money } from '../lib/api.js';
import './cart.css';

const STATUS = { pending: 'Order placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

/** Slim bar at the very top. Text comes from  /admin → Settings → Announcement. */
export function AnnouncementBar() {
  const { settings, offline } = useStore();
  const text = offline ? '' : settings?.announcement;
  if (!text) return null;
  return <div className="fnf-announce">{text}</div>;
}

export function Toaster() {
  const { toast } = useStore();
  if (!toast) return null;
  return <div key={toast.id} className={`fnf-toast ${toast.kind}`} role="status">{toast.message}</div>;
}

function Tracker({ initial }) {
  const [number, setNumber] = useState(initial?.number || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const look = async (e) => {
    e?.preventDefault(); setErr(''); setBusy(true);
    try { setOrder((await api('GET', `/orders/track?number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`)).order); }
    catch (x) { setOrder(null); setErr(x.message); }
    setBusy(false);
  };
  useEffect(() => { if (initial?.number && initial?.phone) look(); /* eslint-disable-next-line */ }, []);
  return (
    <div className="fnf-pane">
      <form onSubmit={look} className="fnf-form">
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Order number (e.g. FNF-1001)" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone used for the order" inputMode="tel" required />
        <button className="fnf-btn" disabled={busy}><Search size={16} /> {busy ? 'Checking…' : 'Track order'}</button>
        {err && <p className="fnf-err">{err}</p>}
      </form>
      {order && (
        <div className="fnf-track">
          <h4>{order.number} · {money(order.total)}</h4>
          {order.status === 'cancelled' ? <p className="fnf-err">This order was cancelled.</p> : (
            <ol>{STEPS.map((s, i) => <li key={s} className={STEPS.indexOf(order.status) >= i ? 'done' : ''}>{STATUS[s]}</li>)}</ol>
          )}
          <ul className="fnf-mini">{order.items.map((i) => <li key={i.productId}>{i.qty} × {i.name}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, setQty, removeItem, applyCoupon, removeCoupon, placeOrder, notify, offline } = useStore();
  const [tab, setTab] = useState('cart'); // cart | checkout | done | track
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const saved = read('fnf_customer', {});
  const [form, setForm] = useState({ name: saved.name || '', phone: saved.phone || '', email: saved.email || '', address: saved.address || '', city: saved.city || '', pincode: saved.pincode || '', note: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeCart();
    if (cartOpen) { document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey); }
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [cartOpen, closeCart]);
  useEffect(() => { if (cartOpen && tab === 'done') { /* keep */ } }, [cartOpen, tab]);

  const items = cart?.items || [];
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const order = await placeOrder(form);
      write('fnf_customer', { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, pincode: form.pincode });
      write('fnf_last_order', { number: order.number, phone: form.phone });
      setDone(order); setTab('done');
    } catch (err) { notify(err.message, 'err'); }
    setBusy(false);
  };
  const close = () => { closeCart(); setTimeout(() => { if (tab === 'done' || tab === 'checkout') setTab('cart'); }, 250); };

  return (
    <>
      <div className={`fnf-overlay ${cartOpen ? 'open' : ''}`} onClick={close} />
      <aside className={`fnf-drawer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
        <header>
          <h3><ShoppingBag size={20} /> {tab === 'track' ? 'Track order' : tab === 'checkout' ? 'Checkout' : tab === 'done' ? 'Order placed' : 'Your cart'}</h3>
          <button className="fnf-x" onClick={close} aria-label="Close"><X size={20} /></button>
        </header>
        {tab !== 'done' && (
          <nav className="fnf-tabs">
            <button className={tab !== 'track' ? 'on' : ''} onClick={() => setTab('cart')}>Cart {cart?.count ? `(${cart.count})` : ''}</button>
            <button className={tab === 'track' ? 'on' : ''} onClick={() => setTab('track')}>Track order</button>
          </nav>
        )}

        {tab === 'track' && <Tracker initial={read('fnf_last_order', null)} />}

        {tab === 'cart' && (
          <>
            <div className="fnf-pane">
              {offline && <p className="fnf-err">The shop server can’t be reached right now. Please try again in a moment.</p>}
              {items.length === 0 ? (
                <div className="fnf-empty"><span>🍨</span><p>Your cart is empty</p><button className="fnf-btn ghost" onClick={close}>Browse ice creams</button></div>
              ) : items.map((i) => (
                <div className="fnf-item" key={i.productId}>
                  <img src={i.image} alt="" />
                  <div className="fnf-info">
                    <b>{i.name}</b>
                    <span>{money(i.price)}{i.mrp > i.price && <s>{money(i.mrp)}</s>}</span>
                    <div className="fnf-qty">
                      <button onClick={() => setQty(i.productId, i.qty - 1)} aria-label="Less"><Minus size={14} /></button>
                      <em>{i.qty}</em>
                      <button onClick={() => setQty(i.productId, i.qty + 1)} disabled={i.stock !== null && i.qty >= i.stock} aria-label="More"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="fnf-line"><b>{money(i.lineTotal)}</b><button onClick={() => removeItem(i.productId)} aria-label="Remove"><Trash2 size={16} /></button></div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <footer>
                {cart.amountToFreeDelivery > 0 && <p className="fnf-free">Add {money(cart.amountToFreeDelivery)} more for <b>free delivery</b> 🚚</p>}
                {cart.coupon ? (
                  <div className="fnf-coupon ok"><Tag size={15} /> <b>{cart.coupon.code}</b> applied <button onClick={removeCoupon}>Remove</button></div>
                ) : (
                  <form className="fnf-coupon" onSubmit={async (e) => { e.preventDefault(); if (code.trim() && (await applyCoupon(code.trim()))) setCode(''); }}>
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" /><button>Apply</button>
                  </form>
                )}
                {cart.couponError && <p className="fnf-err">{cart.couponError}</p>}
                <div className="fnf-sum"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
                {cart.discount > 0 && <div className="fnf-sum green"><span>Discount</span><span>−{money(cart.discount)}</span></div>}
                <div className="fnf-sum"><span>Delivery</span><span>{cart.delivery ? money(cart.delivery) : 'FREE'}</span></div>
                <div className="fnf-sum total"><span>Total</span><span>{money(cart.total)}</span></div>
                {!cart.acceptingOrders && <p className="fnf-err">We’re closed right now — ordering is paused.</p>}
                {cart.minOrder > cart.subtotal && <p className="fnf-err">Minimum order is {money(cart.minOrder)}</p>}
                <button className="fnf-btn block" disabled={!cart.acceptingOrders || cart.minOrder > cart.subtotal} onClick={() => setTab('checkout')}>Proceed to checkout →</button>
              </footer>
            )}
          </>
        )}

        {tab === 'checkout' && cart && (
          <form className="fnf-pane fnf-form" onSubmit={submit}>
            <input placeholder="Full name *" value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" />
            <input placeholder="Phone *" value={form.phone} onChange={set('phone')} required inputMode="tel" autoComplete="tel" />
            <input placeholder="Email (optional)" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            <textarea placeholder="Delivery address *" value={form.address} onChange={set('address')} required minLength={5} rows={3} autoComplete="street-address" />
            <div className="fnf-two"><input placeholder="City" value={form.city} onChange={set('city')} /><input placeholder="Pincode" value={form.pincode} onChange={set('pincode')} inputMode="numeric" /></div>
            <input placeholder="Note for the kitchen / rider (optional)" value={form.note} onChange={set('note')} />
            <div className="fnf-pay">💵 Cash on delivery</div>
            <div className="fnf-sum total"><span>To pay</span><span>{money(cart.total)}</span></div>
            <button className="fnf-btn block" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
            <button type="button" className="fnf-link" onClick={() => setTab('cart')}>← Back to cart</button>
          </form>
        )}

        {tab === 'done' && done && (
          <div className="fnf-pane fnf-done">
            <PackageCheck size={54} color="#16a34a" />
            <h3>Thank you, {done.customer.name.split(' ')[0]}!</h3>
            <p>Your order <b>{done.number}</b> is placed.<br />Pay <b>{money(done.total)}</b> on delivery.</p>
            <p className="fnf-note">Save this number — use “Track order” anytime.</p>
            <button className="fnf-btn" onClick={() => setTab('track')}>Track my order</button>
            <button className="fnf-btn ghost" onClick={close}>Continue shopping</button>
          </div>
        )}
      </aside>
    </>
  );
}
