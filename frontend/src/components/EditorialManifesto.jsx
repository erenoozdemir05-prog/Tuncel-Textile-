import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * EditorialManifesto — magazine-spread atelier story.
 * Left: macro-fabric atelier image. Right: large editorial body type.
 * Asymmetric and "expensive" feeling.
 */
export const EditorialManifesto = ({
  image = "https://static.prod-images.emergentagent.com/jobs/e1b6f233-da0d-4100-be0c-1b168cd1aef1/images/57e5e1a9b60f5e46143661c884f813112731fd14cfa1e5d357e3c08b6a15500c.png",
}) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      data-testid="editorial-manifesto"
      className={`relative overflow-hidden bg-[#0f0f11] text-[#F5F4F0] lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="lx-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 gap-12 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-40">
        {/* LEFT — image with vertical label */}
        <div className="relative">
          <div className="absolute -left-2 top-0 z-10 hidden lg:block">
            <div className="lx-vertical text-[10px] uppercase tracking-[0.45em] text-white/40">
              The Atelier · Riga
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1d]">
            <img
              src={image}
              alt={t("editorial.image_alt")}
              className={`absolute inset-0 h-full w-full object-cover ${visible ? "lx-kenburns" : ""}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent" />
          </div>
          <div className="lx-gold-line mt-6 max-w-[160px]" />
          <div className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/40">
            EST. MMXXVI · TWO HANDS
          </div>
        </div>

        {/* RIGHT — manifesto body */}
        <div className="relative flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-[0.45em] text-[#C8B38A]">
            {t("editorial.kicker")}
          </div>
          <h2
            className="lx-display mt-6 text-[#F5F4F0]"
            style={{
              fontSize: "clamp(40px, 5.5vw, 88px)",
              lineHeight: 0.92,
            }}
          >
            {t("editorial.title_a")}
            <br />
            <span className="text-white/40">{t("editorial.title_b")}</span>
          </h2>

          <p className="mt-8 max-w-xl text-base leading-[1.85] text-white/65 sm:text-lg">
            {t("editorial.body_a")}
          </p>
          <p className="mt-5 max-w-xl text-base leading-[1.85] text-white/65 sm:text-lg">
            {t("editorial.body_b")}
          </p>

          {/* Stats row */}
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <Stat label={t("editorial.stat_a")} value="II" />
            <Stat label={t("editorial.stat_b")} value="48H" />
            <Stat label={t("editorial.stat_c")} value="01/100" />
          </div>

          <Link
            to="/about"
            className="lx-btn mt-12 inline-flex w-fit"
            data-testid="editorial-cta"
          >
            {t("editorial.cta")}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div className="lx-display text-3xl tracking-tight text-[#C8B38A] sm:text-4xl">{value}</div>
    <div className="mt-2 text-[9px] uppercase tracking-[0.35em] text-white/40">{label}</div>
  </div>
);

export default EditorialManifesto;
