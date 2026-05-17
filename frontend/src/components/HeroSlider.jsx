import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const FALLBACK_HERO = {
  image_url: "https://images.pexels.com/photos/30816952/pexels-photo-30816952.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1800",
  blur_enabled: true,
  overlay_opacity: 0.45,
  cta_url: "/shop/all",
};

export const HeroSlider = ({ slides = [] }) => {
  const { locale, t } = useI18n();
  const [idx, setIdx] = useState(0);
  const [animDir, setAnimDir] = useState(1);
  const list = slides.length > 0 ? slides : [FALLBACK_HERO];

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => {
      setAnimDir(1);
      setIdx((i) => (i + 1) % list.length);
    }, 8000);
    return () => clearInterval(id);
  }, [list.length]);

  const go = (dir) => {
    setAnimDir(dir);
    setIdx((i) => (i + dir + list.length) % list.length);
  };

  const s = list[idx] || list[0];
  const pick = (obj, def = "") => (obj && (obj[locale] || obj.en)) || def;
  const fallbackMode = slides.length === 0;
  const overlay = Math.min(0.85, Math.max(0, s.overlay_opacity ?? 0.45));

  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-black" data-testid="hero-slider">
      {/* Background media — keyed so each slide remounts with fade animation */}
      <div key={idx} className={`absolute inset-0 ${animDir > 0 ? "animate-[txFadeRight_900ms_cubic-bezier(0.22,1,0.36,1)]" : "animate-[txFadeLeft_900ms_cubic-bezier(0.22,1,0.36,1)]"}`}>
        {s.video_url ? (
          <video src={s.video_url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <picture>
            {s.mobile_image_url && <source media="(max-width: 640px)" srcSet={s.mobile_image_url} />}
            <img src={s.image_url || FALLBACK_HERO.image_url} alt="Hero" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
        )}
      </div>
      {s.blur_enabled && <div className="absolute inset-0 backdrop-blur-[1px]" />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />

      <div key={`copy-${idx}`} className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20 animate-[txFadeUp_700ms_cubic-bezier(0.22,1,0.36,1)]">
        <div className="text-[11px] uppercase tracking-[0.4em] text-white/80">
          {fallbackMode ? t("hero.kicker") : pick(s.kicker, t("hero.kicker"))}
        </div>
        <h1 className="font-display mt-4 text-[16vw] leading-[0.85] text-white sm:text-[12vw]">
          {fallbackMode ? (
            <>
              {t("hero.title_top")}
              <br />
              <span className="tx-outline-text">{t("hero.title_bottom")}</span>
            </>
          ) : (
            <>
              {pick(s.title).split(" ").slice(0, 1).join(" ") || pick(s.title)}
              {pick(s.title).split(" ").length > 1 && (
                <>
                  <br />
                  <span className="tx-outline-text">{pick(s.title).split(" ").slice(1).join(" ")}</span>
                </>
              )}
            </>
          )}
        </h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-md text-sm leading-relaxed text-white/85">
            {fallbackMode ? t("hero.sub") : pick(s.subtitle, t("hero.sub"))}
          </p>
          <div className="flex flex-wrap gap-3">
            {fallbackMode ? (
              <>
                <Link to="/shop/men" className="inline-flex items-center gap-2 bg-white px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white">
                  {t("hero.cta_men")} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/shop/women" className="inline-flex items-center gap-2 border border-white/70 px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black">
                  {t("hero.cta_women")} <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <Link to={s.cta_url || "/shop/all"} className="inline-flex items-center gap-2 bg-white px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white">
                {pick(s.cta_label, "Discover") || "Discover"} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Arrows */}
      {list.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            data-testid="hero-prev"
            className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/30 text-white backdrop-blur-md transition-all hover:border-white hover:bg-white hover:text-black md:flex"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            data-testid="hero-next"
            className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/30 text-white backdrop-blur-md transition-all hover:border-white hover:bg-white hover:text-black md:flex"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Slide indicators */}
      {list.length > 1 && (
        <div className="absolute bottom-6 right-5 z-20 flex gap-2 sm:right-8">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAnimDir(i > idx ? 1 : -1); setIdx(i); }}
              aria-label={`Slide ${i + 1}`}
              data-testid={`hero-dot-${i}`}
              className={`h-1.5 transition-all ${i === idx ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
