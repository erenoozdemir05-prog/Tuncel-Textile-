import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * AtelierHero — clean editorial split hero.
 * NO center brand seal, NO black top bar.
 * Just two full-bleed images with text overlays.
 * Palette: deep black + warm cream + brushed brass accent.
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

export const AtelierHero = ({ menImage, womenImage }) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();
  const m = menImage || DEFAULTS.men.image;
  const w = womenImage || DEFAULTS.women.image;

  return (
    <section
      ref={ref}
      data-testid="atelier-hero"
      className={`relative w-full overflow-hidden bg-[#0A0A0A] lx-reveal ${visible ? "is-visible" : ""}`}
      style={{ minHeight: "780px", height: "calc(100vh - 70px)" }}
    >
      <div className="grid h-full w-full grid-cols-2">
        {/* MEN side */}
        <Link
          to="/shop/men"
          data-testid="split-hero-men"
          className="group relative block h-full overflow-hidden bg-[#0A0A0A]"
        >
          <img
            src={m}
            alt="Men"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-[1.05]"
          />
          {/* Clean editorial vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/20 to-[#0A0A0A]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/25 to-transparent" />

          {/* Top label — collection */}
          <div className="absolute left-6 top-6 z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-[#F5F1E8]/75 sm:left-12 sm:top-10">
            <span className="h-px w-8 bg-[#C4A56B]" />
            COLLECTION · I · MMXXVI
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-12 left-6 right-6 sm:bottom-16 sm:left-14">
            <div className="text-[10px] uppercase tracking-[0.5em] text-[#C4A56B]">
              The Gentleman's Edit
            </div>
            <div
              className="font-display mt-5 text-[#F5F1E8]"
              style={{
                fontSize: "clamp(64px, 10vw, 200px)",
                lineHeight: 0.82,
                letterSpacing: "-0.005em",
              }}
            >
              {t("nav.men").toUpperCase()}
            </div>
            <div className="mt-6 hidden flex-wrap items-center gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.35em] text-[#F5F1E8]/70 sm:flex">
              {DEFAULTS.men.pieces.map((it, i) => (
                <React.Fragment key={it}>
                  {i > 0 && <span className="text-[#C4A56B]">·</span>}
                  <span>{it}</span>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-[#F5F1E8] transition-all group-hover:gap-5">
              <span>{t("split.shop")}</span>
              <span className="block h-px w-10 bg-[#F5F1E8] transition-all group-hover:w-16 group-hover:bg-[#C4A56B]" />
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" />
            </div>
          </div>
        </Link>

        {/* WOMEN side */}
        <Link
          to="/shop/women"
          data-testid="split-hero-women"
          className="group relative block h-full overflow-hidden border-l border-[#C4A56B]/15 bg-[#0A0A0A]"
        >
          <img
            src={w}
            alt="Women"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/20 to-[#0A0A0A]/40" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0A0A0A]/25 to-transparent" />

          <div className="absolute right-6 top-6 z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-[#F5F1E8]/75 sm:right-12 sm:top-10">
            COLLECTION · II · MMXXVI
            <span className="h-px w-8 bg-[#C4A56B]" />
          </div>

          <div className="absolute bottom-12 left-6 right-6 text-right sm:bottom-16 sm:right-14">
            <div className="text-[10px] uppercase tracking-[0.5em] text-[#C4A56B]">
              The Quiet Wardrobe
            </div>
            <div
              className="font-display mt-5 text-[#F5F1E8]"
              style={{
                fontSize: "clamp(64px, 10vw, 200px)",
                lineHeight: 0.82,
                letterSpacing: "-0.005em",
              }}
            >
              {t("nav.women").toUpperCase()}
            </div>
            <div className="mt-6 hidden flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.35em] text-[#F5F1E8]/70 sm:flex">
              {DEFAULTS.women.pieces.map((it, i) => (
                <React.Fragment key={it}>
                  <span>{it}</span>
                  {i < DEFAULTS.women.pieces.length - 1 && <span className="text-[#C4A56B]">·</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-[#F5F1E8] transition-all group-hover:gap-5">
              <ArrowUpRight className="h-4 w-4 -scale-x-100 transition-transform duration-500 group-hover:-rotate-12" />
              <span className="block h-px w-10 bg-[#F5F1E8] transition-all group-hover:w-16 group-hover:bg-[#C4A56B]" />
              <span>{t("split.shop")}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.55em] text-[#F5F1E8]/55">
        {t("split.scroll")}
      </div>
    </section>
  );
};

export default AtelierHero;
