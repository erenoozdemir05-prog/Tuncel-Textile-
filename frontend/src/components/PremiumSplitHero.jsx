import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

/**
 * Premium full-bleed split hero — Men | Women
 * Dark, immersive, AS Colour / Beymen aesthetic.
 * Uses the studio's heavyweight apparel imagery.
 */
const DEFAULTS = {
  men: {
    image:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&q=80",
    items: ["FRAME TEE", "STATIC HOODIE", "PRINT CAP"],
  },
  women: {
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80",
    items: ["ECHO TEE", "CROP HOODIE", "CANVAS TOTE"],
  },
};

export const PremiumSplitHero = ({ menImage, womenImage }) => {
  const { t } = useI18n();
  const m = menImage || DEFAULTS.men.image;
  const w = womenImage || DEFAULTS.women.image;

  return (
    <section
      data-testid="premium-split-hero"
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "calc(100vh - 90px)", minHeight: "640px" }}
    >
      {/* Top promo bar — minimal, premium */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-3 border-b border-white/10 bg-black/40 py-3 text-[10px] uppercase tracking-[0.35em] text-white/80 backdrop-blur-md sm:text-[11px]">
        <span className="hidden sm:inline">{t("hero.promo_a")}</span>
        <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-block" />
        <span>{t("hero.promo_b")}</span>
      </div>

      <div className="grid h-full w-full grid-cols-2">
        {/* MEN side */}
        <Link
          to="/shop/men"
          data-testid="split-hero-men"
          className="group relative block h-full overflow-hidden"
        >
          <img
            src={m}
            alt="Men"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
          />
          {/* Vignette + gradient for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          {/* Grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Bottom-left label */}
          <div className="absolute bottom-10 left-6 right-6 sm:bottom-14 sm:left-12">
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/60">
              {t("split.edition_kicker")} · 01
            </div>
            <div
              className="font-display mt-3 leading-[0.85] text-white"
              style={{ fontSize: "clamp(56px, 9vw, 140px)", letterSpacing: "0.02em" }}
            >
              {t("nav.men").toUpperCase()}
            </div>
            <div className="mt-4 hidden flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.25em] text-white/70 sm:flex">
              {DEFAULTS.men.items.map((it) => (
                <span key={it}>· {it}</span>
              ))}
            </div>
          </div>

          {/* CTA pill — center */}
          <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 sm:right-10">
            <div className="inline-flex items-center gap-2 border border-white/40 bg-black/20 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-white backdrop-blur-md transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-black">
              {t("split.shop")} <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>

        {/* WOMEN side */}
        <Link
          to="/shop/women"
          data-testid="split-hero-women"
          className="group relative block h-full overflow-hidden border-l border-white/10"
        >
          <img
            src={w}
            alt="Women"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="absolute bottom-10 left-6 right-6 text-right sm:bottom-14 sm:right-12">
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/60">
              {t("split.edition_kicker")} · 02
            </div>
            <div
              className="font-display mt-3 leading-[0.85] text-white"
              style={{ fontSize: "clamp(56px, 9vw, 140px)", letterSpacing: "0.02em" }}
            >
              {t("nav.women").toUpperCase()}
            </div>
            <div className="mt-4 hidden flex-wrap justify-end gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.25em] text-white/70 sm:flex">
              {DEFAULTS.women.items.map((it) => (
                <span key={it}>{it} ·</span>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 sm:left-10">
            <div className="inline-flex items-center gap-2 border border-white/40 bg-black/20 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-white backdrop-blur-md transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-black">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" /> {t("split.shop")}
            </div>
          </div>
        </Link>
      </div>

      {/* Center brand mark */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.45em] text-white/70">
          {t("split.atelier_kicker")}
        </div>
        <div
          className="font-display mt-2 leading-none text-white"
          style={{ fontSize: "clamp(20px, 1.6vw, 28px)", letterSpacing: "0.32em" }}
        >
          TUNCEL · RIGA
        </div>
        <div className="mx-auto mt-3 h-px w-12 bg-white/40" />
        <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/50">
          MMXXVI
        </div>
      </div>

      {/* Bottom split divider label */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.45em] text-white/40">
        {t("split.scroll")}
      </div>
    </section>
  );
};

export default PremiumSplitHero;
