# FreshnFreeze backend (Vercel) — setup in 5 minutes

Unzip **over your project folder** (it adds `api/`, `server/`, `public/admin/`, `src/context`, `src/lib`, etc. and replaces
`src/App.jsx`, `src/components/shop.jsx`, `src/components/navbar.jsx`, `vite.config.js`, `package.json`). No new npm packages are needed.

## 1. Push to GitHub
`git add . && git commit -m "Add backend + admin" && git push` — Vercel redeploys automatically.

## 2. Connect the database (needed so data is saved)
Vercel dashboard → your project → **Storage / Marketplace → Upstash Redis → Create** (free plan, pick region **Mumbai / ap-south-1**)
→ connect it to this project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.

## 3. Set the admin password
Project → **Settings → Environment Variables** → add
- `ADMIN_PASSWORD` = your password
- `ADMIN_SECRET`   = any long random text

Then **Deployments → Redeploy**. Open **https://YOUR-SITE.vercel.app/admin** and log in.

## What you get
| Where | What |
|---|---|
| `/admin` | Dashboard, Orders (live alert + sound on new order), Ice creams CRUD (price, MRP/discount, stock, images upload/URL, ingredients, veg, featured, show/hide), Categories CRUD, Coupons, Settings (announcement bar, delivery fee, free-delivery limit, open/closed switch, change password), Backup/restore |
| Website | Products/categories load from the backend; **Add to Cart**, cart drawer, coupons, checkout (cash on delivery), order tracking, out-of-stock handling, announcement bar |
| Live updates | Admin edits show on the website instantly in the same browser and within ~4 seconds for other visitors (no refresh) |

First load seeds your original 8 ice creams + 10 categories (images in `public/seed-images`). Change anything in `/admin`.

## API (all under `/api`)
Public: `GET /catalog` `GET /products?category=&q=&veg=1&min=&max=&sort=` `GET /products/:id` `GET /categories` `GET /version`
Cart (header `X-Cart-Id`): `GET /cart` `POST /cart/items` `PATCH|DELETE /cart/items/:id` `POST|DELETE /cart/coupon` `DELETE /cart`
Orders: `POST /orders` `GET /orders/track?number=&phone=`
Admin (cookie login): `/admin/login|logout|session|stats|products|categories|orders|coupons|settings|upload|export|import`

## Local development
`npm install` → `npm run dev:all` (API on :3001 + site; data in `data/db.json`; admin password defaults to `admin123` locally only)
→ open http://localhost:5173 and http://localhost:5173/admin. Run `npm run test:api` for the API tests.

## Notes
- Forgot the password after changing it in the panel? Add env `ADMIN_FORCE_ENV_PASSWORD=true`, redeploy, log in with `ADMIN_PASSWORD`.
- Uploaded images are compressed in the browser (≤ ~450 KB) and stored in Redis. For many large photos, paste image links instead.
- Seed categories "Mittie-k-mehak", "Rasmalai Royals", "Paan-e-freeze" have no ice creams yet — add some in `/admin`.
- Payment is cash on delivery; online payment (Razorpay) can be added later on `POST /orders`.
