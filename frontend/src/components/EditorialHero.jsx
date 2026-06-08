import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useCms } from "@/contexts/CmsContext";

const FALLBACK = [
  {
    image_url:
      "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/i2x1jl91_image.png",
    kicker: { en: "THE DIGITAL EDIT" },
    title: { en: "Hellenistic Ascension" },
    gender: "men",
  },
  {
    image_url:
      "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/k3l9o3xm_image.png",
    kicker: { en: "THE DIGITAL EDIT" },
    title: { en: "Divine Decay" },
    gender: "women",
  },
];

const pickText = (obj, fb = "") => (obj && (obj.en || Object.values(obj)[0])) || fb;
const inferGender = (slide, i) => slide?.gender || (i === 0 ? "men" : "women");
const genderPath = (g) => (g === "women" ? "/shop/women" : g === "men" ? "/shop/men" : "/shop/all");
const genderLabel = (g) => (g === "women" ? "FOR HER" : g === "men" ? "FOR HIM" : "SHOP");

/**
 * EditorialHero — Prada/Gucci-style single-image carousel.
 * One full-bleed image at a time. Bottom-center caption stack:
 *   THE DIGITAL EDIT
 *   <Title>
 *   FOR HER / FOR HIM (underlined)
 *   ● ○ ›  ← dots + chevron arrow navigation
 */
export const EditorialHero = () => {
  const { heroSlides } = useCms();
  const list = (heroSlides && heroSlides.length > 0 ? heroSlides : FALLBACK).slice(0, 6);
  const [i, setI] = useState(0);

  const slide = list[i];
  const gender = inferGender(slide, i);
  const title = pickText(slide?.title, "TUNCEL");
  const kicker = pickText(slide?.kicker, "THE DIGITAL EDIT").toUpperCase();

  const next = () => setI((p) => (p + 1) % list.length);
  const prev = () => setI((p) => (p - 1 + list.length) % list.length);

  // Auto-advance every 8s
  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % list.length), 8000);
    return () => clearInterval(id);
  }, [list.length]);

  return (
    <section
      data-testid="editorial-hero"
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100vh", minHeight: "700px" }}
    >
      {/* Stacked images for slow crossfade */}
      {list.map((s, idx) => (
        <img
          key={s.image_url + idx}
          src={s.image_url}
          alt={pickText(s.title)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1100ms] ease-out ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Soft bottom gradient — keeps caption legible on any image */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

      {/* Side arrows — large, subtle, hover reveals */}
      {list.length > 1 && (
        <>
          <button
            onClick={prev}
            data-testid="hero-arrow-prev"
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white/70 transition-all hover:text-white sm:left-8 sm:h-16 sm:w-16"
          >
            <ChevronLeft className="h-9 w-9" strokeWidth={1.2} />
          </button>
          <button
            onClick={next}
            data-testid="hero-arrow-next"
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-white/70 transition-all hover:text-white sm:right-8 sm:h-16 sm:w-16"
          >
            <ChevronRight className="h-9 w-9" strokeWidth={1.2} />
          </button>
        </>
      )}

      {/* Bottom-center caption block (matches Prada / Gucci editorial layout) */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-14 text-center text-white sm:pb-20">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.42em]"
          data-testid="hero-kicker"
        >
          {kicker}
        </div>

        <h1
          className="mt-5 font-display font-bold leading-[1.05] tracking-[0.005em]"
          style={{ fontSize: "clamp(40px, 6.5vw, 96px)" }}
          data-testid="hero-title"
        >
          {title}
        </h1>

        <Link
          to={genderPath(gender)}
          data-testid="hero-shop-cta"
          className="mt-7 inline-block pb-2 text-[12px] font-semibold uppercase tracking-[0.4em] [border-bottom:1px_solid_rgba(255,255,255,0.85)] transition-opacity hover:opacity-80"
        >
          {genderLabel(gender)}
        </Link>

        {/* Dots + chevron — clickable */}
        {list.length > 1 && (
          <div className="mt-7 flex items-center gap-5">
            <div className="flex items-center gap-3">
              {list.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setI(idx)}
                  data-testid={`hero-dot-${idx}`}
                  className="transition-all"
                >
                  <span
                    className={`block rounded-full ${
                      idx === i
                        ? "h-[7px] w-[7px] bg-white"
                        : "h-[7px] w-[7px] border border-white/80 bg-transparent"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={next}
              data-testid="hero-chevron-next"
              aria-label="Next"
              className="ml-1 text-white/85 transition-opacity hover:opacity-100"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EditorialHero;
