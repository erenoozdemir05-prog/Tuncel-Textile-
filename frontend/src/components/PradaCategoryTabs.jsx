import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";

/**
 * PradaWomenMen — Prada-style horizontal "WOMEN | MEN" toggle.
 * Below the toggle: 4 product columns. When user switches, all 4 crossfade together.
 * Each column is a clickable category leading to its shop page.
 */

const COLUMNS = {
  women: [
    {
      label: "READY-TO-WEAR",
      to: "/shop/women?type=hoodie",
      image:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=85",
    },
    {
      label: "T-SHIRTS",
      to: "/shop/women?type=tshirt",
      image:
        "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=900&q=85",
    },
    {
      label: "BAGS",
      to: "/shop/accessories",
      image:
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=85",
    },
    {
      label: "ACCESSORIES",
      to: "/shop/accessories",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",
    },
  ],
  men: [
    {
      label: "READY-TO-WEAR",
      to: "/shop/men?type=hoodie",
      image:
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85",
    },
    {
      label: "T-SHIRTS",
      to: "/shop/men?type=tshirt",
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
    },
    {
      label: "BAGS",
      to: "/shop/accessories",
      image:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85",
    },
    {
      label: "ACCESSORIES",
      to: "/shop/accessories",
      image:
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=85",
    },
  ],
};

export const PradaCategoryTabs = () => {
  const { t } = useI18n();
  const [active, setActive] = useState("women");
  const [products, setProducts] = useState({ men: [], women: [] });

  // Pull real products to enrich tiles when available
  useEffect(() => {
    Promise.all([fetchProducts({ category: "women" }), fetchProducts({ category: "men" })])
      .then(([w, m]) => setProducts({ women: w || [], men: m || [] }))
      .catch(() => {});
  }, []);

  // Override tile images with real product images when we have them (first 4 per gender)
  const tiles = useMemo(() => {
    const base = COLUMNS[active];
    const real = (products[active] || []).slice(0, 4);
    if (real.length === 0) return base;
    return base.map((b, i) => ({
      ...b,
      image: real[i]?.image_url || b.image,
      productId: real[i]?.id,
    }));
  }, [active, products]);

  return (
    <section
      data-testid="prada-category-tabs"
      className="relative bg-white text-black"
    >
      {/* Top toggle bar — minimalist Prada-style underline */}
      <div className="border-y border-black/10">
        <div className="mx-auto flex max-w-[1800px] items-center justify-center gap-12 px-6 py-7 sm:gap-20 sm:px-12 sm:py-9">
          {["women", "men"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActive(g)}
              data-testid={`prada-toggle-${g}`}
              className="group relative pb-1 text-[12px] uppercase tracking-[0.45em] transition-colors"
              style={{ color: active === g ? "#0A0A0A" : "rgba(10,10,10,0.4)" }}
            >
              {t(`nav.${g}`)}
              <span
                className="absolute -bottom-0.5 left-0 h-px bg-black transition-all duration-500 ease-out"
                style={{ width: active === g ? "100%" : "0%" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product columns — crossfade on toggle change. Edge-to-edge like Prada (no gaps). */}
      <div className="mx-auto max-w-none px-0 py-0">
        <div
          key={active}
          data-testid={`prada-grid-${active}`}
          className="grid grid-cols-2 gap-[2px] lg:grid-cols-4"
          style={{ animation: "pradaFade 700ms ease-out both" }}
        >
          {tiles.map((tile, i) => (
            <Link
              key={tile.label + i}
              to={tile.productId ? `/product/${tile.productId}` : tile.to}
              data-testid={`prada-tile-${active}-${i}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1E8]">
                <img
                  src={tile.image}
                  alt={tile.label}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                />
                {/* Label overlaid at bottom on hover — keeps the grid pure imagery */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="font-prada text-center text-[12px] uppercase tracking-[0.3em] text-white">
                    {tile.label}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pradaFade {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default PradaCategoryTabs;
