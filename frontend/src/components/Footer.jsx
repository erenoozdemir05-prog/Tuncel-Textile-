import React from "react";
import { Link } from "react-router-dom";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/ji9o9ya2_WhatsApp_Image_2026-05-06_at_18.11.35-removebg-preview%20%281%29.png";

const WHATSAPP_NUMBER = "+371 20677937";
const WHATSAPP_HREF = "https://wa.me/37120677937?text=" + encodeURIComponent("Hello Tuncel Textile, I'm interested in...");

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="relative mt-24 overflow-hidden bg-black text-white"
    >
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] overflow-hidden px-0 py-10">
          <div className="tx-marquee flex whitespace-nowrap font-display text-[12vw] uppercase leading-none tracking-[0.02em] text-white/95 sm:text-[10vw]">
            <span className="px-8">Tuncel Textile —</span>
            <span className="px-8 tx-outline-text">Hand Crafted —</span>
            <span className="px-8">Made With Care —</span>
            <span className="px-8 tx-outline-text">Limited Editions —</span>
            <span className="px-8">Tuncel Textile —</span>
            <span className="px-8 tx-outline-text">Hand Crafted —</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 py-16 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Tuncel Textile" className="h-12 w-12 object-contain" />
            <div className="font-display text-2xl tracking-[0.22em]">TUNCEL TEXTILE</div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
            A two-person atelier crafting limited-run hoodies, tees and accessories. Hand-finished
            cotton. Considered details. Pieces designed to be worn for years, not seasons.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/50">
            Atelier · Riga, Latvia
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/50">House</div>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link to="/shop/men" className="tx-link">Men</Link></li>
            <li><Link to="/shop/women" className="tx-link">Women</Link></li>
            <li><Link to="/shop/accessories" className="tx-link">Accessories</Link></li>
            <li><Link to="/about" className="tx-link">The Atelier</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/50">Contact</div>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-whatsapp"
                className="tx-link inline-flex items-center gap-2"
              >
                <WhatsappIcon className="h-4 w-4" />
                {WHATSAPP_NUMBER}
              </a>
            </li>
            <li>
              <a href="mailto:hello@tunceltextile.com" className="tx-link">
                hello@tunceltextile.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-5 py-6 text-[11px] uppercase tracking-[0.25em] text-white/50 sm:flex-row sm:items-center sm:px-8">
          <span>© {new Date().getFullYear()} Tuncel Textile · All rights reserved</span>
          <span>Crafted with care</span>
        </div>
      </div>
    </footer>
  );
};

// ----- Floating WhatsApp button (premium pill) -----
export const WhatsappFAB = () => (
  <a
    href={WHATSAPP_HREF}
    target="_blank"
    rel="noopener noreferrer"
    data-testid="whatsapp-fab"
    aria-label="Chat on WhatsApp"
    className="group fixed bottom-20 right-4 z-50 inline-flex items-center gap-2 bg-black px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white shadow-2xl ring-1 ring-white/10 transition-all hover:bg-[#25D366] hover:text-white sm:bottom-24 sm:right-6 sm:px-5 sm:py-3.5"
  >
    <WhatsappIcon className="h-4 w-4" />
    <span className="hidden sm:inline">Chat With Us</span>
  </a>
);

const WhatsappIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.11 17.29c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.58-.49-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.08 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35zm-5.07 6.95h-.01a9.94 9.94 0 0 1-5.06-1.39l-.36-.21-3.76.99 1-3.67-.24-.38a9.93 9.93 0 0 1-1.52-5.3c0-5.49 4.47-9.96 9.97-9.96 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.92 7.04c0 5.49-4.47 9.96-9.98 9.96zm8.49-18.45A11.86 11.86 0 0 0 14.04 2C7.46 2 2.11 7.35 2.1 13.92c0 2.1.55 4.15 1.59 5.96L2 26l6.27-1.65a11.91 11.91 0 0 0 5.76 1.47h.01c6.58 0 11.93-5.35 11.94-11.92a11.85 11.85 0 0 0-3.49-8.46z" />
  </svg>
);
