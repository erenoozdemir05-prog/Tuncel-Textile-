import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";
import { EditorialHero } from "@/components/EditorialHero";
import { PradaCategoryTabs } from "@/components/PradaCategoryTabs";
import { toast } from "sonner";

/* =================================================================
   PRADA / GUCCI EDITORIAL REDESIGN
   ================================================================= */

const ACCENT = "#1F4D3D";

/* ---------- Full-width editorial category banner ---------- */
const CategoryBanner = ({
  to,
  label,
  kicker,
  image,
  align = "left",
  testid,
}) => {
  const { ref, visible } = useReveal();
  return (
    <Link
      to={to}
      ref={ref}
      data-testid={testid}
      className={`group relative block w-full overflow-hidden bg-black lx-reveal ${visible ? "is-visible" : ""}`}
      style={{ minHeight: "640px", aspectRatio: "16/9" }}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/15" />

      <div
        className={`absolute inset-0 flex flex-col justify-end p-8 text-white sm:p-16 ${
          align === "right" ? "items-end text-right" : "items-start text-left"
        }`}
      >
        <div className="text-[10px] uppercase tracking-[0.55em] text-white/80">
          {kicker}
        </div>
        <div
          className="font-display mt-4 uppercase"
          style={{ fontSize: "clamp(54px, 8vw, 150px)", letterSpacing: "0.04em", lineHeight: 1 }}
        >
          {label.toUpperCase()}
        </div>
        <span className="mt-6 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[11px] uppercase tracking-[0.4em] text-white transition-all group-hover:gap-4">
          DISCOVER →
        </span>
      </div>
    </Link>
  );
};

/* ---------- Editorial split (image + copy) — Prada/Atelier manifesto layout ---------- */
const EditorialSplit = ({
  image,
  kicker,
  title,
  titleSecondary,
  body,
  bodySecondary,
  stats,
  ctaTo,
  ctaLabel,
  reverse,
  testid,
}) => {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      data-testid={testid}
      className={`relative bg-white text-black lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div
        className={`mx-auto grid max-w-[1800px] grid-cols-1 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-2 lg:gap-24 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F1E8] lg:aspect-auto">
          <img
            src={image}
            alt={typeof title === "string" ? title : "atelier"}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="mt-14 flex flex-col justify-center lg:mt-0">
          <div className="text-[10px] uppercase tracking-[0.55em]" style={{ color: ACCENT }}>
            {kicker}
          </div>
          <h2
            className="font-prada mt-7 font-bold leading-[0.95] tracking-[-0.005em]"
            style={{ fontSize: "clamp(48px, 5.8vw, 96px)", color: "#0A0A0A" }}
          >
            {title}
            {titleSecondary && (
              <>
                <br />
                <span style={{ color: "rgba(10,10,10,0.30)", fontWeight: 700 }}>
                  {titleSecondary}
                </span>
              </>
            )}
          </h2>
          <div className="mt-9 max-w-[460px] space-y-5 text-[15px] leading-[1.85] text-black/72">
            <p>{body}</p>
            {bodySecondary && <p>{bodySecondary}</p>}
          </div>

          {stats && stats.length > 0 && (
            <div className="mt-12 grid max-w-[460px] grid-cols-3 gap-6 border-t border-black/12 pt-10">
              {stats.map((s, i) => (
                <div key={i}>
                  <div
                    className="font-prada font-bold leading-none"
                    style={{ fontSize: "clamp(28px, 2.6vw, 42px)", color: ACCENT }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.42em] text-black/55">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {ctaTo && (
            <Link
              to={ctaTo}
              className="font-prada mt-12 inline-flex w-fit items-center gap-3 border border-black/85 px-9 py-4 text-[11px] uppercase tracking-[0.35em] text-black transition-all hover:bg-black hover:text-white"
            >
              <span>{ctaLabel}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M7 17L17 7" />
                <path d="M8 7H17V16" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

/* =================================================================
                              HOME
   ================================================================= */
export default function Home() {
  const [email, setEmail] = useState("");
  const { t } = useI18n();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t("toasts.sub_thanks"));
    setEmail("");
  };

  return (
    <div data-testid="home-page" className="bg-white text-black">
      {/* 1 · Editorial hero — Men/Women carousel from Hero Manager */}
      <EditorialHero />

      {/* 2 · Prada-style Women / Men toggle + 4-column product grid */}
      <PradaCategoryTabs />

      {/* 4 · Editorial manifesto split */}
      <EditorialSplit
        testid="editorial-manifesto"
        image="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=85"
        kicker="THE ATELIER · MANIFESTO"
        title="TWO HANDS."
        titleSecondary="ONE ROOM."
        body="Tuncel Textile is a two-person atelier in Riga. Every piece is conceived, cut, finished and signed under one roof — never sub-contracted, never mass-produced."
        bodySecondary="What we put out is what we'd wear ourselves. Heavy-gauge cotton. Hand-pulled prints. Editions of one hundred. When an edition closes — it does not return."
        stats={[
          { value: "II", label: "Founders" },
          { value: "48H", label: "Lead-time" },
          { value: "100", label: "Per edition" },
        ]}
        ctaTo="/about"
        ctaLabel="Discover the atelier"
      />

      {/* 5 · Bespoke / Custom split */}
      <EditorialSplit
        testid="bespoke-cta"
        reverse
        image="https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1400&q=85"
        kicker="BESPOKE · MADE FOR YOU"
        title="HAVE AN"
        titleSecondary="IDEA?"
        body="From a single tee for yourself to a small drop for your brand. No MOQ — start at just one piece, finish at one hundred."
        bodySecondary="Free design consultation. Hand-drawn mockup within 48 hours. Founders reply personally within one working day."
        stats={[
          { value: "1", label: "Min. quantity" },
          { value: "48H", label: "First mockup" },
          { value: "0€", label: "Consultation" },
        ]}
        ctaTo="/custom-request"
        ctaLabel="Start a request"
      />

      {/* 6 · Gift card split */}
      <EditorialSplit
        testid="gift-cta"
        image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=85"
        kicker="GIFTS · TUNCEL CARD"
        title="A GIFT,"
        titleSecondary="EARNED."
        body="Delivered instantly with a personal note. Valid twelve months, redeemable on every piece in the atelier."
        bodySecondary={
          <span data-testid="gift-single-use-note" className="text-[11px] uppercase tracking-[0.25em] text-black/55">
            SINGLE-USE · ONE GIFT CARD, ONE ORDER. ANY REMAINING BALANCE IS FORFEITED.
          </span>
        }
        ctaTo="/gift-cards"
        ctaLabel="Send a gift card"
      />

      {/* 7 · Newsletter — minimal centered */}
      <section className="bg-white">
        <div className="mx-auto max-w-[900px] border-t border-black/15 px-6 py-24 text-center sm:py-32">
          <div className="text-[10px] uppercase tracking-[0.55em]" style={{ color: ACCENT }}>
            NEWSLETTER
          </div>
          <h2
            className="font-display mt-5 uppercase"
            style={{ fontSize: "clamp(28px, 3.5vw, 56px)", letterSpacing: "0.04em", lineHeight: 1 }}
          >
            STAY IN THE ROOM.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-black/65">
            Limited drops, atelier journal, and early access — sent rarely, never sold.
          </p>
          <form
            data-testid="newsletter-form"
            onSubmit={handleSubscribe}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              data-testid="newsletter-input"
              className="flex-1 border-b border-black/40 bg-transparent px-1 py-3 text-center text-sm text-black placeholder:text-black/45 focus:border-black focus:outline-none sm:text-left"
            />
            <button
              type="submit"
              data-testid="newsletter-submit"
              className="border border-black px-8 py-3 text-[11px] uppercase tracking-[0.4em] text-black transition hover:bg-black hover:text-white"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
