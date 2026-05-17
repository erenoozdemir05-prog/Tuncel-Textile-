# Tuncel Textile — Product Requirements Document

## Original Problem Statement
"We're opening a new textile shop called Tuncel Textile. There are two of us; please create a modern website for us. It should have a menu option and the ability to navigate between pages. We're thinking of a print-based design, with separate options for hoodies and T-shirts for men and women." (Reference: Beymen.com — premium, minimalist, black/white, artistic typography.)

User language: **Turkish** for all agent communication.
Studio location: Riga (2 founders).
Studio gmail: **tunceltextile@gmail.com**

## Architecture
- **Backend**: FastAPI + MongoDB (Motor) — `/app/backend/server.py` (~1600 lines, monolith — split candidate)
- **Frontend**: React (CRA) + TailwindCSS + shadcn/ui — `/app/frontend/src/`
- **Integrations**: 
  - Stripe Checkout (Emergent integrations)
  - Emergent Object Storage
  - Emergent Google Auth
  - **Claude Sonnet 4.5** via Emergent Universal LLM Key (AI auto-reply for chat)
  - **Resend** (admin email notifications)
- **Fonts**: Bebas Neue (display) + Manrope (body)
- **Currency**: € (EUR) — global

## What's Implemented

### Iteration 1 — MVP (catalog + Stripe + cart + about)
### Iteration 2 — Admin panel + Google Auth + enriched UI
### Iteration 3 — Premium refresh (logo, atelier language, WhatsApp, Riga studio)
### Iteration 4 (2026-02-13) — Full CMS, i18n (EN/RU/LV), IBAN flow, social bar, cookie banner
### Iteration 5 (2026-02-17) — Phase 1: FAQ + Custom Requests + Legal pages + € currency switch
### Iteration 6 (2026-02-17) — Phase 2/3/4 launched in one batch
- **Phase 2 — Order tracking** (`/track-order`, public lookup with ref+email, admin FulfillmentEditor with status/carrier/tracking_number/tracking_url/shipping_note + auto shipped_at/delivered_at, "Track Order →" CTA on IBAN success page)
- **Phase 3 — Returns/Exchanges** (`/return-request`, status workflow pending→approved→in_transit→received→refunded/exchanged, conditional exchange_size vs IBAN, admin Returns tab with filter+drawer)
- **Phase 4 — Live Chat** (7 endpoints, ChatWidget FAB on every page, polling 3s customer / 4-5s admin, localStorage `tuncel_chat_session`, unread badge, admin Live Chat tab with split layout)

### Iteration 7 (2026-02-17) — Phase 5: AI hybrid chat + email alerts + premium polish
- **AI hybrid chat** — Claude Sonnet 4.5 via Emergent Universal LLM Key
  - System prompt teaches Tuncel Textile brand (Riga atelier, 14:00 CET same-day, EUR pricing, custom-request/track/return URLs, multilingual reply)
  - Background task (asyncio.create_task) — endpoint returns in ~370ms; AI message arrives via polling within 3-6s
  - Admin reply within last 5 min suppresses AI (human takes over seamlessly)
  - AI failures (budget, network) gracefully degrade — endpoint never 500s
  - AI messages stored with `sender="ai"`, styled in purple in both customer widget and admin
- **Resend email notifications** — admin receives email at `tunceltextile@gmail.com` on every new customer chat (fire-and-forget, doesn't block response)
- **Admin sound + browser alerts** — Live Chat tab plays a Web Audio API "ding" + browser Notification when unread count rises; toggleable in UI, persists to `localStorage.tuncel_admin_chat_sound`
- **Chat FAB redesigned** — pill-shaped button with sparkle icon + "AI Chat" label + "Live · with humans" subtitle (no more ambiguous chat bubble)
- **ShippingBar** — black promo bar under Navbar on every page: "Order by 14:00 CET — same-day dispatch · Free EU shipping over €30 · Hand-finished in Riga · 14-day returns"

## Test Results
- Iteration 4: 17/17 backend Phase-1
- Iteration 5: 37/37 backend Phase-2/3/4 + frontend 100%
- Iteration 6: 14/14 backend Phase-5 (AI hybrid chat + Resend) + frontend 100%

## Admin Tabs (9 total)
1. Products  2. Orders (+ FulfillmentEditor)  3. Hero Manager  4. Global Text
5. FAQs  6. Custom Requests  7. Returns  8. **Live Chat** (sound + browser alerts + AI-aware)  9. Settings

## Backlog
- **P1**: Hediye kartları + premium görseller, granüler çerez ayarları modülü, erişilebilirlik modu, Admin analytics dashboard (gelir/sipariş/iade trendleri)
- **P2**: Verified domain for Resend (currently uses onboarding@resend.dev sandbox), env-driven ADMIN_PANEL_URL in email templates, AI_REPLY_ENABLED admin UI toggle
- **P2**: Inventory tracking by size/variant; discount codes; wishlist/search/reviews
- **P2**: Refactor — split server.py into routers/ (orders, returns, chat, fulfillment), split Admin.jsx into /pages/admin/*.jsx
- **P2**: Rate limiting + IP throttle on public endpoints (chat/start, chat/{sid}/message, returns, custom-requests) — protects LLM budget from bot spam
- **P2**: Real-time chat via WebSocket / SSE (currently polling) once concurrent users > 50
- **P2**: Pydantic constraints (`min_length=1, max_length=4000`) on ChatMessageIn.body
