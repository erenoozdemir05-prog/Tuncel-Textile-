import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingBag, User, X, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useCms, cmsText } from "@/contexts/CmsContext";
import { useSettings, buildWhatsappLink } from "@/contexts/SettingsContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Navbar — Prada-style with Menu + Search on the left.
 *   • Default: fully transparent, only text floats over the page.
 *   • Hover OR scrolled OR inner page: solid white bar.
 * Left:   [Menu icon + label]  [Search icon + label]
 * Center: TUNCEL TEXTILE logo
 * Right:  Contact us · Lang · Account · Cart
 * Labels Menu / Search / Contact are CMS-editable (admin panel → CMS).
 */
export const Navbar = () => {
  const { totals } = useCart();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const { items: cmsItems } = useCms();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleSignIn = () => {
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const isSolid = hovering || scrolled || !isHome || searchOpen;
  const isOverHero = isHome && !scrolled && !hovering && !searchOpen;
  const textColor = isOverHero ? "#FFFFFF" : "#0A0A0A";
  const textShadow = isOverHero ? "0 1px 14px rgba(0,0,0,0.55)" : "none";
  const iconDrop = isOverHero ? "drop-shadow(0 1px 6px rgba(0,0,0,0.55))" : "none";

  // Main menu drawer links
  const DRAWER_LINKS = [
    { to: "/shop/women",       label: t("nav.women") },
    { to: "/shop/men",         label: t("nav.men") },
    { to: "/shop/accessories", label: t("nav.accessories") },
    { to: "/custom-request",   label: t("nav.custom") },
    { to: "/gift-cards",       label: t("ed_gift.cta") },
  ];

  // Contact link — admin-managed via settings: email | whatsapp | url
  const ctype = settings?.contact_link_type || "email";
  const cval  = settings?.contact_link_value || "";
  let contactHref = "mailto:tunceltextile@gmail.com";
  if (ctype === "whatsapp") {
    contactHref = buildWhatsappLink(settings, "Hello Tuncel Textile, I'd like to ask something.");
  } else if (ctype === "url" && cval) {
    contactHref = cval.startsWith("http") ? cval : `https://${cval}`;
  } else if (ctype === "email") {
    contactHref = `mailto:${cval || settings?.contact_email || "tunceltextile@gmail.com"}`;
  }
  const contactExternal = ctype === "whatsapp" || ctype === "url";

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setQuery("");
    navigate(`/shop/all?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      data-testid="site-navbar"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="fixed inset-x-0 top-0 z-40 transition-colors duration-500"
      style={{
        backgroundColor: isSolid ? "rgba(255,255,255,0.98)" : "transparent",
        borderBottom: isSolid ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
        backdropFilter: isSolid ? "saturate(140%) blur(8px)" : "none",
        color: textColor,
      }}
    >
      <div className="relative mx-auto grid h-[64px] max-w-[1800px] grid-cols-3 items-center pl-2 pr-3 sm:h-[78px] sm:pl-3 sm:pr-10">
        {/* LEFT — Menu + Search (Prada layout) */}
        <div className="flex items-center gap-4 sm:gap-8" style={{ color: textColor }}>
          {/* Menu (hamburger) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                data-testid="nav-menu-button"
                aria-label="Open menu"
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-70"
                style={{ filter: iconDrop, textShadow }}
              >
                <Menu className="h-[16px] w-[16px]" strokeWidth={1.5} />
                <span
                  className="font-prada hidden sm:inline"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {cmsText(cmsItems, "nav_menu_label", locale, t("nav.menu"))}
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-md bg-white p-0 text-black">
              <div className="flex items-center justify-between border-b border-black/10 px-7 py-5">
                <span className="font-prada text-xl font-semibold tracking-[0.12em]">TUNCEL TEXTILE</span>
                <button onClick={() => setOpen(false)} aria-label="Close" data-testid="drawer-close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col px-7 py-8">
                {DRAWER_LINKS.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    data-testid={`drawer-link-${n.to.replace(/[/?]/g, "-")}`}
                    className="font-prada border-b border-black/10 py-5 text-3xl tracking-[0.04em] transition-opacity hover:opacity-60"
                  >
                    {n.label}
                  </NavLink>
                ))}
                <div className="pt-8">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">{t("foot.legal")}</div>
                  <div className="mt-3 flex flex-col gap-2 text-sm text-neutral-700">
                    <Link to="/track-order" onClick={() => setOpen(false)} className="hover:text-black">{t("iban_succ.track_order")}</Link>
                    <Link to="/return-request" onClick={() => setOpen(false)} className="hover:text-black">{t("rr.kicker")}</Link>
                    <Link to="/faq" onClick={() => setOpen(false)} className="hover:text-black">FAQ</Link>
                  </div>
                </div>
                <div className="pt-8">
                  <LanguageSwitcher />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Search */}
          <button
            data-testid="nav-search-button"
            aria-label="Open search"
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-70"
            style={{ filter: iconDrop, textShadow }}
          >
            <Search className="h-[16px] w-[16px]" strokeWidth={1.5} />
            <span
              className="font-prada hidden sm:inline"
              style={{
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {cmsText(cmsItems, "nav_search_label", locale, t("nav.search"))}
            </span>
          </button>
        </div>

        {/* CENTER LOGO */}
        <Link
          to="/"
          data-testid="nav-logo"
          aria-label="Tuncel Textile"
          className="font-prada justify-self-center font-semibold tracking-[0.14em] transition-opacity hover:opacity-70"
          style={{
            fontSize: "clamp(13px, 1.7vw, 26px)",
            color: textColor,
            textShadow,
          }}
        >
          TUNCEL TEXTILE
        </Link>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-6" style={{ color: textColor }}>
          <a
            href={contactHref}
            target={contactExternal ? "_blank" : undefined}
            rel={contactExternal ? "noopener noreferrer" : undefined}
            data-testid="nav-contact-link"
            className="font-prada hidden transition-opacity hover:opacity-70 md:inline"
            style={{
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 500,
              color: textColor,
              textShadow,
            }}
          >
            {cmsText(cmsItems, "nav_contact_label", locale, t("nav.contact_us"))}
          </a>

          <div className="hidden sm:block">
            <LanguageSwitcher variant={isOverHero ? "dark" : "light"} />
          </div>

          {user ? (
            <Link
              to="/account"
              data-testid="nav-account-button"
              aria-label="Account"
              className="inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
              style={{ filter: iconDrop }}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              data-testid="nav-signin-button"
              aria-label="Sign in"
              className="inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
              style={{ filter: iconDrop }}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
            </button>
          )}

          <Link
            to="/cart"
            data-testid="nav-cart-button"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70"
            style={{ filter: iconDrop }}
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

      {/* SEARCH BAR — slides in from top when search icon clicked */}
      {searchOpen && (
        <div className="border-t border-black/10 bg-white">
          <form
            onSubmit={onSearch}
            className="mx-auto flex max-w-[1800px] items-center gap-4 px-5 py-5 sm:px-10"
            data-testid="nav-search-form"
          >
            <Search className="h-5 w-5 text-black/60" strokeWidth={1.4} />
            <input
              autoFocus
              data-testid="nav-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.search_ph")}
              className="font-prada flex-1 bg-transparent text-2xl tracking-[0.02em] text-black outline-none placeholder:text-black/30"
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setQuery(""); }}
              aria-label="Close search"
              data-testid="nav-search-close"
              className="text-black/60 transition-opacity hover:opacity-100"
            >
              <X className="h-5 w-5" strokeWidth={1.4} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
