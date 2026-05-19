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

### Iteration 8 (2026-02-19) — Phase 7: Multi-admin chat + TR locale + UX polish
- **ScrollToTop** behavior changed from `instant` → `smooth` for premium feel on route change
- **Top ShippingBar removed** → replaced by elegant Footer "promise strip" with same info ("14:00 CET · €30 free · Riga · 14-day returns") in white-on-dark
- **Home: Gift Card CTA section** between Manifesto and Bespoke CTA — premium black card preview ("€25 from · email delivery") with `home-gift-cta` button
- **Custom Request enhancements**:
  - Budget brackets lowered (€50 → €1500+ instead of €500 → €5000+)
  - Default quantity 1 (no MOQ)
  - Hero copy: "Single tee from €35 · no MOQ"
  - **Print size S/M/L selector** (S ≈15×15cm, M ≈25×30cm, L ≈35×45cm) with **±3 cm tolerance** note
  - Sidebar summary now includes "Print size · M (±3 cm)"
- **Multi-admin live chat**:
  - Admin login flow: Password → "Enter your support name" prompt → Dashboard
  - Admin name stored in localStorage `tuncel_admin_name`, displayed in header "Signed in as Eren"
  - Reply payload now includes `admin_name`; first reply by each admin emits system message "NAME joined the chat"
  - Multiple admins can chat in the same session
  - Admin close emits system message "Chat closed by NAME" + sets `status=closed`, `closed_at`, `closed_by`
  - Customer ChatWidget on closed session shows banner "Support chat has been closed." + "Start New Chat" button → fresh session
  - System messages render as centered grey pill (distinct from regular bubbles) in both customer widget and admin
- **Turkish (TR) added** as 4th locale: TR/EN/RU/LV
  - tr block in `/app/frontend/src/i18n/translations.js`
  - Console warning on missing keys in non-prod
  - Navbar: ERKEK · KADIN · AKSESUAR · CUSTOM · ATÖLYE · GİRİŞ · SEPET
  - Cookie banner fully translated
- **Cookie banner bug fix**: `Save preferences` now persists correctly to localStorage (was broken by ChatWidget z-index intercepting clicks; fixed via cookie modal z-100 + functional setPrefs update)
- **Premium WhatsApp FAB** redesign — pill button with green pulsing disc + "WhatsApp · Founders · 1h reply" label
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

## Admin Tabs (11 total)
1. **Analytics** (default · revenue/orders/AOV/returns/AI vs human/gift card KPIs + daily revenue chart + top products)
2. Products  3. Orders (+ FulfillmentEditor)  4. Hero Manager  5. Global Text
6. FAQs  7. Custom Requests  8. Returns
9. **Live Chat** (multi-admin · join/leave system msgs · sound + browser alerts · AI-aware)
10. **Gift Cards** (filter pills · activate/cancel actions)
11. Settings

## Admin auth flow
1. Password (`tuncel2026admin`) → JWT-style token in `localStorage.tuncel_admin_token`
2. "Enter your support name" prompt → stored in `localStorage.tuncel_admin_name`
3. Admin name appended to every chat reply + "joined" system messages

## Backlog
- **P1**: Hediye kartları + premium görseller, granüler çerez ayarları modülü, erişilebilirlik modu, Admin analytics dashboard (gelir/sipariş/iade trendleri)
- **P2**: Verified domain for Resend (currently uses onboarding@resend.dev sandbox), env-driven ADMIN_PANEL_URL in email templates, AI_REPLY_ENABLED admin UI toggle
- **P2**: Inventory tracking by size/variant; discount codes; wishlist/search/reviews
- **P2**: Refactor — split server.py into routers/ (orders, returns, chat, fulfillment), split Admin.jsx into /pages/admin/*.jsx
- **P2**: Rate limiting + IP throttle on public endpoints (chat/start, chat/{sid}/message, returns, custom-requests) — protects LLM budget from bot spam
- **P2**: Real-time chat via WebSocket / SSE (currently polling) once concurrent users > 50
- **P2**: Pydantic constraints (`min_length=1, max_length=4000`) on ChatMessageIn.body
