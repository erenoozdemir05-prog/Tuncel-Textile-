# Tuncel Textile — Product Requirements Document

## Original Problem Statement
"We're opening a new textile shop called Tuncel Textile. There are two of us; please create a modern website for us. It should have a menu option and the ability to navigate between pages. We're thinking of a print-based design, with separate options for hoodies and T-shirts for men and women. We're looking for a modern look." (Reference: Beymen.com)

## User Choices
- Language: English only
- Scope: Cart + product management AND full e-commerce (Stripe)
- Style: Bold artistic print + minimalist black/white with big typography
- Pages: Home, Men, Women, Accessories, About
- Images: User will upload their own (Pexels placeholders for now)

## Architecture
- **Backend**: FastAPI, MongoDB, Stripe via emergentintegrations library
- **Frontend**: React (CRA + craco), TailwindCSS, shadcn/ui, react-router-dom 7
- **Cart**: Client-side (localStorage) via React Context
- **Payments**: Stripe Checkout (server computes totals; webhook + status polling)
- **Fonts**: Bebas Neue (display) + Manrope (body)

## What's Implemented (2026-02-06)
- 11 seeded products across men (4) / women (4) / accessories (3); types: hoodie, tshirt, accessory
- API: `GET /api/products` (filters: category, product_type, featured), `GET /api/products/{id}`, `POST /api/checkout/session`, `GET /api/checkout/status/{session_id}` (graceful Stripe fallback to DB), `POST /api/webhook/stripe`
- Pages: Home (hero + category cards + featured grid + manifesto), Shop (with type filters), Product Detail (size/color), Cart (qty +/-, remove), Checkout Success (status polling), About
- Components: Navbar (sticky, mobile sheet), Footer (marquee), ProductCard (hover-reveal CTA)
- Cart persists in localStorage; checkout redirects to Stripe; success page polls status & clears cart on paid
- payment_transactions collection records every checkout attempt

## Test Results (iteration_1)
- Backend: 12/13 passing — fixed graceful fallback for /checkout/status when Stripe lookup fails
- Frontend: 100% — all flows verified (home, shop filters, product detail, add to cart, cart CRUD, checkout redirect, about, mobile menu)

## Backlog (P1/P2)
- P1: Admin panel for product CRUD + image upload (object storage)
- P1: Replace Pexels placeholders with founders' real product photos
- P1: Order confirmation email (Resend or similar)
- P2: Search bar with autocomplete
- P2: Wishlist / favorites
- P2: Product variants by inventory (size-level stock)
- P2: User accounts + order history (Emergent Google Auth)
- P2: Product reviews & ratings
- P2: Discount codes / promo system
- P2: Shipping address & rates
