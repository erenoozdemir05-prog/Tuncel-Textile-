import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { IvorySplitHero } from "@/components/IvorySplitHero";
import { HellenisticCampaign } from "@/components/HellenisticCampaign";
import { FeaturedIvory } from "@/components/FeaturedIvory";
import { IvoryManifesto } from "@/components/IvoryManifesto";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [email, setEmail] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    fetchProducts({ featured: true })
      .then((items) => (items && items.length >= 4 ? items : fetchProducts({})))
      .then(setFeatured)
      .catch(() => {});
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t("toasts.sub_thanks"));
    setEmail("");
  };

  const bespoke = useReveal();
  const gift = useReveal();
  const news = useReveal();

  return (
    <div data-testid="home-page" className="bg-[#F8F5EE]">
      {/* 1 · Ivory Split Hero — light luxury men/women */}
      <IvorySplitHero />

      {/* 2 · Hellenistic Campaign — single-drop cinematic showcase */}
      <HellenisticCampaign />

      {/* 3 · Featured ivory editorial product grid */}
      <FeaturedIvory products={featured} />

      {/* 4 · Manifesto */}
      <IvoryManifesto />

      {/* 5 · Bespoke CTA */}
      <section
        ref={bespoke.ref}
        data-testid="bespoke-cta"
        className={`relative overflow-hidden bg-[#FBF8F2] text-[#1F1B14] lx-reveal ${bespoke.visible ? "is-visible" : ""}`}
      >
        <div className="ix-grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-1 gap-14 border-y border-[#1F1B14]/8 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-40">
          {/* Left: copy */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-[#B89968]">
                {t("bespoke.kicker")}
              </div>
              <h2
                className="font-display mt-6 text-[#1F1B14]"
                style={{ fontSize: "clamp(40px, 5.5vw, 96px)", lineHeight: 0.92 }}
              >
                {t("bespoke.title_a")}
                <br />
                <span className="text-[#1F1B14]/35">{t("bespoke.title_b")}</span>
              </h2>
              <p className="mt-8 max-w-md text-[15px] leading-[1.9] text-[#3A352B]">
                {t("bespoke.body")}
              </p>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Link to="/custom-request" data-testid="home-custom-cta" className="ix-btn">
                {t("bespoke.cta")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#1F1B14]/45">
                {t("bespoke.from_label")}
              </span>
            </div>
          </div>

          {/* Right: ivory bento — process steps */}
          <div className="grid grid-cols-3 gap-px bg-[#1F1B14]/8">
            {[
              { label: t("bespoke.card_a_label"), body: t("bespoke.card_a_body") },
              { label: t("bespoke.card_b_label"), body: t("bespoke.card_b_body") },
              { label: t("bespoke.card_c_label"), body: t("bespoke.card_c_body") },
              { label: t("bespoke.card_d_label"), body: t("bespoke.card_d_body") },
              { label: t("bespoke.card_e_label"), body: t("bespoke.card_e_body") },
              { label: t("bespoke.card_f_label"), body: t("bespoke.card_f_body") },
            ].map((c) => (
              <div
                key={c.label}
                className="group bg-[#FBF8F2] p-6 transition-colors hover:bg-[#F2EDE2]"
              >
                <div className="text-[9px] uppercase tracking-[0.4em] text-[#1F1B14]/40">
                  {c.body}
                </div>
                <div className="font-display mt-3 text-xl uppercase tracking-[0.04em] text-[#1F1B14] transition-colors group-hover:text-[#B89968]">
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Gift card — ivory with warm gold accent */}
      <section
        ref={gift.ref}
        data-testid="gift-cta"
        className={`relative overflow-hidden bg-[#F8F5EE] text-[#1F1B14] lx-reveal ${gift.visible ? "is-visible" : ""}`}
      >
        <div className="ix-grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-1 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-40">
          {/* Left: card visual on champagne */}
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden bg-[#E8DCC4] sm:aspect-[6/5]">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=85"
                alt={t("gift.home_kicker")}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover ${gift.visible ? "lx-kenburns" : ""}`}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1F1B14]/40 via-transparent to-transparent" />

              {/* Floating gift card visual */}
              <div className="absolute bottom-6 left-6 right-6 ix-glass flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.5em] text-[#1F1B14]/65">
                    TUNCEL · GIFT
                  </div>
                  <div className="font-display mt-1 text-2xl tracking-[0.04em] text-[#1F1B14]">
                    €25 — €500
                  </div>
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#B89968]">
                  ···· ···· ···· ····
                </div>
              </div>
            </div>
            <div className="ix-gold-line mt-6" />
          </div>

          {/* Right: copy */}
          <div className="mt-12 flex flex-col justify-center lg:mt-0 lg:pl-12">
            <div className="text-[10px] uppercase tracking-[0.5em] text-[#B89968]">
              {t("gift.home_kicker")}
            </div>
            <h2
              className="font-display mt-6 text-[#1F1B14]"
              style={{ fontSize: "clamp(40px, 5.5vw, 96px)", lineHeight: 0.92 }}
            >
              <span className="block">{t("gift.home_title_a")}</span>
              <span className="ix-gold-text">{t("gift.home_title_b")}</span>
            </h2>
            <p className="mt-8 max-w-md text-[15px] leading-[1.9] text-[#3A352B]">{t("gift.home_body")}</p>
            <p className="mt-3 max-w-md text-[12px] uppercase tracking-[0.2em] text-[#1F1B14]/45" data-testid="gift-single-use-note">
              {t("gift.home_single_use_note")}
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Link to="/gift-cards" data-testid="home-gift-cta" className="ix-btn">
                {t("gift.home_cta")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#1F1B14]/45">
                {t("gift.home_sub")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7 · Newsletter */}
      <section
        ref={news.ref}
        className={`relative overflow-hidden bg-[#FBF8F2] text-[#1F1B14] lx-reveal ${news.visible ? "is-visible" : ""}`}
      >
        <div className="ix-grain pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1800px] border-t border-[#1F1B14]/8 px-6 py-20 sm:px-12 sm:py-28">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-[#B89968]">
                {t("sections.newsletter_kicker")}
              </div>
              <h2
                className="font-display mt-5 text-[#1F1B14]"
                style={{ fontSize: "clamp(36px, 4.5vw, 72px)", lineHeight: 0.95 }}
              >
                {t("sections.newsletter_title")}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-[#3A352B]/80">
                {t("sections.newsletter_body")}
              </p>
            </div>
            <form
              data-testid="newsletter-form"
              onSubmit={handleSubscribe}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("sections.email_ph")}
                data-testid="newsletter-input"
                className="flex-1 border-b border-[#1F1B14]/30 bg-transparent px-1 py-4 text-sm text-[#1F1B14] placeholder:text-[#1F1B14]/45 focus:border-[#B89968] focus:outline-none"
              />
              <button type="submit" data-testid="newsletter-submit" className="ix-btn">
                {t("sections.subscribe")} <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
