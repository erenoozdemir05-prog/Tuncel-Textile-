import React from "react";
import { Link } from "react-router-dom";
import { Award, Hand, Leaf, Scissors } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const WHATSAPP_HREF =
  "https://wa.me/37120677937?text=" + encodeURIComponent("Hello Tuncel Textile, I'd like to talk about a piece.");

export default function About() {
  const { t } = useI18n();
  return (
    <div data-testid="about-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      {/* HERO */}
      <section className="border-b border-black/10 py-20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("about.kicker")}</div>
        <h1 className="font-display mt-4 text-7xl uppercase leading-[0.9] tracking-[0.02em] sm:text-[10rem]">
          {t("about.title_a")}
          <br />
          {t("about.title_b")}
        </h1>
        <p className="mt-8 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          {t("about.intro")}
        </p>
      </section>

      {/* VALUES */}
      <section className="border-y border-black/10 bg-[#F7F6F3]">
        <div className="px-5 py-6 sm:px-8">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("about.values_kicker")}</div>
          <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em]">{t("about.values_title")}</h2>
        </div>
        <div className="grid grid-cols-1 gap-px bg-black/10 md:grid-cols-4">
          {[
            { icon: Hand, k: t("about.v1_t"), v: t("about.v1_b") },
            { icon: Scissors, k: t("about.v2_t"), v: t("about.v2_b") },
            { icon: Leaf, k: t("about.v3_t"), v: t("about.v3_b") },
            { icon: Award, k: t("about.v4_t"), v: t("about.v4_b") },
          ].map(({ icon: Icon, k, v }) => (
            <div key={k} className="bg-[#F7F6F3] p-8">
              <Icon className="h-5 w-5" />
              <div className="font-display mt-6 text-3xl uppercase tracking-[0.04em]">{k}</div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VISIT */}
      <section className="grid grid-cols-1 gap-12 py-24 md:grid-cols-2 md:gap-20">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("about.visit_kicker")}</div>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none tracking-[0.04em] sm:text-7xl">
            {t("about.visit_title")}
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-neutral-700">{t("about.visit_body")}</p>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="about-whatsapp"
            className="mt-8 inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
          >
            {t("about.visit_cta")}
          </a>
        </div>

        <div className="flex flex-col justify-center bg-black p-10 text-white">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/60">{t("about.cta_kicker")}</div>
          <h3 className="font-display mt-3 text-4xl uppercase tracking-[0.02em] sm:text-5xl">{t("about.cta_title")}</h3>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">{t("about.cta_body")}</p>
          <Link
            to="/shop/all"
            data-testid="about-shop-cta"
            className="mt-8 inline-flex w-fit items-center gap-2 bg-white px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-neutral-200"
          >
            {t("about.cta_btn")}
          </Link>
        </div>
      </section>
    </div>
  );
}
