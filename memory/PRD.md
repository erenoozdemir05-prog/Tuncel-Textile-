# Tuncel Textile — Product Requirements Document

## Original Problem Statement
"We're opening a new textile shop called Tuncel Textile. There are two of us; please create a modern website for us. It should have a menu option and the ability to navigate between pages. We're thinking of a print-based design, with separate options for hoodies and T-shirts for men and women." (Reference: Beymen.com)

## Architecture
- FastAPI + MongoDB + React (CRA) + TailwindCSS + shadcn/ui
- Stripe Checkout via emergentintegrations + IBAN bank transfer
- Emergent Object Storage for image uploads
- Emergent Google Auth for customer accounts
- Bebas Neue + Manrope fonts

## What's Implemented

### Iteration 1 — MVP (catalog + Stripe + cart + about)
### Iteration 2 — Admin panel + Google Auth + enriched UI
### Iteration 3 — Premium refresh (logo, atelier language, WhatsApp, Riga studio)
### Iteration 4 (2026-02-13) — Full CMS, i18n, IBAN, social, cookies
- **Site Settings** collection — admin-editable WhatsApp number + default message, social URLs, IBAN bank details, favicon URL
- **Footer Social Bar** — Instagram, Facebook, X, LinkedIn, YouTube, TikTok, WhatsApp icons; hidden when URL empty; pill-style circular buttons with dark hover
- **Cookie Banner + Cookie Policy page** (`/cookie-policy`) — localStorage consent, Accept All / Essential Only
- **EN / RU / LV language switcher** (top-right globe icon, persists in localStorage `tuncel_locale`)
- **WhatsApp**: number + prefilled message editable from admin; reflected in footer link, FAB and About page CTA
- **Logo-only navbar** — wordmark text removed; just the diamond TT crest image
- **IBAN bank-transfer checkout** — `Cart` → `Choose how to pay` → Card (Stripe) | Bank Transfer (IBAN form: name/email/address/note) → unique reference like `TT-XXXXXX` → `/checkout/iban-success?ref=...` showing IBAN details with copy buttons
- **Hero Slider CMS** — admin `/admin → Hero Manager` tab. Multiple slides, each with EN/RU/LV kicker/title/subtitle/CTA, desktop+mobile image upload, optional video URL, blur toggle, overlay opacity slider, active toggle, up/down reorder, live preview pane. Homepage auto-rotates every 7s with indicator dots. Falls back to default `HAND / CRAFTED` when no slides.
- **Global CMS Text** — `Admin → Global Text` tab. Editable key/label/EN/RU/LV strings. Defaults: `limited_edition`, `handcrafted`, `free_shipping`, `hero_strapline`. Add/remove keys. Consumed in ProductDetail bullets (extensible).
- **Product Status Labels** — `status_label` (in_stock | low_stock | out_of_stock | coming_soon) + `stock_count` (for low_stock). Badge appears on ProductCard top-right.
- **Favicon upload** — admin uploads, `useFavicon` hook injects `<link rel="icon">` dynamically.

## Test Results
- Iteration 1: 12/13 backend, 100% frontend
- Iteration 2: 29/29 backend, 95% frontend
- Iteration 3: 25/25 NEW backend tests, ~85% frontend automated + manual E2E verification for Cart→IBAN (✅ confirmed via screenshot — order TT-64B7DA created and IBAN success page rendered)
- Critical route-order bug fixed: `/admin/hero/reorder` moved BEFORE `/admin/hero/{slide_id}`

## Backlog
- P1: Resend order-confirmation email (awaiting RE_… API key from owner)
- P1: Mark IBAN orders as "paid" from admin (currently sit at `awaiting_bank_transfer`)
- P2: Drag-and-drop hero reorder (currently up/down arrows)
- P2: Inventory tracking by size/variant; auto-flip status when stock=0
- P2: Discount codes / promo system
- P2: Wishlist, search, reviews
- P2: Refactor server.py into routers/ submodules (auth, admin, products, checkout, cms, settings, hero)
