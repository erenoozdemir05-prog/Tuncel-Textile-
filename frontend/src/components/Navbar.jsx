import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Navbar = () => {
  const { totals } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const NAV = [
    { to: "/shop/men", label: t("nav.men") },
    { to: "/shop/women", label: t("nav.women") },
    { to: "/shop/accessories", label: t("nav.accessories") },
    { to: "/custom-request", label: t("nav.custom") },
    { to: "/about", label: t("nav.atelier") },
  ];

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
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            data-testid="nav-logo"
            aria-label="Tuncel Textile"
            className="font-display text-xl tracking-[0.22em] text-black transition-opacity hover:opacity-70 sm:text-2xl"
          >
            TUNCEL&nbsp;TEXTILE
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.to.replace("/shop/", "").replace("/", "")}`}
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

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block"><LanguageSwitcher /></div>

          {user ? (
            <Link
              to="/account"
              data-testid="nav-account-button"
              className="hidden h-10 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.22em] text-black hover:bg-black hover:text-white sm:inline-flex"
            >
              <User className="h-4 w-4" />
              {user.name?.split(" ")[0] || t("nav.account")}
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              data-testid="nav-signin-button"
              className="hidden h-10 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.22em] text-black hover:bg-black hover:text-white sm:inline-flex"
            >
              <User className="h-4 w-4" />
              {t("nav.signin")}
            </button>
          )}

          <Link
            to="/cart"
            data-testid="nav-cart-button"
            className="relative inline-flex h-10 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.22em] text-black hover:bg-black hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.cart")}</span>
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
                <span className="font-display text-lg tracking-[0.22em]">TUNCEL TEXTILE</span>
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
                    data-testid={`mobile-nav-link-${n.to.replace("/shop/", "").replace("/", "")}`}
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
                    {t("nav.account")}
                  </Link>
                ) : (
                  <button
                    onClick={() => { setOpen(false); handleSignIn(); }}
                    className="border-b border-black/10 py-5 text-left font-display text-3xl uppercase tracking-[0.05em]"
                  >
                    {t("nav.signin")}
                  </button>
                )}
                <div className="pt-6">
                  <LanguageSwitcher />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
