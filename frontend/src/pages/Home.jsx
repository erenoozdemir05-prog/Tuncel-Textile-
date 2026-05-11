import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Hand, Layers, Package } from "lucide-react";
import { toast } from "sonner";

const HERO_IMG =
  "https://images.pexels.com/photos/30816952/pexels-photo-30816952.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1800";

const CATS = [
  {
    to: "/shop/men",
    label: "Men",
    img: "https://images.pexels.com/photos/2540152/pexels-photo-2540152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900",
  },
  {
    to: "/shop/women",
    label: "Women",
    img: "https://images.pexels.com/photos/8945179/pexels-photo-8945179.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900",
  },
  {
    to: "/shop/accessories",
    label: "Accessories",
    img: "https://images.pexels.com/photos/16039231/pexels-photo-16039231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900",
  },
];

const LOOKBOOK = [
  "https://images.pexels.com/photos/8217340/pexels-photo-8217340.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/5868729/pexels-photo-5868729.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
  "https://images.pexels.com/photos/8217430/pexels-photo-8217430.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
];

const PROCESS = [
  { icon: Layers, kicker: "Step 01", title: "Sketch", body: "Every piece begins as a hand-drawn study at our table. No templates, no resampled assets — only the founder's pencil." },
  { icon: Hand, kicker: "Step 02", title: "Craft", body: "Heavyweight cotton, water-based finishes, hand-pulled in small editions. Each garment is signed and numbered." },
  { icon: Package, kicker: "Step 03", title: "Deliver", body: "Folded and labelled by hand, packed in recyclable mailers. Dispatched within 48 hours from our atelier in Riga." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProducts({ featured: true }).then(setFeatured).catch(() => {});
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list — first dibs on the next drop.");
    setEmail("");
  };

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-[90vh] w-full overflow-hidden bg-black">
        <img src={HERO_IMG} alt="Hero" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-14">
          <div className="text-[11px] uppercase tracking-[0.4em] text-white/80">Edition 01 · Spring 2026</div>
          <h1 className="font-display mt-4 text-[16vw] leading-[0.85] text-white sm:text-[12vw]">
            HAND
            <br />
            <span className="tx-outline-text">CRAFTED</span>
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-md text-sm leading-relaxed text-white/85">
              A two-person atelier crafting limited-run hoodies, tees and accessories. Every piece
              cut, finished and signed by the founders themselves.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop/men"
                data-testid="hero-cta-men"
                className="inline-flex items-center gap-2 bg-white px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white"
              >
                Shop Men <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop/women"
                data-testid="hero-cta-women"
                className="inline-flex items-center gap-2 border border-white/70 px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
              >
                Shop Women <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-5xl uppercase tracking-[0.04em] sm:text-7xl">
            Three rooms.
            <br />One language.
          </h2>
          <Link to="/shop/all" className="tx-link hidden text-[12px] uppercase tracking-[0.25em] sm:block">
            View Everything →
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CATS.map((c, i) => (
            <Link
              to={c.to}
              key={c.label}
              data-testid={`cat-card-${c.label.toLowerCase()}`}
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
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Featured</div>
            <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-6xl">The Drops</h2>
          </div>
          <Link to="/shop/all" className="tx-link text-[12px] uppercase tracking-[0.25em]">See All →</Link>
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
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">Lookbook</div>
              <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-7xl">Worn With Pride</h2>
            </div>
            <Link to="/shop/all" className="tx-link hidden text-[12px] uppercase tracking-[0.25em] sm:block">View Edition →</Link>
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
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Atelier process</div>
        <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-7xl">How it’s made</h2>
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
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-600">Manifesto / 01</div>
          <div>
            <p className="font-display text-3xl leading-[1.1] uppercase tracking-[0.02em] sm:text-5xl">
              Two of us. One atelier. Every garment passes through our hands before it reaches yours. We craft in small editions — when an edition closes, it never returns.
            </p>
            <Link to="/about" className="tx-link mt-10 inline-block text-[12px] uppercase tracking-[0.25em]">
              Meet The Atelier →
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">Newsletter</div>
            <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-7xl">First In Line</h2>
            <p className="mt-5 max-w-md text-sm text-white/70">
              Editions sell out quickly. Receive a 24-hour heads-up before each release leaves the atelier.
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
              placeholder="your@email.com"
              data-testid="newsletter-input"
              className="flex-1 border border-white/30 bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              data-testid="newsletter-submit"
              className="inline-flex items-center justify-center gap-2 bg-white px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-neutral-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
