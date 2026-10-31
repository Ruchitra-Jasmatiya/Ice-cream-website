<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=240&color=F8BBD0&text=FreshnFreeze&fontColor=FFFFFF&fontSize=55&animation=fadeIn&fontAlignY=40"/>

# 🍨 FreshnFreeze

### A full-stack ice cream store — animated React storefront, live cart & checkout, and a powerful admin panel

<p align="center">
  <a href="https://freshnfreeze.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Demo-EC4899?style=for-the-badge&logo=vercel&logoColor=white"/>
  </a>
  <a href="https://freshnfreeze.vercel.app/admin">
    <img src="https://img.shields.io/badge/Admin_Panel-F06292?style=for-the-badge&logo=shieldsdotio&logoColor=white"/>
  </a>
  <img src="https://img.shields.io/badge/React_19-FFB6C1?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite_7-F8BBD0?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Upstash_Redis-E91E63?style=for-the-badge&logo=redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
</p>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=500&size=22&pause=1000&color=EC4899&center=true&vCenter=true&width=700&lines=Premium+Ice+Cream+Storefront;Live+Cart+%26+Cash+on+Delivery+Checkout;Admin+Panel+with+Real-Time+Updates;Coupons%2C+Stock+%26+Order+Tracking"/>

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#-getting-started-local)
- [Admin Panel & Passwords](#-admin-panel--passwords)
- [Deploying to Vercel](#-deploying-to-vercel)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🍧 About the Project

**FreshnFreeze** is a complete ice cream shop, not just a landing page. Customers browse an animated storefront, add flavours to a cart, apply coupons and place cash-on-delivery orders. The owner manages everything — flavours, prices, stock, photos, categories, coupons and orders — from a built-in **admin panel**, and every change appears on the website within seconds, without redeploying.

> 🌐 **Live site:** https://freshnfreeze.vercel.app
> 🔐 **Admin panel:** https://freshnfreeze.vercel.app/admin

---

## ✨ Features

### 🛍️ Storefront (customers)

| Feature | Details |
|---|---|
| 🍦 Product catalogue | Products and categories load live from the backend |
| 🗂️ Shop by classification | Browse by category, filter by price and veg, sort by best-selling / price |
| 🌿 Ingredients | One-tap ingredient list on every flavour |
| 🛒 Cart | Server-side cart that survives refreshes and works across tabs, with a slide-in cart drawer and live item count |
| 🎟️ Coupons | Apply discount codes at checkout (percentage or flat, with caps and minimum order) |
| 📦 Checkout | Cash on delivery with name, phone and address validation |
| 🔎 Order tracking | Track an order with order number + phone |
| 🚫 Stock handling | Out-of-stock items are disabled; quantities are clamped to available stock |
| 📢 Announcement bar | A banner controlled from the admin panel |
| 🎬 Rich animation | Framer Motion, GSAP and WebGL (OGL) effects, fully responsive |

### 🛠️ Admin panel (owner)

| Section | What you can do |
|---|---|
| 📊 Dashboard | Sales and order stats for the last 7 days |
| 🧾 Orders | Live alert + sound on new orders, move orders through *Pending → Confirmed → Preparing → Out for delivery → Delivered*, print slip, WhatsApp the customer, cancel (stock is restored automatically) |
| 🍨 Ice creams | Add / edit / duplicate / delete, price & MRP (auto discount %), stock, two images (upload or URL), ingredients, veg flag, featured, show/hide |
| 🗂️ Categories | Add / edit / delete with images |
| 🎟️ Coupons | Create percentage or flat coupons, limits and minimum order |
| ⚙️ Settings | Announcement bar, delivery fee, free-delivery limit, open/closed switch, change password |
| 💾 Backup | Download a full JSON backup and restore it any time |

### 🔒 Security

- Signed, `HttpOnly`, `SameSite=Strict` session cookie (12-hour sessions)
- Passwords compared with constant-time checks; changed passwords are stored with `scrypt` hashes
- CSRF header required for every admin write
- Rate limiting on login (8 tries / 15 min), orders and order tracking
- Input validation and sanitising on every write; unsafe image URLs (e.g. `javascript:`) are rejected

---

## 🧰 Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,bootstrap,js,nodejs,redis,vercel,html,css,git,github,vscode" />
</p>

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite 7 | Component-based UI, fast dev & build |
| | React Router 7 | Client-side routing |
| | Tailwind CSS 4, Bootstrap 5, React-Bootstrap | Styling & layout |
| | Framer Motion, Motion, GSAP | Animations |
| | OGL | WebGL plasma background |
| | Lucide React | Icons |
| **Backend** | Node.js (Vercel Serverless Function) | One function serves every `/api/*` route |
| | Custom router (`server/app.js`) | REST API, auth, validation |
| **Database** | Upstash Redis (REST) | Products, orders, carts, coupons, images |
| | Local JSON file (`data/db.json`) | Zero-setup database for local development |
| **Admin** | Vanilla JS single-page app (`public/admin`) | Lightweight, fast admin dashboard |
| **Hosting** | Vercel | Static site + serverless API |

---

## 🏗️ Architecture

```text
 Browser (React storefront)           Browser (/admin panel)
        │                                      │
        └──────────────┬───────────────────────┘
                       │  fetch('/api/...')
                       ▼
        vercel.json rewrite:  /api/*  →  /api
                       │
                       ▼
            api/index.js  (single serverless function)
                       │
                       ▼
              server/app.js  →  routes, auth, validation
                       │
                       ▼
        server/store.js  →  Upstash Redis (production)
                            data/db.json   (local dev)
```

**Live updates:** every admin change bumps a version number. Storefronts poll a tiny `/api/version` endpoint (every 4 s while active) and refetch the catalogue only when it changes. In the same browser the update is instant through `BroadcastChannel`.

---

## 📁 Project Structure

```text
Ice-cream-website/
├── api/
│   └── index.js            # Vercel serverless entry (runs server/app.js)
├── server/
│   ├── app.js              # All API routes (public, cart, orders, admin)
│   ├── auth.js             # Password check, signed session cookie
│   ├── store.js            # Redis adapter + local JSON fallback
│   ├── shop.js             # Pricing, coupons, orders, stock, stats
│   ├── seed.js             # Sample flavours & categories (first run)
│   └── dev.js              # Local API server (port 3001)
├── public/
│   ├── admin/index.html    # Admin panel (served at /admin)
│   ├── seed-images/        # Images for the sample data
│   └── shop/               # Shop images
├── src/
│   ├── components/         # Pages & UI (home, shop, navbar, cart drawer, …)
│   ├── context/            # StoreContext — catalogue + cart state
│   ├── lib/api.js          # Small API client
│   ├── App.jsx             # Routes + providers
│   └── main.jsx
├── scripts/
│   ├── dev-all.mjs         # Starts API + website together
│   └── test-api.mjs        # End-to-end API test suite
├── vercel.json             # Routing: /api/* and /admin
├── .env.example            # Environment variable template
└── package.json
```

---

## 🚀 Getting Started (Local)

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer
- npm

### Run it

```bash
# 1. Clone
git clone https://github.com/Ruchitra-Jasmatiya/Ice-cream-website.git
cd Ice-cream-website

# 2. Install
npm install

# 3. Start backend + website together
npm run dev:all
```

Then open:

| URL | What |
|---|---|
| http://localhost:5173 | Storefront |
| http://localhost:5173/admin | Admin panel |
| http://localhost:3001/api/health | Backend health check |

> ⚠️ Use **`npm run dev:all`**, not `npm run dev`. Plain `npm run dev` starts only the website, so every `/api/...` call fails with `ECONNREFUSED`.

The first run creates `data/db.json` and loads the sample flavours and categories. This file is for local testing only and is not part of the repo.

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev:all` | Backend (port 3001) + website (port 5173) |
| `npm run dev` | Website only |
| `npm run api` | Backend only |
| `npm run build` | Production build |
| `npm run test:api` | Run the API test suite |
| `npm run lint` | ESLint |

---

## 🔐 Admin Panel & Passwords

Open **`/admin`** and sign in.

| Environment | URL | Password |
|---|---|---|
| 💻 **Local development** | http://localhost:5173/admin | **`admin123`** (default, local only) |
| 🌐 **Live (Vercel)** | https://freshnfreeze.vercel.app/admin | The value of the `ADMIN_PASSWORD` environment variable set in Vercel |

**How the password is chosen**

1. If you changed the password inside **Settings → Change password**, that new password is used.
2. Otherwise the `ADMIN_PASSWORD` environment variable is used.
3. When running locally (not on Vercel) with nothing set, it falls back to `admin123`.

**Forgot the password on the live site?** Add `ADMIN_FORCE_ENV_PASSWORD=true` in Vercel → redeploy → sign in with `ADMIN_PASSWORD` → remove the variable.

> 🔒 **Security note:** the live admin password is intentionally kept in Vercel environment variables rather than in this public repository. Anyone can read a README, and the admin panel exposes customer names, phone numbers and addresses. Use a strong password in production.

---

## ☁️ Deploying to Vercel

### 1. Import the project
Push the repo to GitHub → [vercel.com](https://vercel.com) → **Add New → Project** → import it. Vercel detects Vite automatically.

### 2. Connect a database
Project → **Storage / Marketplace → Upstash for Redis → Create** (the **Free** plan is enough, pick the **Mumbai** region) → **Connect to project**.
Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.

### 3. Set environment variables
Project → **Settings → Environment Variables** (see the table below), enabled for **Production**.

### 4. Redeploy
**Deployments → ⋯ → Redeploy.** Environment variables only apply to new deployments.

### 5. Verify
- `https://YOUR-SITE.vercel.app/api/health` should return `"storage":"redis"`
- Open `/admin` and sign in

> `"storage":"memory"` means Redis is not connected — data would be lost on every restart.

---

## 🔧 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | ✅ | Login password for `/admin` |
| `ADMIN_SECRET` | ✅ | Long random text used to sign the admin session cookie |
| `KV_REST_API_URL` / `UPSTASH_REDIS_REST_URL` | ✅ | Added automatically when you connect Upstash Redis |
| `KV_REST_API_TOKEN` / `UPSTASH_REDIS_REST_TOKEN` | ✅ | Added automatically when you connect Upstash Redis |
| `ADMIN_FORCE_ENV_PASSWORD` | ➖ | `true` = always use `ADMIN_PASSWORD`, ignoring a password changed in the panel |
| `ALLOWED_ORIGINS` | ➖ | Only if another website needs to call this API |
| `VITE_API_BASE` | ➖ | Only if the API is hosted on a different domain |

A template is available in [`.env.example`](.env.example).

---

## 📡 API Reference

All routes live under `/api`.

### Public

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health + storage mode |
| GET | `/version` | Catalogue version (used for live updates) |
| GET | `/catalog` | Products, categories and settings in one call (ETag cached) |
| GET | `/products` | List with `category`, `q`, `veg`, `min`, `max`, `sort`, `page`, `limit` |
| GET | `/products/:id` | Single product |
| GET | `/categories` | Categories |

### Cart (header `X-Cart-Id`)

| Method | Route | Description |
|---|---|---|
| GET | `/cart` | Current cart with totals |
| POST | `/cart/items` | Add `{ productId, qty }` |
| PATCH / DELETE | `/cart/items/:id` | Change quantity / remove |
| POST / DELETE | `/cart/coupon` | Apply / remove a coupon |
| DELETE | `/cart` | Empty the cart |

### Orders

| Method | Route | Description |
|---|---|---|
| POST | `/orders` | Place an order (cash on delivery) |
| GET | `/orders/track?number=&phone=` | Track an order |

### Admin (cookie login + `X-Requested-With: fnf-admin`)

`/admin/login` · `/admin/logout` · `/admin/session` · `/admin/stats` · `/admin/products` · `/admin/categories` · `/admin/orders` · `/admin/coupons` · `/admin/settings` · `/admin/upload` · `/admin/export` · `/admin/import` · `/admin/password` · `/admin/reset`

---

## 🧪 Testing

An end-to-end suite covers the catalogue, cart, coupons, orders, stock, admin auth, CSRF, validation and live updates.

```bash
npm run dev:all        # in one terminal
npm run test:api       # in another terminal
```

Expected result: **56/56 passed**.

---

## 🩺 Troubleshooting

| Problem | Cause & fix |
|---|---|
| `ECONNREFUSED` in the terminal | Backend isn't running. Use `npm run dev:all` |
| `/admin` login → 404 (live) | `/api/*` routing missing. Make sure `api/index.js` exists, `vercel.json` has the `/api/(.*)` rewrite, and there is no `api/[...path].js` |
| "Admin password is not configured" | Add `ADMIN_PASSWORD` in Vercel (Production) and redeploy |
| "Wrong password" | Check for extra spaces; locally try `admin123`; on live use the Vercel value. Use `ADMIN_FORCE_ENV_PASSWORD=true` if you changed it in the panel |
| `/api/health` shows `"storage":"memory"` | Redis not connected. Add Upstash Redis in Vercel and redeploy |
| Admin changes don't appear on the shop | Hard refresh with `Ctrl + Shift + R`; confirm `/api/catalog` loads |
| "Too many attempts" | Rate limit. Wait 15 minutes |

---

## 🗺️ Roadmap

- [ ] Online payments (Razorpay / UPI) on `POST /orders`
- [ ] Customer accounts & order history
- [ ] Email / WhatsApp order notifications
- [ ] Product reviews and ratings
- [ ] Multiple admin users with roles

---

## 👩‍💻 Author

**Ruchitra Jasmatiya**

[![GitHub](https://img.shields.io/badge/GitHub-Ruchitra--Jasmatiya-181717?style=for-the-badge&logo=github)](https://github.com/Ruchitra-Jasmatiya)

---

<div align="center">

### 🍨 If you like this project, please give it a ⭐

Made with 💖 and a lot of ice cream.

<img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=F8BBD0&section=footer"/>

</div>
