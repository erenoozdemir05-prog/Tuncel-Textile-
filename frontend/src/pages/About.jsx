import React from "react";
import { Link } from "react-router-dom";
import { Award, Hand, Leaf, Scissors } from "lucide-react";

const WHATSAPP_HREF =
  "https://wa.me/37120677937?text=" + encodeURIComponent("Hello Tuncel Textile, I'd like to talk about a piece.");

export default function About() {
  return (
    <div data-testid="about-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      {/* HERO */}
      <section className="border-b border-black/10 py-20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">The Atelier</div>
        <h1 className="font-display mt-4 text-7xl uppercase leading-[0.9] tracking-[0.02em] sm:text-[10rem]">
          Two hands.
          <br />
          One atelier.
        </h1>
        <p className="mt-8 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          Tuncel Textile is an independent atelier founded by two close collaborators. Every garment
          we release is conceived, cut, finished and quality-checked under one roof — never sub-contracted,
          never mass-produced. We make fewer pieces, on purpose.
        </p>
      </section>

      {/* QUOTE / EDITORIAL IMAGE */}
      <section className="grid grid-cols-1 gap-12 py-20 md:grid-cols-[5fr_7fr] md:gap-20">
        <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <img
            src="https://images.pexels.com/photos/2540152/pexels-photo-2540152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1400&w=1100"
            alt="Atelier"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Philosophy</div>
          <p className="font-display mt-3 text-3xl uppercase leading-[1.1] tracking-[0.02em] sm:text-5xl">
            “Quiet construction. Confident details. Pieces that age, not date.”
          </p>
          <p className="mt-8 text-[15px] leading-[1.8] text-neutral-700">
            We came from different cities and met over the same idea: clothing should be made the way it used
            to be made — slowly, intentionally, with the maker's signature on it. Every piece in our atelier
            begins with a sketch and ends with a hand-finished label. Nothing is touched by a faceless line.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-neutral-700">
            We work in editions of twenty to fifty, never more. When an edition closes, it doesn't return.
            What you wear from us is, by design, scarce.
          </p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="border-y border-black/10 bg-[#F7F6F3]">
        <div className="grid grid-cols-1 gap-px bg-black/10 md:grid-cols-4">
          {[
            { icon: Hand, k: "Made by hand", v: "Cut, finished and labelled by the founders themselves." },
            { icon: Scissors, k: "Considered cuts", v: "Heavyweight cottons. Generous proportions. Built for years." },
            { icon: Leaf, k: "Quietly responsible", v: "Water-based inks, recyclable mailers, low-volume runs." },
            { icon: Award, k: "Numbered editions", v: "Each release is signed, dated and never reproduced." },
          ].map(({ icon: Icon, k, v }) => (
            <div key={k} className="bg-[#F7F6F3] p-8">
              <Icon className="h-5 w-5" />
              <div className="font-display mt-6 text-3xl uppercase tracking-[0.04em]">{k}</div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDER STATS */}
      <section className="grid grid-cols-1 gap-12 py-24 md:grid-cols-2 md:gap-20">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">By the numbers</div>
          <h2 className="font-display mt-3 text-5xl uppercase leading-none tracking-[0.04em] sm:text-7xl">
            Small on purpose.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-black/15 pt-8">
            {[
              { k: "Founded", v: "2026" },
              { k: "Atelier", v: "Riga, Latvia" },
              { k: "Edition size", v: "20–50" },
              { k: "Founders", v: "Two" },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{s.k}</div>
                <div className="font-display mt-1 text-4xl tracking-[0.02em]">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center bg-black p-10 text-white">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/60">Speak with us</div>
          <h3 className="font-display mt-3 text-4xl uppercase tracking-[0.02em] sm:text-5xl">
            Bespoke, custom or wholesale?
          </h3>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
            Reach the founders directly. We handle every enquiry personally — usually the same day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="about-whatsapp"
              className="inline-flex items-center gap-2 bg-white px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-neutral-200"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="currentColor"><path d="M19.11 17.29c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.58-.49-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.08 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35zm-5.07 6.95h-.01a9.94 9.94 0 0 1-5.06-1.39l-.36-.21-3.76.99 1-3.67-.24-.38a9.93 9.93 0 0 1-1.52-5.3c0-5.49 4.47-9.96 9.97-9.96 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.92 7.04c0 5.49-4.47 9.96-9.98 9.96zm8.49-18.45A11.86 11.86 0 0 0 14.04 2C7.46 2 2.11 7.35 2.1 13.92c0 2.1.55 4.15 1.59 5.96L2 26l6.27-1.65a11.91 11.91 0 0 0 5.76 1.47h.01c6.58 0 11.93-5.35 11.94-11.92a11.85 11.85 0 0 0-3.49-8.46z" /></svg>
              WhatsApp +371 20677937
            </a>
            <a
              href="mailto:hello@tunceltextile.com"
              className="inline-flex items-center gap-2 border border-white/40 px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-white hover:text-black"
            >
              hello@tunceltextile.com
            </a>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <Link
          to="/shop/all"
          className="inline-flex items-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
        >
          Browse The Latest Edition →
        </Link>
      </section>
    </div>
  );
}
