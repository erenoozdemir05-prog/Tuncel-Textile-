import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * IvoryManifesto — magazine-spread atelier story in light champagne palette.
 * Stone-tone fabric macro on left, oversized editorial body on right.
 */
export const IvoryManifesto = ({
  image = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85",
}) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      data-testid="editorial-manifesto"
      className={`relative overflow-hidden bg-[#F2EDE2] text-[#1F1B14] lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="ix-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-1 gap-14 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24 lg:py-40">
        {/* LEFT — fabric macro */}
        <div className="relative">
          <div className="absolute -left-2 top-0 z-10 hidden lg:block">
            <div className="ix-vertical text-[10px] uppercase tracking-[0.5em] text-[#1F1B14]/40">
              The Atelier · Riga
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#D6C8A8]">
            <img
              src={image}
              alt={t("editorial.image_alt")}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover ${visible ? "lx-kenburns" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1F1B14]/35 via-transparent to-[#F2EDE2]/15" />
          </div>
          <div className="ix-gold-line mt-6 max-w-[180px]" />
          <div className="mt-4 text-[10px] uppercase tracking-[0.45em] text-[#1F1B14]/50">
            EST. MMXXVI · TWO HANDS
          </div>
        </div>

        {/* RIGHT — manifesto body */}
        <div className="relative flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-[0.5em] text-[#B89968]">
            {t("editorial.kicker")}
          </div>
          <h2
            className="font-display mt-6 text-[#1F1B14]"
            style={{ fontSize: "clamp(40px, 5.5vw, 96px)", lineHeight: 0.92 }}
          >
            {t("editorial.title_a")}
            <br />
            <span className="text-[#1F1B14]/35">{t("editorial.title_b")}</span>
          </h2>

          <p className="mt-8 max-w-xl text-base leading-[1.9] text-[#3A352B] sm:text-lg">
            {t("editorial.body_a")}
          </p>
          <p className="mt-5 max-w-xl text-base leading-[1.9] text-[#3A352B] sm:text-lg">
            {t("editorial.body_b")}
          </p>

          {/* Stats */}
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-[#1F1B14]/12 pt-8">
            <Stat label={t("editorial.stat_a")} value="II" />
            <Stat label={t("editorial.stat_b")} value="48H" />
            <Stat label={t("editorial.stat_c")} value="100" />
          </div>

          <Link
            to="/about"
            className="ix-btn mt-12 inline-flex w-fit"
            data-testid="editorial-cta"
          >
            {t("editorial.cta")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div className="font-display text-3xl tracking-tight text-[#B89968] sm:text-4xl">{value}</div>
    <div className="mt-2 text-[9px] uppercase tracking-[0.4em] text-[#1F1B14]/50">{label}</div>
  </div>
);

export default IvoryManifesto;
