import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div data-testid="about-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
          The studio
        </div>
        <h1 className="font-display mt-3 text-7xl uppercase leading-[0.9] tracking-[0.02em] sm:text-[10rem]">
          Two of us.
          <br />
          One press.
        </h1>
      </section>

      <section className="grid grid-cols-1 gap-16 py-20 md:grid-cols-2">
        <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <img
            src="https://images.pexels.com/photos/2540152/pexels-photo-2540152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900"
            alt="Studio"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="font-display text-3xl uppercase leading-[1.1] tracking-[0.02em] sm:text-4xl">
            Tuncel Textile is an independent print studio founded by two friends.
          </p>
          <p className="mt-8 text-[15px] leading-relaxed text-neutral-700">
            Every hoodie, every t-shirt, every accessory is hand-printed in our studio in Istanbul.
            We produce in small editions — twenty to fifty pieces per drop — using heavyweight cotton
            and water-based inks. Once a print sells out, it doesn’t come back.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
            We design what we want to wear. The graphics are loud, but the construction is quiet:
            sturdy seams, oversized fits, fabrics that age well. Our work sits at the intersection of
            editorial fashion and street craft.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-black/10 pt-8">
            {[
              { k: "Founded", v: "2026" },
              { k: "Studio", v: "Istanbul" },
              { k: "Run size", v: "≤ 50" },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{s.k}</div>
                <div className="font-display mt-1 text-3xl tracking-[0.02em]">{s.v}</div>
              </div>
            ))}
          </div>

          <Link
            to="/shop/all"
            className="mt-10 inline-flex items-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            See the latest drop →
          </Link>
        </div>
      </section>
    </div>
  );
}
