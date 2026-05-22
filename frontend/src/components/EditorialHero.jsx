import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useCms } from "@/contexts/CmsContext";

const FALLBACK = [
  {
    image_url:
      "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/i2x1jl91_image.png",
    title: { en: "HELLENISTIC ASCENSION" },
    kicker: { en: "COLLECTION I" },
    gender: "men",
  },
  {
    image_url:
      "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/k3l9o3xm_image.png",
    title: { en: "DIVINE DECAY" },
    kicker: { en: "COLLECTION II" },
    gender: "women",
  },
];

const pickText = (obj, fb = "") => (obj && (obj.en || Object.values(obj)[0])) || fb;
const inferGender = (slide, i) => slide?.gender || (i === 0 ? "men" : "women");
const genderPath = (g) => (g === "women" ? "/shop/women" : g === "men" ? "/shop/men" : "/shop/all");
const genderLabel = (g, t) =>
  g === "women" ? t("nav.women") : g === "men" ? t("nav.men") : t("split.shop");

/**
 * EditorialHero — Prada-style single-image carousel.
 * One image at a time, navigated with left/right arrows + dot indicator.
 * Each slide knows its gender (men / women) and routes to the right collection.
 * Minimal overlay: small kicker top, big title centered.
 */
export const EditorialHero = () => {
  const { t } = useI18n();
  const { heroSlides } = useCms();
  const list = (heroSlides && heroSlides.length > 0 ? heroSlides : FALLBACK).slice(0, 6);
  const [i, setI] = useState(0);

  const slide = list[i];
  const gender = inferGender(slide, i);
  const title = pickText(slide?.title, "TUNCEL").toUpperCase();
  const kicker = pickText(slide?.kicker, "COLLECTION").toUpperCase();
  const image =
    slide?.image_url ||
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85";

  // Auto-advance every 7s
  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % list.length), 7000);
    return () => clearInterval(id);
  }, [list.length]);

  return (
    <section
      data-testid="editorial-hero"
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "calc(100vh - 78px)", minHeight: "700px" }}
    >
      {/* Stacked images for crossfade */}
      {list.map((s, idx) => (
        <img
          key={s.image_url + idx}
          src={s.image_url}
          alt={pickText(s.title)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Soft bottom gradient — keeps CTAs legible without dominating */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

      {/* Top kicker — env-aware */}
      <div className="absolute left-0 right-0 top-10 z-10 text-center">
        <div
          className="text-[10px] uppercase tracking-[0.55em] text-white"
          style={{ mixBlendMode: "difference" }}
          data-testid="hero-kicker"
        >
          {kicker} · {genderLabel(gender, t)}
        </div>
      </div>

      {/* Centered title — env-aware */}
      <h1
        className="font-display absolute left-1/2 top-1/2 z-10 w-[92%] -translate-x-1/2 -translate-y-1/2 text-center text-white"
        style={{
          fontSize: "clamp(48px, 8vw, 140px)",
          letterSpacing: "0.04em",
          lineHeight: 0.95,
          mixBlendMode: "difference",
        }}
        data-testid="hero-title"
      >
        {title}
      </h1>

      {/* Bottom CTA — links to the active gender's collection */}
      <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center">
        <Link
          to={genderPath(gender)}
          data-testid="hero-shop-cta"
          className="inline-flex items-center gap-3 border-b border-white/70 pb-1.5 text-[11px] uppercase tracking-[0.45em] text-white transition-all hover:gap-5"
        >
          {t("split.shop")} {genderLabel(gender, t)} →
        </Link>
      </div>

      {/* Auto-advance + dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {list.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            data-testid={`hero-dot-${idx}`}
            className={`h-1 transition-all ${
              idx === i ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default EditorialHero;
