import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";
import { useCms } from "@/contexts/CmsContext";

/**
 * HellenisticCampaign — cinematic single-drop showcase using the brand's
 * "HELLENISTIC ASCENSION" / "DIVINE DECAY" hero images uploaded via admin.
 *
 * Light luxury palette: ivory, champagne, soft sand, muted olive.
 * Editorial layout: oversized roman numeral on left, layered images on right.
 */
export const HellenisticCampaign = () => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();
  const { heroSlides } = useCms();
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    if (heroSlides && heroSlides.length > 0) setSlides(heroSlides);
  }, [heroSlides]);

  const main = slides[0];
  const secondary = slides[1] || slides[0];
  const pickText = (obj, fallback = "") => (obj && (obj.en || Object.values(obj)[0])) || fallback;

  return (
    <section
      ref={ref}
      data-testid="hellenistic-campaign-section"
      className={`relative overflow-hidden bg-[#EAE3D4] text-[#0A0A0A] lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="ax-grain pointer-events-none absolute inset-0" />

      {/* Editorial top bar */}
      <div className="relative z-10 mx-auto flex max-w-[1800px] items-center justify-between border-b border-[#0A0A0A]/10 px-6 py-6 sm:px-12">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-[#C4A56B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C4A56B]" />
          {t("hellenistic.label")}
        </div>
        <div className="hidden text-[10px] uppercase tracking-[0.5em] text-[#0A0A0A]/60 md:block">
          {t("hellenistic.coords")}
        </div>
        <div className="text-[10px] uppercase tracking-[0.5em] text-[#0A0A0A]/60">
          MMXXVI · ATELIER
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-1 px-6 pb-24 pt-16 sm:px-12 sm:pb-32 sm:pt-24 lg:grid-cols-[1fr_1.45fr] lg:gap-20 lg:pb-40 lg:pt-32">
        {/* LEFT — copy */}
        <div className="relative flex flex-col justify-between order-2 lg:order-1">
          <div>
            {/* Massive burgundy → brass Roman numeral */}
            <div
              aria-hidden
              className="font-display ax-foil-text select-none"
              style={{
                fontSize: "clamp(140px, 22vw, 380px)",
                lineHeight: 0.78,
                letterSpacing: "-0.02em",
              }}
            >
              I
            </div>

            <div className="mt-6 lg:mt-10">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.55em] text-[#C4A56B]">
                <span className="ax-seal !h-7 !w-7 !text-[10px]">I</span>
                {pickText(main?.kicker, "COLLECTION 01 · COMING SOON")}
              </div>
              <h2
                className="font-display mt-6 text-[#0A0A0A]"
                style={{ fontSize: "clamp(48px, 6.5vw, 116px)", lineHeight: 0.9, letterSpacing: "0.005em" }}
              >
                {pickText(main?.title, "Hellenistic")}
                <br />
                <span className="ax-foil-text">{pickText(secondary?.title, "Ascension")}</span>
              </h2>

              <p className="mt-8 max-w-md text-[15px] leading-[1.9] text-[#1A1A1A]">
                {pickText(main?.subtitle, t("hellenistic.body"))}
              </p>

              <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-[#0A0A0A]/12 pt-7">
                <Spec label={t("hellenistic.spec_a")} value="400 GSM" />
                <Spec label={t("hellenistic.spec_b")} value="100" />
                <Spec label={t("hellenistic.spec_c")} value="MMXXVI" />
              </div>

              <Link
                to="/shop/all"
                data-testid="hellenistic-shop-button"
                className="ax-btn mt-12 inline-flex"
              >
                {t("hellenistic.cta")}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT — layered Hellenistic imagery */}
        <div className="relative order-1 lg:order-2">
          {/* Vertical editorial label */}
          <div className="absolute -left-3 top-12 z-20 hidden lg:block">
            <div className="ax-vertical text-[10px] uppercase tracking-[0.55em] text-[#0A0A0A]/45">
              Campaign 26 / Studio · Ph. Atelier
            </div>
          </div>

          {main?.image_url && (
            <div className="relative aspect-[4/5] overflow-hidden bg-[#DDD3BD] sm:aspect-[3/4] lg:aspect-[4/5]">
              <img
                src={main.image_url}
                alt={pickText(main.title, "Hellenistic drop")}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover ${visible ? "lx-kenburns" : ""}`}
              />
              {/* Burgundy duotone wash — gives Italian dark academia feel */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A]/50 via-[#4A1818]/15 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/40 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div className="ax-glass px-4 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.35em] text-[#C4A56B]">
                    {pickText(main.kicker, "Featured piece")}
                  </div>
                  <div className="font-display mt-0.5 text-base uppercase tracking-[0.08em] text-[#0A0A0A]">
                    {pickText(main.title, "Hellenistic Ascension")}
                  </div>
                </div>
                <div className="hidden text-right text-[#F5F1E8] sm:block">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-[#F5F1E8]/85">
                    {t("hellenistic.from")}
                  </div>
                  <div className="font-display text-2xl">€89</div>
                </div>
              </div>
            </div>
          )}

          {secondary?.image_url && secondary.image_url !== main?.image_url && (
            <div className="absolute -bottom-10 right-0 hidden aspect-[3/4] w-[38%] overflow-hidden border-8 border-[#EAE3D4] shadow-2xl lg:block">
              <img
                src={secondary.image_url}
                alt={pickText(secondary.title)}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/65 via-[#4A1818]/15 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[9px] uppercase tracking-[0.4em] text-[#B89968]">
                  {pickText(secondary.kicker, "II · COLLECTION")}
                </div>
                <div className="font-display mt-1 text-base uppercase text-[#F5F1E8]">
                  {pickText(secondary.title, "Divine Decay")}
                </div>
              </div>
            </div>
          )}

          <div className="ax-brass-line mt-6 max-w-[60%]" />
        </div>
      </div>
    </section>
  );
};

const Spec = ({ label, value }) => (
  <div>
    <div className="text-[9px] uppercase tracking-[0.4em] text-[#0A0A0A]/50">{label}</div>
    <div className="font-display mt-2 text-sm uppercase tracking-[0.06em] text-[#0A0A0A]">{value}</div>
  </div>
);

export default HellenisticCampaign;
