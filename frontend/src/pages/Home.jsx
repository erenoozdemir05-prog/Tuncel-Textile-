import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { HeroSlider } from "@/components/HeroSlider";
import { useCms } from "@/contexts/CmsContext";
import { useI18n } from "@/contexts/I18nContext";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowRight, Hand, Layers, Package } from "lucide-react";
import { toast } from "sonner";

const LOOKBOOK = [
  "https://images.pexels.com/photos/8217340/pexels-photo-8217340.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/5868729/pexels-photo-5868729.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/8217430/pexels-photo-8217430.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
];

const cats = (t) => [
  { label: t("nav.men"), to: "/shop/men", img: "https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900" },
  { label: t("nav.women"), to: "/shop/women", img: "https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900" },
  { label: t("nav.accessories"), to: "/shop/accessories", img: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900" },
];

const PROCESS = [
  { icon: Layers, kicker: "Step 01", title: "Sketch", body: "Every piece begins as a hand-drawn study at our table. No templates, no resampled assets — only the founder's pencil." },
  { icon: Hand, kicker: "Step 02", title: "Craft", body: "Heavyweight cotton, water-based finishes, hand-pulled in small editions. Each garment is signed and numbered." },
  { icon: Package, kicker: "Step 03", title: "Deliver", body: "Folded and labelled by hand, packed in recyclable mailers. Dispatched within 48 hours from our atelier in Riga." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [email, setEmail] = useState("");
  const { t } = useI18n();
  const { heroSlides } = useCms();

  useEffect(() => {
    fetchProducts({ featured: true }).then(setFeatured).catch(() => {});
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list — first access to the next edition.");
    setEmail("");
  };

  return (
    <div data-testid="home-page">
      <HeroSlider slides={heroSlides} />

      {/* CATEGORY GRID */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display whitespace-pre-line text-5xl uppercase tracking-[0.04em] sm:text-7xl">
            {t("sections.three_rooms_title")}
          </h2>
          <Link to="/shop/all" className="tx-link hidden text-[12px] uppercase tracking-[0.25em] sm:block">
            {t("sections.view_everything")}
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {cats(t).map((c, i) => (
            <Link
              to={c.to}
              key={c.label || i}
              data-testid={`cat-card-${(c.label || "").toLowerCase()}`}
              className="group relative aspect-[3/4] overflow-hidden bg-neutral-100"
            >
              <img src={c.img} alt={c.label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 font-display text-[10vw] leading-none text-white sm:text-6xl">0{i + 1}</div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div className="font-display text-4xl uppercase tracking-[0.04em] text-white sm:text-5xl">{c.label}</div>
                <ArrowRight className="h-6 w-6 text-white transition-transform duration-500 group-hover:translate-x-2" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("sections.featured_kicker")}</div>
            <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-6xl">{t("sections.featured_title")}</h2>
          </div>
          <Link to="/shop/all" className="tx-link text-[12px] uppercase tracking-[0.25em]">{t("sections.see_all")}</Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {featured.slice(0, 8).map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      </section>

      {/* LOOKBOOK STRIP */}
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">{t("sections.lookbook_kicker")}</div>
              <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-7xl">{t("sections.lookbook_title")}</h2>
            </div>
            <Link to="/shop/all" className="tx-link hidden text-[12px] uppercase tracking-[0.25em] sm:block">{t("sections.view_edition")}</Link>
          </div>
        </div>
        <div className="mt-10 overflow-x-auto">
          <div className="mx-auto flex max-w-[1400px] gap-4 px-5 pb-3 sm:px-8">
            {LOOKBOOK.map((src, i) => (
              <div
                key={i}
                data-testid={`lookbook-img-${i}`}
                className="relative h-[420px] w-[280px] flex-shrink-0 overflow-hidden bg-neutral-900 sm:h-[520px] sm:w-[360px]"
              >
                <img src={src} alt={`Look ${i + 1}`} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                <div className="absolute left-3 top-3 bg-white/95 px-2 py-1 font-display text-[10px] uppercase tracking-[0.25em] text-black">
                  Look 0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-28">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("sections.process_kicker")}</div>
        <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-7xl">{t("sections.process_title")}</h2>
        <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-3">
          {PROCESS.map(({ icon: Icon, kicker, title, body }) => (
            <div key={title} data-testid={`process-step-${kicker.toLowerCase().replace(/\s+/g, "-")}`} className="border-t border-black/15 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{kicker}</span>
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display mt-6 text-5xl uppercase tracking-[0.04em]">{title}</div>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-neutral-700">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="border-y border-black/10 bg-[#F5F5F5]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-24 sm:px-8 md:grid-cols-2">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-600">{t("sections.manifesto_kicker")}</div>
          <div>
            <p className="font-display text-3xl leading-[1.1] uppercase tracking-[0.02em] sm:text-5xl">
              {t("sections.manifesto_body")}
            </p>
            <Link to="/about" className="tx-link mt-10 inline-block text-[12px] uppercase tracking-[0.25em]">
              {t("sections.meet_atelier")}
            </Link>
          </div>
        </div>
      </section>


      {/* GIFT CARD CTA */}
      <section className="border-b border-black/10" data-testid="gift-cta">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2">
          <div className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden bg-black p-10 text-white sm:aspect-auto sm:min-h-[420px]">
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15), transparent 50%)" }} />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/50">TUNCEL ATELIER</div>
              <div className="font-display mt-1 text-3xl uppercase tracking-[0.04em]">Gift card</div>
            </div>
            <div className="relative">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">From</div>
              <div className="font-display text-7xl uppercase leading-none tracking-[0.04em]">€25</div>
              <div className="mt-3 font-mono text-xs tracking-[0.2em] text-white/70">XXXX-XXXX-XXXX-XXXX</div>
            </div>
          </div>
          <div className="flex flex-col justify-center px-5 py-16 sm:px-12">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("gift.home_kicker")}</div>
            <h2 className="font-display mt-3 text-5xl uppercase leading-[0.95] tracking-[0.02em] sm:text-7xl">
              {t("gift.home_title_a")}
              <br />
              <span className="text-neutral-400">{t("gift.home_title_b")}</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-neutral-700">
              {t("gift.home_body")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/gift-cards"
                data-testid="home-gift-cta"
                className="group inline-flex items-center gap-3 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800"
              >
                {t("gift.home_cta")}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("gift.home_sub")}</span>
            </div>
          </div>
        </div>
      </section>


      {/* BESPOKE CTA — strong path into Custom Request */}
      <section className="border-b border-black/10 bg-white" data-testid="bespoke-cta">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-stretch px-0 sm:px-0 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-between gap-10 border-r border-black/10 px-5 py-20 sm:px-12 sm:py-24">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("bespoke.kicker")}</div>
              <h2 className="font-display mt-3 text-5xl uppercase leading-[0.95] tracking-[0.02em] sm:text-7xl">
                {t("bespoke.title_a")}
                <br />
                <span className="text-neutral-400">{t("bespoke.title_b")}</span>
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-neutral-700">
                {t("bespoke.body")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/custom-request"
                data-testid="home-custom-cta"
                className="group inline-flex items-center gap-3 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800"
              >
                {t("bespoke.cta")}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("bespoke.from_label")}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-black/10">
            {[
              { label: t("bespoke.card_a_label"), body: t("bespoke.card_a_body") },
              { label: t("bespoke.card_b_label"), body: t("bespoke.card_b_body") },
              { label: t("bespoke.card_c_label"), body: t("bespoke.card_c_body") },
              { label: t("bespoke.card_d_label"), body: t("bespoke.card_d_body") },
              { label: t("bespoke.card_e_label"), body: t("bespoke.card_e_body") },
              { label: t("bespoke.card_f_label"), body: t("bespoke.card_f_body") },
            ].map((c) => (
              <div key={c.label} className="bg-white p-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">{c.body}</div>
                <div className="font-display mt-2 text-2xl uppercase tracking-[0.04em]">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">{t("sections.newsletter_kicker")}</div>
            <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-7xl">{t("sections.newsletter_title")}</h2>
            <p className="mt-5 max-w-md text-sm text-white/70">
              {t("sections.newsletter_body")}
            </p>
          </div>
          <form
            data-testid="newsletter-form"
            onSubmit={handleSubscribe}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("sections.email_ph")}
              data-testid="newsletter-input"
              className="flex-1 border border-white/30 bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              data-testid="newsletter-submit"
              className="inline-flex items-center justify-center gap-2 bg-white px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-neutral-200"
            >
              {t("sections.subscribe")}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
