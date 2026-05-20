import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * IvorySplitHero — light luxury split hero (Toteme / The Row / Lemaire aesthetic).
 * Ivory + champagne palette, soft daylight imagery, oversized editorial typography.
 */
const DEFAULTS = {
  men: {
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=85",
    pieces: ["LINEN TEE", "HEAVY HOODIE", "ATELIER CAP"],
  },
  women: {
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=85",
    pieces: ["SILK SHELL", "RAW DENIM", "CANVAS TOTE"],
  },
};

export const IvorySplitHero = ({ menImage, womenImage }) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();
  const m = menImage || DEFAULTS.men.image;
  const w = womenImage || DEFAULTS.women.image;

  return (
    <section
      ref={ref}
      data-testid="ivory-split-hero"
      className={`relative w-full overflow-hidden bg-[#F8F5EE] lx-reveal ${visible ? "is-visible" : ""}`}
      style={{ minHeight: "720px", height: "calc(100vh - 70px)" }}
    >
      {/* Editorial topline */}
      <div className="absolute top-0 left-0 right-0 z-20 mx-auto flex max-w-[1800px] items-center justify-between px-6 pt-5 sm:px-12">
        <div className="text-[10px] uppercase tracking-[0.45em] text-[#1F1B14]/55">
          Atelier · Spring MMXXVI
        </div>
        <div className="hidden text-[10px] uppercase tracking-[0.45em] text-[#1F1B14]/55 sm:block">
          {t("hero.promo_b")}
        </div>
      </div>

      <div className="grid h-full w-full grid-cols-2 gap-px bg-[#E8DCC4]">
        {/* MEN side */}
        <Link
          to="/shop/men"
          data-testid="split-hero-men"
          className="group relative block h-full overflow-hidden bg-[#EFE9DD]"
        >
          <img
            src={m}
            alt="Men"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
          />
          {/* Soft warm tone overlay — gives the ivory cohesion */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8F5EE]/10 via-transparent to-[#1F1B14]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F1B14]/10 to-transparent" />

          {/* Vertical edition label */}
          <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2">
            <div className="ix-vertical text-[10px] uppercase tracking-[0.5em] text-[#F8F5EE]/85">
              EDITION · I · MMXXVI
            </div>
          </div>

          {/* Bottom-left brand info */}
          <div className="absolute bottom-10 left-6 right-6 sm:bottom-14 sm:left-14">
            <div className="text-[10px] uppercase tracking-[0.45em] text-[#F8F5EE]/85">
              The Gentleman's Edit
            </div>
            <div
              className="font-display mt-4 leading-[0.85] text-[#F8F5EE]"
              style={{ fontSize: "clamp(56px, 9vw, 156px)", letterSpacing: "-0.005em" }}
            >
              {t("nav.men").toUpperCase()}
            </div>
            <div className="mt-5 hidden flex-wrap gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.3em] text-[#F8F5EE]/70 sm:flex">
              {DEFAULTS.men.pieces.map((it, i) => (
                <span key={it}>{i > 0 && <span className="mr-5 text-[#B89968]">·</span>}{it}</span>
              ))}
            </div>
            {/* CTA */}
            <div className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-[#F8F5EE] transition-all group-hover:gap-4">
              {t("split.shop")}
              <span className="block h-px w-10 bg-[#F8F5EE] transition-all group-hover:w-14 group-hover:bg-[#B89968]" />
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
            </div>
          </div>
        </Link>

        {/* WOMEN side */}
        <Link
          to="/shop/women"
          data-testid="split-hero-women"
          className="group relative block h-full overflow-hidden bg-[#F2EDE2]"
        >
          <img
            src={w}
            alt="Women"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8F5EE]/10 via-transparent to-[#1F1B14]/35" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#1F1B14]/10 to-transparent" />

          <div className="absolute right-5 top-1/2 z-10 -translate-y-1/2">
            <div className="ix-vertical text-[10px] uppercase tracking-[0.5em] text-[#F8F5EE]/85" style={{ transform: "rotate(180deg)" }}>
              EDITION · II · MMXXVI
            </div>
          </div>

          <div className="absolute bottom-10 left-6 right-6 text-right sm:bottom-14 sm:right-14">
            <div className="text-[10px] uppercase tracking-[0.45em] text-[#F8F5EE]/85">
              The Quiet Wardrobe
            </div>
            <div
              className="font-display mt-4 leading-[0.85] text-[#F8F5EE]"
              style={{ fontSize: "clamp(56px, 9vw, 156px)", letterSpacing: "-0.005em" }}
            >
              {t("nav.women").toUpperCase()}
            </div>
            <div className="mt-5 hidden flex-wrap justify-end gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.3em] text-[#F8F5EE]/70 sm:flex">
              {DEFAULTS.women.pieces.map((it, i) => (
                <span key={it}>{it}{i < DEFAULTS.women.pieces.length - 1 && <span className="ml-5 text-[#B89968]">·</span>}</span>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-[#F8F5EE] transition-all group-hover:gap-4">
              <ArrowUpRight className="h-3.5 w-3.5 -scale-x-100 transition-transform group-hover:-rotate-12" />
              <span className="block h-px w-10 bg-[#F8F5EE] transition-all group-hover:w-14 group-hover:bg-[#B89968]" />
              {t("split.shop")}
            </div>
          </div>
        </Link>
      </div>

      {/* Center brand seal — ivory monogram floating over the divide */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="ix-glass inline-flex flex-col items-center gap-2 rounded-none px-8 py-6">
          <div className="text-[9px] uppercase tracking-[0.5em] text-[#1F1B14]/70">
            Atelier
          </div>
          <div
            className="font-display text-[#1F1B14]"
            style={{ fontSize: "clamp(20px, 1.8vw, 30px)", letterSpacing: "0.32em" }}
          >
            TUNCEL · RIGA
          </div>
          <div className="ix-gold-line w-12" />
          <div className="text-[9px] uppercase tracking-[0.4em] text-[#1F1B14]/55">
            MMXXVI
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.5em] text-[#F8F5EE]/60">
        {t("split.scroll")}
      </div>
    </section>
  );
};

export default IvorySplitHero;
