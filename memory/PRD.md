# Tuncel Textile — Product Requirements Document

## Original Problem Statement
"We're opening a new textile shop called Tuncel Textile. There are two of us; please create a modern website for us. It should have a menu option and the ability to navigate between pages. We're thinking of a print-based design, with separate options for hoodies and T-shirts for men and women." (Reference: Beymen.com — premium, minimalist, black/white, artistic typography.)

User language: **Turkish** for all agent communication.
Studio location: Riga (2 founders).
Studio gmail: **tunceltextile@gmail.com**

## Architecture
- **Backend**: FastAPI + MongoDB (Motor) — `/app/backend/server.py` (~1500 lines, monolith — split candidate)
- **Frontend**: React (CRA) + TailwindCSS + shadcn/ui — `/app/frontend/src/`
- **Integrations**: Stripe Checkout (Emergent integrations), Emergent Object Storage, Emergent Google Auth
- **Fonts**: Bebas Neue (display) + Manrope (body)
- **Currency**: € (EUR) — global

## What's Implemented

### Iteration 1 — MVP (catalog + Stripe + cart + about)
### Iteration 2 — Admin panel + Google Auth + enriched UI
### Iteration 3 — Premium refresh (logo, atelier language, WhatsApp, Riga studio)
### Iteration 4 (2026-02-13) — Full CMS, i18n (EN/RU/LV), IBAN flow, social bar, cookie banner
### Iteration 5 (2026-02-17) — Phase 1: FAQ + Custom Requests + Legal pages + € currency switch
- `GET /api/faqs`, admin CRUD; multilingual (EN/RU/LV) Q&A; category filter
- `POST /api/custom-requests` (public, no auth); admin list/update with status enum (new/reviewing/quoted/accepted/rejected/completed)
- `/faq`, `/custom-request`, `/legal/:slug` pages
- Admin tabs: **FAQs**, **Custom Requests** added
- 5 seeded FAQs (shipping/returns/custom/payment) auto-load on first start

### Iteration 6 (2026-02-17) — Phase 2: Order Tracking & Fulfillment
- `POST /api/order-lookup` (public, ref + email validation; 404 on mismatch — no info leak)
- `PUT /api/admin/orders/{ref}/fulfillment` — status (pending/processing/shipped/out_for_delivery/delivered/cancelled), carrier, tracking_number, tracking_url, shipping_note; auto-sets shipped_at/delivered_at
- `/track-order` customer page with stage timeline + courier link + cancelled banner
- Admin Orders tab: expandable `FulfillmentEditor` per row
- `/checkout/iban-success` now shows "Track Order →" button

### Iteration 6 (2026-02-17) — Phase 3: Returns / Exchanges
- `POST /api/returns` (public, ref + email validation, type/reason/length validation)
- `GET /api/admin/returns`, `PUT /api/admin/returns/{id}` — status enum (pending/approved/rejected/in_transit/received/refunded/exchanged/cancelled) + admin_notes
- `/return-request` 5-section form (refund vs exchange toggle, reason + description + photos, conditional exchange-size or IBAN)
- Admin **Returns** tab with filter pills + drawer detail view

### Iteration 6 (2026-02-17) — Phase 4: Live Chat
- `POST /api/chat/start`, `POST /api/chat/{sid}/message`, `GET /api/chat/{sid}/messages?since=`
- `GET /api/admin/chat/sessions`, `GET /api/admin/chat/{sid}`, `POST /api/admin/chat/{sid}/reply`, `PUT /api/admin/chat/{sid}/close`
- `<ChatWidget />` FAB on every page (bottom-right), session persisted in localStorage `tuncel_chat_session`, polling 3s (customer) / 4-5s (admin), unread badge
- Admin **Live Chat** tab — split layout (sessions left, conversation right)

## Test Results
- Iteration 4: 17/17 backend Phase-1 tests pass
- Iteration 5: 37/37 backend Phase-2/3/4 tests pass; frontend 100% on tested flows
- Bugs found & fixed during testing: Home.jsx orphan JSX block (iter 4), Home.jsx missing `cats` array (iter 5), Admin.jsx tab wiring miss for FAQs/Custom Requests (iter 4)

## Admin Tabs (9 total)
1. Products  2. Orders (+ FulfillmentEditor)  3. Hero Manager  4. Global Text
5. FAQs  6. Custom Requests  7. Returns  8. Live Chat  9. Settings

## Backlog
- **P1**: Gift cards with premium imagery + redemption flow
- **P1**: Granular cookie settings modal (currently basic banner accepts all/essential)
- **P1**: Accessibility mode/statement page
- **P1**: Admin analytics dashboard (revenue, orders, returns, AOV, top products)
- **P2**: Resend transactional emails (order confirmation, shipped, refund processed) — needs RE_… API key
- **P2**: Drag-and-drop hero reorder (currently up/down arrows)
- **P2**: Inventory tracking by size/variant; auto-flip status when stock=0
- **P2**: Discount codes / promo system
- **P2**: Wishlist, search, reviews
- **P2**: Refactor — split server.py into routers/ (auth, admin, products, checkout, cms, orders, returns, chat, fulfillment), split Admin.jsx into /pages/admin/*.jsx
- **P2**: Rate limiting + IP throttle on public endpoints (chat, returns, custom-requests)
- **P2**: Real-time chat via WebSocket / SSE (currently polling) once concurrent users > 50
