import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * CampaignShowcase — single-drop cinematic campaign section.
 * Replaces the broken 3-card "EDITIONS · DROPS" strip.
 * Editorial fashion-house layout: massive number on the left, full-bleed campaign image on the right.
 */
export const CampaignShowcase = ({
  editionLabel = "Edition 01",
  campaignTitle = ["Static.", "Noise.", "Signal."],
  campaignSubtitle,
  campaignImage = "https://static.prod-images.emergentagent.com/jobs/e1b6f233-da0d-4100-be0c-1b168cd1aef1/images/e89cd92d128a71ee819922d7860736bd1ba516504a1f85312452da0797282fd1.png",
  ctaTo = "/shop/all",
}) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      data-testid="campaign-showcase-section"
      className={`relative overflow-hidden bg-[#0a0a0b] text-[#F5F4F0] lx-reveal ${visible ? "is-visible" : ""}`}
    >
      {/* Background grain */}
      <div className="lx-grain pointer-events-none absolute inset-0" />

      {/* Top edition marker */}
      <div className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 pt-16 sm:px-12 sm:pt-24">
        <div className="text-[10px] uppercase tracking-[0.45em] text-white/45">
          {t("campaign.label")} · MMXXVI
        </div>
        <div className="hidden text-[10px] uppercase tracking-[0.45em] text-white/45 sm:block">
          {t("campaign.coordinates")}
        </div>
      </div>

      {/* Main editorial split */}
      <div className="relative z-10 mx-auto mt-6 grid max-w-[1600px] grid-cols-1 gap-8 px-6 pb-20 sm:px-12 sm:pb-28 lg:grid-cols-[1fr_1.35fr] lg:gap-16 lg:pb-40">
        {/* LEFT — copy */}
        <div className="relative flex flex-col justify-between order-2 lg:order-1">
          {/* Massive edition number — outlined */}
          <div
            aria-hidden
            className="lx-display select-none text-[#F5F4F0]"
            style={{
              fontSize: "clamp(140px, 22vw, 360px)",
              lineHeight: 0.78,
              letterSpacing: "-0.02em",
              WebkitTextStroke: "1.2px rgba(245,244,240,0.5)",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            01
          </div>

          {/* Edition title */}
          <div className="mt-8 lg:mt-12">
            <div className="text-[10px] uppercase tracking-[0.45em] text-[#C8B38A]">
              {editionLabel}
            </div>
            <h2
              className="lx-display mt-5 text-[#F5F4F0]"
              style={{
                fontSize: "clamp(48px, 6.5vw, 96px)",
                lineHeight: 0.92,
                letterSpacing: "0.005em",
              }}
            >
              {campaignTitle.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p className="mt-8 max-w-md text-[14px] leading-[1.85] text-white/60 sm:text-[15px]">
              {campaignSubtitle || t("campaign.body")}
            </p>

            {/* Specs row */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <Spec label={t("campaign.spec_a")} value={t("campaign.spec_a_v")} />
              <Spec label={t("campaign.spec_b")} value={t("campaign.spec_b_v")} />
              <Spec label={t("campaign.spec_c")} value={t("campaign.spec_c_v")} />
            </div>

            {/* CTA */}
            <Link
              to={ctaTo}
              data-testid="campaign-shop-button"
              className="lx-btn mt-12 inline-flex"
            >
              {t("campaign.cta")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT — campaign image */}
        <div className="relative order-1 lg:order-2">
          {/* Editorial label on the image */}
          <div className="absolute -left-3 top-12 z-20 hidden lg:block">
            <div className="lx-vertical text-[10px] uppercase tracking-[0.5em] text-white/40">
              {t("campaign.editorial_label")} · PH. ATELIER
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-[#0f0f11] sm:aspect-[3/4] lg:aspect-[4/5]">
            <img
              src={campaignImage}
              alt={t("campaign.alt")}
              className={`absolute inset-0 h-full w-full object-cover ${visible ? "lx-kenburns" : ""}`}
              loading="lazy"
            />
            {/* Layered shadow — vignette bottom + side */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-transparent" />

            {/* Corner caption (glass blur) */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div className="lx-glass px-4 py-2.5">
                <div className="text-[9px] uppercase tracking-[0.35em] text-white/55">
                  {t("campaign.caption_kicker")}
                </div>
                <div className="lx-display mt-0.5 text-base uppercase tracking-[0.08em] text-white">
                  Static / Noise Hoodie
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                  {t("campaign.from")}
                </div>
                <div className="lx-display text-2xl text-white">€89</div>
              </div>
            </div>
          </div>

          {/* Soft gold hairline beneath image */}
          <div className="lx-gold-line mt-6" />
        </div>
      </div>
    </section>
  );
};

const Spec = ({ label, value }) => (
  <div>
    <div className="text-[9px] uppercase tracking-[0.3em] text-white/40">{label}</div>
    <div className="lx-display mt-2 text-sm uppercase tracking-[0.06em] text-[#F5F4F0]">{value}</div>
  </div>
);

export default CampaignShowcase;
