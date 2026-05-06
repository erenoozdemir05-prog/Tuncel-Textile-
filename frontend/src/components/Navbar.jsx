import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/shop/men", label: "Men" },
  { to: "/shop/women", label: "Women" },
  { to: "/shop/accessories", label: "Accessories" },
  { to: "/about", label: "About" },
];

export const Navbar = () => {
  const { totals } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header
      data-testid="site-navbar"
      className="sticky top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            data-testid="nav-logo"
            className="font-display text-2xl tracking-[0.08em] text-black"
          >
            TUNCEL/TEXTILE
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `tx-link text-[13px] uppercase tracking-[0.18em] ${
                    isActive ? "text-black" : "text-neutral-700"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            data-testid="nav-cart-button"
            className="relative inline-flex h-10 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white"
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
                <span className="font-display text-xl tracking-[0.08em]">TUNCEL/TEXTILE</span>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col px-6 py-8">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
