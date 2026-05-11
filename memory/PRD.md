# Tuncel Textile — Product Requirements Document

## Original Problem Statement
"We're opening a new textile shop called Tuncel Textile. There are two of us; please create a modern website for us. It should have a menu option and the ability to navigate between pages. We're thinking of a print-based design, with separate options for hoodies and T-shirts for men and women." (Reference: Beymen.com)

## User Choices
- Language: English only
- Scope: Cart + product management AND full e-commerce (Stripe)
- Style: Bold artistic print + minimalist black/white with big typography
- Pages: Home, Men, Women, Accessories, About
- Studio location: **Riga**
- Admin: password-protected at `/admin` (password: `tuncel2026admin`)
- Auth: optional Google sign-in for customers (guest checkout still allowed)

## Architecture
- **Backend**: FastAPI, MongoDB, Stripe (emergentintegrations), Emergent Object Storage, Emergent Google Auth
- **Frontend**: React (CRA + craco), TailwindCSS, shadcn/ui, react-router-dom 7, axios `withCredentials`
- **Cart**: Client-side (localStorage) via React Context
- **Auth**: httpOnly cookie session_token (7 days); optional — guest checkout still works
- **Fonts**: Bebas Neue (display) + Manrope (body)

## What's Implemented

### Iteration 1 (2026-02-06) — MVP
- 11 seeded products (men/women × hoodies/tshirts + 3 accessories)
- Public API: `GET /api/products`, `GET /api/products/{id}`, `POST /api/checkout/session`, `GET /api/checkout/status/{id}` (graceful Stripe fallback), `POST /api/webhook/stripe`
- Pages: Home, Shop with type filters, Product Detail, Cart, Checkout Success, About
- Sticky Navbar (with mobile sheet) + animated marquee Footer
- Stripe Checkout with payment_transactions collection

### Iteration 2 (2026-02-07) — Admin + Auth + Enriched UI
- **Studio location** changed Istanbul → Riga (Footer + About)
- **Admin panel** at `/admin`:
  - Password login (`tuncel2026admin`)
  - Product CRUD (create/edit/delete) via drawer form
  - **Image upload** to Emergent object storage (returns `/api/files/{path}` relative URL)
  - File serving via `GET /api/files/{path}`
- **Customer auth** (Emergent Google Auth):
  - "Sign In" button in Navbar
  - `/auth/callback` route handles `#session_id=` exchange
  - `POST /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`
  - `GET /api/orders` returns paid orders linked to user_id
  - `/account` page with order history + sign-out
- **Enriched Home**: Lookbook horizontal-scroll strip, 3-step Process section, Newsletter CTA
- **Enriched Shop**: sort dropdown (newest / price ↑ / price ↓) + price range filter
- **Enriched Product Detail**: 4-thumbnail gallery, quantity selector, accordion (size guide / materials / shipping), "You may also like" related products

## Test Results
- **Iteration 1**: 12/13 backend (status endpoint hardened) + 100% frontend
- **Iteration 2**: 29/29 backend + 95% frontend (one bug found in admin upload returning internal URL — **FIXED** post-test by returning relative URL)

## Backlog (deferred)
- P1: Order confirmation email via Resend (no API key provided yet — ask user for `re_...` key)
- P2: Wishlist / favorites
- P2: Search bar with autocomplete
- P2: Inventory tracking by size/variant
- P2: Discount codes / promo system
- P2: Real product photography (admin uploads now functional — pending studio photoshoot)
- P2: Shipping address & rates
- P2: Product reviews & ratings
