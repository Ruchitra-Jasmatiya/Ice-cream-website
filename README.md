<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=260&color=0:F8BBD0,50:F48FB1,100:EC4899&text=FreshnFreeze&fontColor=FFFFFF&fontSize=62&fontAlignY=38&desc=Scoop%20Happiness%20%E2%80%A2%20Full-Stack%20Ice%20Cream%20Store&descSize=18&descAlignY=60&animation=fadeIn"/>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&pause=1200&color=EC4899&center=true&vCenter=true&width=720&height=50&lines=Premium+Ice+Cream+Storefront+%F0%9F%8D%A8;Live+Cart+%26+Cash+on+Delivery+Checkout+%F0%9F%9B%92;Admin+Panel+with+Real-Time+Updates+%E2%9A%A1;Coupons%2C+Stock+%26+Order+Tracking+%F0%9F%8E%9F%EF%B8%8F"/>

<br/>

<a href="https://freshnfreeze.vercel.app/"><img src="https://img.shields.io/badge/%F0%9F%8C%90%20Live%20Demo-EC4899?style=for-the-badge&labelColor=F8BBD0"/></a>
<a href="https://freshnfreeze.vercel.app/admin"><img src="https://img.shields.io/badge/%F0%9F%94%90%20Admin%20Panel-F06292?style=for-the-badge&labelColor=F8BBD0"/></a>
<a href="https://github.com/Ruchitra-Jasmatiya/Ice-cream-website"><img src="https://img.shields.io/badge/%E2%AD%90%20Star%20this%20repo-C2185B?style=for-the-badge&labelColor=F8BBD0"/></a>

<br/><br/>

<img src="https://img.shields.io/badge/React-19-EC4899?style=flat-square&logo=react&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-7-F06292?style=flat-square&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-%E2%89%A5%2018-F48FB1?style=flat-square&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Upstash-Redis-E91E63?style=flat-square&logo=redis&logoColor=white"/>
<img src="https://img.shields.io/badge/Deployed%20on-Vercel-111111?style=flat-square&logo=vercel&logoColor=white"/>
<img src="https://img.shields.io/badge/API%20tests-56%2F56%20passing-22C55E?style=flat-square"/>

<br/><br/>

**[About](#-about-the-project)** &nbsp;•&nbsp;
**[Features](#-features)** &nbsp;•&nbsp;
**[Tech Stack](#-tech-stack)** &nbsp;•&nbsp;
**[Architecture](#-architecture)** &nbsp;•&nbsp;
**[Get Started](#-getting-started-local)** &nbsp;•&nbsp;
**[Admin](#-admin-panel--passwords)** &nbsp;•&nbsp;
**[Deploy](#-deploying-to-vercel)** &nbsp;•&nbsp;
**[API](#-api-reference)**

</div>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 📖 Table of Contents

<table>
<tr>
<td>

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)

</td>
<td>

- [Getting Started (Local)](#-getting-started-local)
- [Admin Panel & Passwords](#-admin-panel--passwords)
- [Deploying to Vercel](#-deploying-to-vercel)
- [Environment Variables](#-environment-variables)

</td>
<td>

- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Author](#-author)

</td>
</tr>
</table>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 🍧 About the Project

**FreshnFreeze** is a complete ice cream shop, not just a landing page. Customers browse an animated storefront, add flavours to a cart, apply coupons and place cash-on-delivery orders. The owner manages everything — flavours, prices, stock, photos, categories, coupons and orders — from a built-in **admin panel**, and every change appears on the website within seconds, without redeploying.

<table>
<tr>
<td align="center" width="50%">

### 🌐 Live Site
**[freshnfreeze.vercel.app](https://freshnfreeze.vercel.app)**

</td>
<td align="center" width="50%">

### 🔐 Admin Panel
**[freshnfreeze.vercel.app/admin](https://freshnfreeze.vercel.app/admin)**

</td>
</tr>
</table>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## ✨ Features

### 🛍️ Storefront (customers)

| Feature | Details |
|:---|:---|
| 🍦 **Product catalogue** | Products and categories load live from the backend |
| 🗂️ **Shop by classification** | Browse by category, filter by price and veg, sort by best-selling / price |
| 🌿 **Ingredients** | One-tap ingredient list on every flavour |
| 🛒 **Cart** | Server-side cart that survives refreshes and works across tabs, with a slide-in cart drawer and live item count |
| 🎟️ **Coupons** | Apply discount codes at checkout (percentage or flat, with caps and minimum order) |
| 📦 **Checkout** | Cash on delivery with name, phone and address validation |
| 🔎 **Order tracking** | Track an order with order number + phone |
| 🚫 **Stock handling** | Out-of-stock items are disabled; quantities are clamped to available stock |
| 📢 **Announcement bar** | A banner controlled from the admin panel |
| 🎬 **Rich animation** | Framer Motion, GSAP and WebGL (OGL) effects, fully responsive |

### 🛠️ Admin panel (owner)

| Section | What you can do |
|:---|:---|
| 📊 **Dashboard** | Sales and order stats for the last 7 days |
| 🧾 **Orders** | Live alert + sound on new orders, move orders through *Pending → Confirmed → Preparing → Out for delivery → Delivered*, print slip, WhatsApp the customer, cancel (stock is restored automatically) |
| 🍨 **Ice creams** | Add / edit / duplicate / delete, price & MRP (auto discount %), stock, two images (upload or URL), ingredients, veg flag, featured, show/hide |
| 🗂️ **Categories** | Add / edit / delete with images |
| 🎟️ **Coupons** | Create percentage or flat coupons, limits and minimum order |
| ⚙️ **Settings** | Announcement bar, delivery fee, free-delivery limit, open/closed switch, change password |
| 💾 **Backup** | Download a full JSON backup and restore it any time |

### 🔒 Security

<table>
<tr>
<td>🍪 Signed, <code>HttpOnly</code>, <code>SameSite=Strict</code> session cookie (12-hour sessions)</td>
<td>🔑 Constant-time password checks; changed passwords stored as <code>scrypt</code> hashes</td>
</tr>
<tr>
<td>🛡️ CSRF header required for every admin write</td>
<td>⏱️ Rate limiting on login (8 tries / 15 min), orders and order tracking</td>
</tr>
<tr>
<td colspan="2">🧼 Input validation and sanitising on every write; unsafe image URLs (e.g. <code>javascript:</code>) are rejected</td>
</tr>
</table>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 🧰 Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,bootstrap,js,nodejs,redis,vercel,html,css,git,github,vscode&theme=light" />
</p>

| Layer | Technology | Purpose |
|:---|:---|:---|
| 🎨 **Frontend** | React 19, Vite 7 | Component-based UI, fast dev & build |
| | React Router 7 | Client-side routing |
| | Tailwind CSS 4, Bootstrap 5, React-Bootstrap | Styling & layout |
| | Framer Motion, Motion, GSAP | Animations |
| | OGL | WebGL plasma background |
| | Lucide React | Icons |
| ⚙️ **Backend** | Node.js (Vercel Serverless Function) | One function serves every `/api/*` route |
| | Custom router (`server/app.js`) | REST API, auth, validation |
| 🗄️ **Database** | Upstash Redis (REST) | Products, orders, carts, coupons, images |
| | Local JSON file (`data/db.json`) | Zero-setup database for local development |
| 🧑‍💼 **Admin** | Vanilla JS single-page app (`public/admin`) | Lightweight, fast admin dashboard |
| ☁️ **Hosting** | Vercel | Static site + serverless API |

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

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

> [!TIP]
> **Live updates:** every admin change bumps a version number. Storefronts poll a tiny `/api/version` endpoint (every 4 s while active) and refetch the catalogue only when it changes. In the same browser the update is instant through `BroadcastChannel`.

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

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

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

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
|:---|:---|
| http://localhost:5173 | 🍨 Storefront |
| http://localhost:5173/admin | 🔐 Admin panel |
| http://localhost:3001/api/health | 💚 Backend health check |

> [!IMPORTANT]
> Use **`npm run dev:all`**, not `npm run dev`. Plain `npm run dev` starts only the website, so every `/api/...` call fails with `ECONNREFUSED`.

The first run creates `data/db.json` and loads the sample flavours and categories. This file is for local testing only and is not part of the repo.

<details>
<summary><b>🧾 Useful scripts</b></summary>

<br/>

| Command | What it does |
|:---|:---|
| `npm run dev:all` | Backend (port 3001) + website (port 5173) |
| `npm run dev` | Website only |
| `npm run api` | Backend only |
| `npm run build` | Production build |
| `npm run test:api` | Run the API test suite |
| `npm run lint` | ESLint |

</details>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 🔐 Admin Panel & Passwords

Open **`/admin`** and sign in.

| Environment | URL | Password |
|:---|:---|:---|
| 💻 **Local development** | http://localhost:5173/admin | **`admin123`** (default, local only) |
| 🌐 **Live (Vercel)** | https://freshnfreeze.vercel.app/admin | The value of the `ADMIN_PASSWORD` environment variable set in Vercel |

**How the password is chosen**

1. If you changed the password inside **Settings → Change password**, that new password is used.
2. Otherwise the `ADMIN_PASSWORD` environment variable is used.
3. When running locally (not on Vercel) with nothing set, it falls back to `admin123`.

> [!TIP]
> **Forgot the password on the live site?** Add `ADMIN_FORCE_ENV_PASSWORD=true` in Vercel → redeploy → sign in with `ADMIN_PASSWORD` → remove the variable.

> [!WARNING]
> **Security note:** the live admin password is intentionally kept in Vercel environment variables rather than in this public repository. Anyone can read a README, and the admin panel exposes customer names, phone numbers and addresses. Use a strong password in production.

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## ☁️ Deploying to Vercel

**1️⃣ Import the project**
Push the repo to GitHub → [vercel.com](https://vercel.com) → **Add New → Project** → import it. Vercel detects Vite automatically.

**2️⃣ Connect a database**
Project → **Storage / Marketplace → Upstash for Redis → Create** (the **Free** plan is enough, pick the **Mumbai** region) → **Connect to project**.
Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.

**3️⃣ Set environment variables**
Project → **Settings → Environment Variables** (see the table below), enabled for **Production**.

**4️⃣ Redeploy**
**Deployments → ⋯ → Redeploy.** Environment variables only apply to new deployments.

**5️⃣ Verify**
- `https://YOUR-SITE.vercel.app/api/health` should return `"storage":"redis"`
- Open `/admin` and sign in

> [!NOTE]
> `"storage":"memory"` means Redis is not connected — data would be lost on every restart.

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 🔧 Environment Variables

| Variable | Required | Description |
|:---|:---:|:---|
| `ADMIN_PASSWORD` | ✅ | Login password for `/admin` |
| `ADMIN_SECRET` | ✅ | Long random text used to sign the admin session cookie |
| `KV_REST_API_URL` / `UPSTASH_REDIS_REST_URL` | ✅ | Added automatically when you connect Upstash Redis |
| `KV_REST_API_TOKEN` / `UPSTASH_REDIS_REST_TOKEN` | ✅ | Added automatically when you connect Upstash Redis |
| `ADMIN_FORCE_ENV_PASSWORD` | ➖ | `true` = always use `ADMIN_PASSWORD`, ignoring a password changed in the panel |
| `ALLOWED_ORIGINS` | ➖ | Only if another website needs to call this API |
| `VITE_API_BASE` | ➖ | Only if the API is hosted on a different domain |

A template is available in [`.env.example`](.env.example).

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 📡 API Reference

All routes live under `/api`.

<details open>
<summary><b>🌍 Public</b></summary>

<br/>

| Method | Route | Description |
|:---:|:---|:---|
| `GET` | `/health` | Health + storage mode |
| `GET` | `/version` | Catalogue version (used for live updates) |
| `GET` | `/catalog` | Products, categories and settings in one call (ETag cached) |
| `GET` | `/products` | List with `category`, `q`, `veg`, `min`, `max`, `sort`, `page`, `limit` |
| `GET` | `/products/:id` | Single product |
| `GET` | `/categories` | Categories |

</details>

<details>
<summary><b>🛒 Cart</b> (header <code>X-Cart-Id</code>)</summary>

<br/>

| Method | Route | Description |
|:---:|:---|:---|
| `GET` | `/cart` | Current cart with totals |
| `POST` | `/cart/items` | Add `{ productId, qty }` |
| `PATCH` / `DELETE` | `/cart/items/:id` | Change quantity / remove |
| `POST` / `DELETE` | `/cart/coupon` | Apply / remove a coupon |
| `DELETE` | `/cart` | Empty the cart |

</details>

<details>
<summary><b>📦 Orders</b></summary>

<br/>

| Method | Route | Description |
|:---:|:---|:---|
| `POST` | `/orders` | Place an order (cash on delivery) |
| `GET` | `/orders/track?number=&phone=` | Track an order |

</details>

<details>
<summary><b>🔐 Admin</b> (cookie login + <code>X-Requested-With: fnf-admin</code>)</summary>

<br/>

`/admin/login` · `/admin/logout` · `/admin/session` · `/admin/stats` · `/admin/products` · `/admin/categories` · `/admin/orders` · `/admin/coupons` · `/admin/settings` · `/admin/upload` · `/admin/export` · `/admin/import` · `/admin/password` · `/admin/reset`

</details>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 🧪 Testing

An end-to-end suite covers the catalogue, cart, coupons, orders, stock, admin auth, CSRF, validation and live updates.

```bash
npm run dev:all        # in one terminal
npm run test:api       # in another terminal
```

Expected result: **56/56 passed** ✅

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 🩺 Troubleshooting

<details>
<summary><b>Click to see common problems and fixes</b></summary>

<br/>

| Problem | Cause & fix |
|:---|:---|
| `ECONNREFUSED` in the terminal | Backend isn't running. Use `npm run dev:all` |
| `/admin` login → 404 (live) | `/api/*` routing missing. Make sure `api/index.js` exists, `vercel.json` has the `/api/(.*)` rewrite, and there is no `api/[...path].js` |
| "Admin password is not configured" | Add `ADMIN_PASSWORD` in Vercel (Production) and redeploy |
| "Wrong password" | Check for extra spaces; locally try `admin123`; on live use the Vercel value. Use `ADMIN_FORCE_ENV_PASSWORD=true` if you changed it in the panel |
| `/api/health` shows `"storage":"memory"` | Redis not connected. Add Upstash Redis in Vercel and redeploy |
| Admin changes don't appear on the shop | Hard refresh with `Ctrl + Shift + R`; confirm `/api/catalog` loads |
| "Too many attempts" | Rate limit. Wait 15 minutes |

</details>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 🗺️ Roadmap

- [ ] 💳 Online payments (Razorpay / UPI) on `POST /orders`
- [ ] 👤 Customer accounts & order history
- [ ] 📲 Email / WhatsApp order notifications
- [ ] ⭐ Product reviews and ratings
- [ ] 🧑‍🤝‍🧑 Multiple admin users with roles

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:F8BBD0,100:EC4899"/>

## 👩‍💻 Author

<div align="center">

### **Ruchitra Jasmatiya**

<a href="https://github.com/Ruchitra-Jasmatiya"><img src="https://img.shields.io/badge/GitHub-Ruchitra--Jasmatiya-EC4899?style=for-the-badge&logo=github&logoColor=white&labelColor=F8BBD0"/></a>

<br/>

### 🍨 If you like this project, please give it a ⭐

*Made with 💖 and a lot of ice cream.*

<img src="https://capsule-render.vercel.app/api?type=waving&height=130&color=0:F8BBD0,50:F48FB1,100:EC4899&section=footer"/>

</div>
