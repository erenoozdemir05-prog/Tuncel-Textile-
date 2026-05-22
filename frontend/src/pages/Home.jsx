import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { useCms } from "@/contexts/CmsContext";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";

/* =================================================================
   PRADA / GUCCI EDITORIAL REDESIGN
   - Pure white canvas
   - Full-bleed cinematic single-hero
   - Horizontal product carousel
   - 3 stacked full-width category banners (Men / Women / Accessories)
   - Subtle deep emerald accent
   ================================================================= */

const ACCENT = "#1F4D3D"; // Gucci deep emerald

const pickText = (obj, fallback = "") =>
  (obj && (obj.en || Object.values(obj)[0])) || fallback;

/* ---------- Single full-bleed editorial hero ---------- */
const EditorialHero = () => {
  const { t } = useI18n();
  const { heroSlides } = useCms();
  const slide = heroSlides && heroSlides[0];
  const image =
    slide?.image_url ||
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85";
  const title = pickText(slide?.title, "HELLENISTIC ASCENSION");
  const kicker = pickText(slide?.kicker, "SPRING – SUMMER MMXXVI");

  return (
    <section
      data-testid="editorial-hero"
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "calc(100vh - 70px)", minHeight: "720px" }}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Top kicker */}
      <div className="absolute left-0 right-0 top-10 z-10 text-center">
        <div className="text-[10px] uppercase tracking-[0.55em] text-white/85">
          TUNCEL · RIGA
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.5em] text-white/65">
          {kicker}
        </div>
      </div>

      {/* Bottom title + CTA */}
      <div className="absolute bottom-14 left-0 right-0 z-10 px-6 text-center sm:bottom-20">
        <h1
          className="font-display mx-auto max-w-5xl text-white"
          style={{
            fontSize: "clamp(40px, 6vw, 100px)",
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          {title.toUpperCase()}
        </h1>
        <Link
          to="/shop/all"
          data-testid="hero-shop-cta"
          className="mt-8 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[11px] uppercase tracking-[0.4em] text-white transition hover:border-white"
        >
          {t("hero.cta_men")}
        </Link>
      </div>
    </section>
  );
};

/* ---------- Horizontal product carousel ---------- */
const ProductCarousel = ({ products = [], title, kicker, seeAllHref = "/shop/all" }) => {
  const scrollerRef = useRef(null);
  const { ref, visible } = useReveal();
  const { t } = useI18n();
  const list = products.slice(0, 12);

  const scrollBy = (dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    const card = node.querySelector("[data-card]");
    const dist = card ? card.getBoundingClientRect().width + 20 : 320;
    node.scrollBy({ left: dir * dist * 2, behavior: "smooth" });
  };

  if (!list.length) return null;

  return (
    <section
      ref={ref}
      data-testid="product-carousel"
      className={`relative bg-white text-black lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="mx-auto max-w-[1800px] px-6 pb-20 pt-24 sm:px-12">
        <div className="flex items-end justify-between border-b border-black/15 pb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.55em] text-black/55">
              {kicker}
            </div>
            <h2
              className="font-display mt-3 uppercase tracking-[0.03em]"
              style={{ fontSize: "clamp(28px, 3.5vw, 56px)", lineHeight: 1 }}
            >
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={seeAllHref}
              className="hidden text-[10px] uppercase tracking-[0.45em] text-black/70 hover:text-black sm:inline-block"
              data-testid="carousel-see-all"
            >
              {t("featured.see_all")} →
            </Link>
            <div className="ml-2 flex gap-1">
              <button
                aria-label="Prev"
                onClick={() => scrollBy(-1)}
                data-testid="carousel-prev"
                className="grid h-10 w-10 place-items-center border border-black/20 transition hover:border-black hover:bg-black hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next"
                onClick={() => scrollBy(1)}
                data-testid="carousel-next"
                className="grid h-10 w-10 place-items-center border border-black/20 transition hover:border-black hover:bg-black hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              data-card
              data-testid={`carousel-card-${p.id}`}
              className="group relative w-[78vw] flex-shrink-0 snap-start sm:w-[42vw] lg:w-[24vw]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1E8]">
                <img
                  src={p.image_url}
                  alt={p.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
                <button
                  type="button"
                  aria-label="Quick add"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center border border-black/15 bg-white/85 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.4em] text-black/45">
                    {p.product_type || "ATELIER"}
                  </div>
                  <div className="mt-1 text-[13px] uppercase tracking-[0.06em]">
                    {p.name}
                  </div>
                </div>
                <div className="whitespace-nowrap text-[13px]">
                  €{Number(p.price).toFixed(0)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

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

/* ---------- Editorial split (image + copy) ---------- */
const EditorialSplit = ({ image, kicker, title, body, ctaTo, ctaLabel, reverse, testid }) => {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      data-testid={testid}
      className={`relative bg-white text-black lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div
        className={`mx-auto grid max-w-[1800px] grid-cols-1 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-2 lg:gap-20 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F1E8] lg:aspect-auto">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="mt-12 flex flex-col justify-center lg:mt-0">
          <div className="text-[10px] uppercase tracking-[0.55em]" style={{ color: ACCENT }}>
            {kicker}
          </div>
          <h2
            className="font-display mt-5 uppercase"
            style={{ fontSize: "clamp(34px, 4.5vw, 76px)", letterSpacing: "0.025em", lineHeight: 1.05 }}
          >
            {title}
          </h2>
          <p className="mt-8 max-w-md text-[15px] leading-[1.9] text-black/70">{body}</p>
          {ctaTo && (
            <Link
              to={ctaTo}
              className="mt-10 inline-flex w-fit items-center gap-2 border border-black px-8 py-4 text-[11px] uppercase tracking-[0.35em] text-black transition hover:bg-black hover:text-white"
            >
              {ctaLabel}
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
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    fetchProducts({}).then(setProducts).catch(() => {});
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t("toasts.sub_thanks"));
    setEmail("");
  };

  return (
    <div data-testid="home-page" className="bg-white text-black">
      {/* 1 · Editorial hero */}
      <EditorialHero />

      {/* 2 · Horizontal carousel — Collection 01 */}
      <ProductCarousel
        products={products}
        kicker="COLLECTION I · MMXXVI"
        title="THE LATEST"
      />

      {/* 3 · Three full-bleed editorial category banners */}
      <div className="bg-white">
        <CategoryBanner
          to="/shop/women"
          label={t("nav.women")}
          kicker="THE QUIET WARDROBE · COLLECTION II"
          image="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=85"
          testid="cat-banner-women"
        />
        <CategoryBanner
          to="/shop/men"
          label={t("nav.men")}
          kicker="THE GENTLEMAN'S EDIT · COLLECTION I"
          image="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=2000&q=85"
          align="right"
          testid="cat-banner-men"
        />
        <CategoryBanner
          to="/shop/accessories"
          label={t("nav.accessories")}
          kicker="ATELIER OBJECTS · COLLECTION III"
          image="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=2000&q=85"
          testid="cat-banner-accessories"
        />
      </div>

      {/* 4 · Editorial manifesto split */}
      <EditorialSplit
        testid="editorial-manifesto"
        image="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=85"
        kicker="THE ATELIER"
        title="TWO HANDS. ONE ROOM."
        body="Tuncel Textile is a two-person atelier in Riga. Every piece is conceived, cut, finished and signed under one roof — never sub-contracted, never mass-produced. We make fewer pieces, on purpose."
        ctaTo="/about"
        ctaLabel="DISCOVER THE ATELIER"
      />

      {/* 5 · Bespoke / Custom split */}
      <EditorialSplit
        testid="bespoke-cta"
        reverse
        image="https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1400&q=85"
        kicker="BESPOKE · MADE FOR YOU"
        title="HAVE AN IDEA?"
        body="From a single tee for yourself to a small drop for your brand. No MOQ — start at just one piece. Free design consultation. Founders reply within 24 hours."
        ctaTo="/custom-request"
        ctaLabel="START A REQUEST"
      />

      {/* 6 · Gift card split */}
      <EditorialSplit
        testid="gift-cta"
        image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=85"
        kicker="GIFTS · TUNCEL CARD"
        title="A GIFT, EARNED."
        body={
          <>
            <span>Delivered instantly with a personal note. Valid 12 months, redeemable on every piece in the atelier.</span>
            <br /><br />
            <span data-testid="gift-single-use-note" className="text-[11px] uppercase tracking-[0.25em] text-black/55">
              SINGLE-USE · ONE GIFT CARD, ONE ORDER. ANY REMAINING BALANCE IS FORFEITED.
            </span>
          </>
        }
        ctaTo="/gift-cards"
        ctaLabel="SEND A GIFT CARD"
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
