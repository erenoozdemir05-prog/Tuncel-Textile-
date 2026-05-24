import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, User, X, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Navbar — Prada-style.
 * Default: fully transparent, only text floats over the page.
 *   • On home (over dark hero): white text + soft shadow.
 *   • On inner pages (light bg): dark text, still no background.
 * Hover (mouse over header) OR scrolled: solid white bar slides in with dark text.
 */
export const Navbar = () => {
  const { totals } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
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
  ];

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleSignIn = () => {
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Solid white when:
  //   - hovering navbar, OR
  //   - scrolled past 80px on any page, OR
  //   - on any non-home page (inner pages have white bg, navbar matches)
  const isSolid = hovering || scrolled || !isHome;
  // White text only when over dark hero (home top, not hovered). Black text everywhere else.
  const isOverHero = isHome && !scrolled && !hovering;
  const textColor = isOverHero ? "#FFFFFF" : "#0A0A0A";
  const textShadow = isOverHero ? "0 1px 14px rgba(0,0,0,0.55)" : "none";

  const navItemCls = ({ isActive }) =>
    `font-prada text-[15px] tracking-[0.02em] transition-opacity hover:opacity-100 ${
      isActive ? "opacity-100" : "opacity-80"
    }`;

  return (
    <header
      data-testid="site-navbar"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="sticky top-0 z-40 transition-colors duration-500"
      style={{
        backgroundColor: isSolid ? "rgba(255,255,255,0.98)" : "transparent",
        borderBottom: isSolid ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
        backdropFilter: isSolid ? "saturate(140%) blur(8px)" : "none",
        color: textColor,
      }}
    >
      <div className="relative mx-auto grid h-[78px] max-w-[1800px] grid-cols-3 items-center px-5 sm:px-10">
        {/* LEFT NAV (desktop) + mobile menu trigger */}
        <div className="flex items-center gap-8">
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
                <span className="font-prada text-2xl font-semibold tracking-[0.04em]">TUNCEL</span>
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
                    className="font-prada border-b border-black/10 py-5 text-2xl tracking-[0.02em]"
                  >
                    {n.label}
                  </NavLink>
                ))}
                {user ? (
                  <Link
                    to="/account"
                    onClick={() => setOpen(false)}
                    className="font-prada border-b border-black/10 py-5 text-2xl tracking-[0.02em]"
                  >
                    {t("nav.account")}
                  </Link>
                ) : (
                  <button
                    onClick={() => { setOpen(false); handleSignIn(); }}
                    className="font-prada border-b border-black/10 py-5 text-left text-2xl tracking-[0.02em]"
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

          <nav className="hidden items-center gap-9 md:flex">
            {NAV_LEFT.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.to.replace("/shop/", "").replace("/", "")}`}
                className={navItemCls}
                style={{ color: textColor, textShadow }}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* CENTER LOGO — Prada-style Bodoni serif */}
        <Link
          to="/"
          data-testid="nav-logo"
          aria-label="Tuncel Textile"
          className="font-prada justify-self-center font-semibold tracking-[0.08em] transition-opacity hover:opacity-70"
          style={{
            fontSize: "clamp(20px, 1.9vw, 28px)",
            color: textColor,
            textShadow,
            letterSpacing: "0.14em",
          }}
        >
          TUNCEL TEXTILE
        </Link>

        {/* RIGHT NAV + ACTIONS */}
        <div className="flex items-center justify-end gap-6" style={{ color: textColor }}>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_RIGHT.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.to.replace("/", "")}`}
                className={navItemCls}
                style={{ color: textColor, textShadow }}
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
              style={{ filter: isOverHero ? "drop-shadow(0 1px 6px rgba(0,0,0,0.55))" : "none" }}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              data-testid="nav-signin-button"
              aria-label="Sign in"
              className="inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
              style={{ filter: isOverHero ? "drop-shadow(0 1px 6px rgba(0,0,0,0.55))" : "none" }}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </button>
          )}

          <Link
            to="/cart"
            data-testid="nav-cart-button"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
            style={{ filter: isOverHero ? "drop-shadow(0 1px 6px rgba(0,0,0,0.55))" : "none" }}
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.3} />
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
