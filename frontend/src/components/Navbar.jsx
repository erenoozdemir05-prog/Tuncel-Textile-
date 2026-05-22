import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_LEFT = [
    { to: "/shop/women", label: t("nav.women") },
    { to: "/shop/men", label: t("nav.men") },
    { to: "/shop/accessories", label: t("nav.accessories") },
  ];
  const NAV_RIGHT = [
    { to: "/custom-request", label: t("nav.custom") },
    { to: "/about", label: t("nav.atelier") },
  ];

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleSignIn = () => {
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // On home (above hero): transparent header with white text, env-aware.
  // On scroll OR non-home pages: solid white header with black text.
  const isTransparent = isHome && !scrolled;
  const textCls = isTransparent ? "text-white" : "text-black";
  const headerCls = isTransparent
    ? "bg-transparent border-transparent"
    : "bg-white/95 backdrop-blur-md border-black/10";

  const navItemCls = ({ isActive }) =>
    `text-[11px] uppercase tracking-[0.32em] transition-opacity hover:opacity-100 ${
      isActive ? "opacity-100" : "opacity-75"
    }`;

  return (
    <header
      data-testid="site-navbar"
      className={`sticky top-0 z-40 border-b transition-colors duration-500 ${headerCls} ${textCls}`}
    >
      <div className="mx-auto grid h-[78px] max-w-[1800px] grid-cols-3 items-center px-5 sm:px-10">
        {/* LEFT NAV (desktop) + mobile menu trigger */}
        <div className="flex items-center gap-7">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="nav-mobile-menu-trigger"
                aria-label="Open menu"
                className="inline-flex h-10 w-10 items-center justify-center md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm bg-white p-0 text-black">
              <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
                <span className="font-display text-xl tracking-[0.22em]">TUNCEL</span>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col px-6 py-6">
                {[...NAV_LEFT, ...NAV_RIGHT].map((n) => (
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

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LEFT.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.to.replace("/shop/", "").replace("/", "")}`}
                className={navItemCls}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* CENTER LOGO — env-aware on home, solid elsewhere */}
        <Link
          to="/"
          data-testid="nav-logo"
          aria-label="Tuncel Textile"
          className="justify-self-center font-display tracking-[0.42em] transition-opacity hover:opacity-70"
          style={{
            fontSize: "clamp(20px, 2vw, 26px)",
            mixBlendMode: isTransparent ? "difference" : "normal",
            color: isTransparent ? "#fff" : undefined,
          }}
        >
          TUNCEL
        </Link>

        {/* RIGHT NAV + ACTIONS */}
        <div className="flex items-center justify-end gap-5">
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_RIGHT.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.to.replace("/", "")}`}
                className={navItemCls}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {user ? (
            <Link
              to="/account"
              data-testid="nav-account-button"
              aria-label="Account"
              className="inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              data-testid="nav-signin-button"
              aria-label="Sign in"
              className="inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
            >
              <User className="h-4 w-4" />
            </button>
          )}

          <Link
            to="/cart"
            data-testid="nav-cart-button"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
          >
            <ShoppingBag className="h-4 w-4" />
            {totals.count > 0 && (
              <span
                data-testid="nav-cart-count"
                className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1F4D3D] px-1 text-[9px] font-semibold text-white"
              >
                {totals.count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
