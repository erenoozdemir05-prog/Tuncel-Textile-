import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useCms } from "@/contexts/CmsContext";

const FALLBACK_MEN =
  "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/i2x1jl91_image.png";
const FALLBACK_WOMEN =
  "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/k3l9o3xm_image.png";

const pickText = (obj, fallback = "") =>
  (obj && (obj.en || Object.values(obj)[0])) || fallback;

/**
 * EditorialHero — Prada / Gucci cover split.
 * Two stacked cinematic images (Men + Women) using Hero Manager slides 1 and 2.
 * Headlines use mix-blend-mode:difference so the text auto-adapts to the underlying image color
 * (the "environment-aware color sampling" the user referenced).
 */
export const EditorialHero = () => {
  const { t } = useI18n();
  const { heroSlides } = useCms();
  const slides = heroSlides || [];

  const men = slides[0];
  const women = slides[1] || slides[0];

  const menImg = men?.image_url || FALLBACK_MEN;
  const womenImg = women?.image_url || FALLBACK_WOMEN;
  const menTitle = pickText(men?.title, "HELLENISTIC ASCENSION").toUpperCase();
  const womenTitle = pickText(women?.title, "DIVINE DECAY").toUpperCase();
  const menKicker = pickText(men?.kicker, "COLLECTION I · MEN").toUpperCase();
  const womenKicker = pickText(women?.kicker, "COLLECTION II · WOMEN").toUpperCase();

  return (
    <section
      data-testid="editorial-hero"
      className="relative grid w-full grid-cols-1 lg:grid-cols-2"
      style={{ minHeight: "calc(100vh - 70px)" }}
    >
      {/* LEFT — MEN */}
      <Link
        to="/shop/men"
        data-testid="split-hero-men"
        className="group relative block overflow-hidden bg-[#0A0A0A]"
        style={{ minHeight: "60vh" }}
      >
        <img
          src={menImg}
          alt={menTitle}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-[1.04]"
        />
        {/* Subtle bottom darkening for readability of small CTA */}
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        {/* Top kicker — env-aware */}
        <div className="absolute left-0 right-0 top-10 z-10 text-center">
          <div
            className="text-[10px] uppercase tracking-[0.55em] text-white"
            style={{ mixBlendMode: "difference" }}
          >
            {menKicker}
          </div>
        </div>

        {/* Center title — env-aware (mix-blend-difference: invert vs bg) */}
        <h1
          className="font-display absolute left-1/2 top-1/2 z-10 w-[90%] -translate-x-1/2 -translate-y-1/2 text-center text-white"
          style={{
            fontSize: "clamp(40px, 7vw, 120px)",
            letterSpacing: "0.04em",
            lineHeight: 0.95,
            mixBlendMode: "difference",
          }}
        >
          {menTitle}
        </h1>

        {/* Bottom CTA */}
        <div className="absolute bottom-12 left-0 right-0 z-10 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/85">
            {t("nav.men")}
          </span>
          <span className="mt-3 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[11px] uppercase tracking-[0.45em] text-white transition-all group-hover:gap-4">
            {t("split.shop")} →
          </span>
        </div>
      </Link>

      {/* RIGHT — WOMEN */}
      <Link
        to="/shop/women"
        data-testid="split-hero-women"
        className="group relative block overflow-hidden bg-[#0A0A0A] lg:border-l lg:border-white/10"
        style={{ minHeight: "60vh" }}
      >
        <img
          src={womenImg}
          alt={womenTitle}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        <div className="absolute left-0 right-0 top-10 z-10 text-center">
          <div
            className="text-[10px] uppercase tracking-[0.55em] text-white"
            style={{ mixBlendMode: "difference" }}
          >
            {womenKicker}
          </div>
        </div>

        <h1
          className="font-display absolute left-1/2 top-1/2 z-10 w-[90%] -translate-x-1/2 -translate-y-1/2 text-center text-white"
          style={{
            fontSize: "clamp(40px, 7vw, 120px)",
            letterSpacing: "0.04em",
            lineHeight: 0.95,
            mixBlendMode: "difference",
          }}
        >
          {womenTitle}
        </h1>

        <div className="absolute bottom-12 left-0 right-0 z-10 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/85">
            {t("nav.women")}
          </span>
          <span className="mt-3 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[11px] uppercase tracking-[0.45em] text-white transition-all group-hover:gap-4">
            {t("split.shop")} →
          </span>
        </div>
      </Link>
    </section>
  );
};

export default EditorialHero;
