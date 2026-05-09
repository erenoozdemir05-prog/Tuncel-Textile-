import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/shop/men", label: "Men" },
  { to: "/shop/women", label: "Women" },
  { to: "/shop/accessories", label: "Accessories" },
  { to: "/about", label: "Atelier" },
];

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/ji9o9ya2_WhatsApp_Image_2026-05-06_at_18.11.35-removebg-preview%20%281%29.png";

export const Navbar = () => {
  const { totals } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleSignIn = () => {
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <header
      data-testid="site-navbar"
      className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" data-testid="nav-logo" className="group inline-flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Tuncel Textile"
              className="h-12 w-12 object-contain transition-transform duration-500 group-hover:scale-105 sm:h-14 sm:w-14"
              draggable={false}
            />
            <span className="font-display text-xl tracking-[0.22em] text-black sm:text-2xl">
              TUNCEL&nbsp;TEXTILE
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `tx-link text-[13px] uppercase tracking-[0.22em] ${
                    isActive ? "text-black" : "text-neutral-700"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/account"
              data-testid="nav-account-button"
              className="hidden h-10 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.22em] text-black hover:bg-black hover:text-white sm:inline-flex"
            >
              <User className="h-4 w-4" />
              {user.name?.split(" ")[0] || "Account"}
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              data-testid="nav-signin-button"
              className="hidden h-10 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.22em] text-black hover:bg-black hover:text-white sm:inline-flex"
            >
              <User className="h-4 w-4" />
              Sign In
            </button>
          )}

          <Link
            to="/cart"
            data-testid="nav-cart-button"
            className="relative inline-flex h-10 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.22em] text-black hover:bg-black hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            {totals.count > 0 && (
              <span
                data-testid="nav-cart-count"
                className="ml-1 inline-flex h-5 min-w-5 items-center justify-center bg-black px-1.5 text-[10px] font-semibold text-white"
              >
                {totals.count}
              </span>
            )}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="nav-mobile-menu-trigger"
                className="inline-flex h-10 w-10 items-center justify-center md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
              <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
                <div className="flex items-center gap-2">
                  <img src={LOGO_URL} alt="Tuncel Textile" className="h-9 w-9 object-contain" />
                  <span className="font-display text-lg tracking-[0.22em]">TUNCEL TEXTILE</span>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col px-6 py-6">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    data-testid={`mobile-nav-link-${n.label.toLowerCase()}`}
                    className="border-b border-black/10 py-5 font-display text-3xl uppercase tracking-[0.05em]"
                  >
                    {n.label}
                  </NavLink>
                ))}
                {user ? (
                  <Link
                    to="/account"
                    onClick={() => setOpen(false)}
                    className="border-b border-black/10 py-5 font-display text-3xl uppercase tracking-[0.05em]"
                  >
                    Account
                  </Link>
                ) : (
                  <button
                    onClick={() => { setOpen(false); handleSignIn(); }}
                    className="border-b border-black/10 py-5 text-left font-display text-3xl uppercase tracking-[0.05em]"
                  >
                    Sign In
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
