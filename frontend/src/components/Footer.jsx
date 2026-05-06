import React from "react";
import { Link } from "react-router-dom";

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
            <span className="px-8 tx-outline-text">Print Forever —</span>
            <span className="px-8">Established 2026 —</span>
            <span className="px-8 tx-outline-text">Wear The Print —</span>
            <span className="px-8">Tuncel Textile —</span>
            <span className="px-8 tx-outline-text">Print Forever —</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 py-16 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-3xl tracking-[0.08em]">TUNCEL/TEXTILE</div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
            A two-person studio printing limited-run apparel. Hand-picked cotton, bold typography,
            and pieces designed to outlast the season.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/50">
            Studio · Istanbul
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/50">Shop</div>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link to="/shop/men" className="tx-link">Men</Link></li>
            <li><Link to="/shop/women" className="tx-link">Women</Link></li>
            <li><Link to="/shop/accessories" className="tx-link">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/50">Studio</div>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link to="/about" className="tx-link">About Us</Link></li>
            <li><a href="mailto:hello@tunceltextile.com" className="tx-link">hello@tunceltextile.com</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-5 py-6 text-[11px] uppercase tracking-[0.25em] text-white/50 sm:flex-row sm:items-center sm:px-8">
          <span>© {new Date().getFullYear()} Tuncel Textile</span>
          <span>All prints made with care</span>
        </div>
      </div>
    </footer>
  );
};
