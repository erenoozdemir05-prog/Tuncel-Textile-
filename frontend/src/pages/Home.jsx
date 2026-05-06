import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";

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

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchProducts({ featured: true }).then(setFeatured).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-[90vh] w-full overflow-hidden bg-black">
        <img
          src={HERO_IMG}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-14">
          <div className="text-[11px] uppercase tracking-[0.4em] text-white/80">
            Edition 01 · Spring 2026
          </div>
          <h1 className="font-display mt-4 text-[16vw] leading-[0.85] text-white sm:text-[12vw]">
            WEAR
            <br />
            <span className="tx-outline-text">THE&nbsp;PRINT</span>
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-md text-sm leading-relaxed text-white/85">
              A two-person studio printing limited-run hoodies, t-shirts and accessories.
              No seasons. No noise. Just type.
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
              <img
                src={c.img}
                alt={c.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 font-display text-[10vw] leading-none text-white sm:text-6xl">
                0{i + 1}
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div className="font-display text-4xl uppercase tracking-[0.04em] text-white sm:text-5xl">
                  {c.label}
                </div>
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
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
              Featured
            </div>
            <h2 className="font-display mt-2 text-5xl uppercase tracking-[0.04em] sm:text-6xl">
              The Drops
            </h2>
          </div>
          <Link to="/shop/all" className="tx-link text-[12px] uppercase tracking-[0.25em]">
            See All →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {featured.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="border-y border-black/10 bg-[#F5F5F5]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-24 sm:px-8 md:grid-cols-2">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-600">
            Manifesto / 01
          </div>
          <div>
            <p className="font-display text-3xl leading-[1.1] uppercase tracking-[0.02em] sm:text-5xl">
              Two of us. One press. Every garment passes through our hands before it reaches yours.
              We print in small editions — when they’re gone, they’re gone.
            </p>
            <Link to="/about" className="tx-link mt-10 inline-block text-[12px] uppercase tracking-[0.25em]">
              Read Our Story →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
