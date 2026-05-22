import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * Editorial product card — Atelier palette (parchment + burgundy + brass).
 * Used for the homepage featured grid AND inside Shop category pages.
 */
export const AtelierProductCard = ({ product, index = 0 }) => {
  const { t } = useI18n();
  if (!product) return null;
  const price = `€${Number(product.price).toFixed(0)}`;

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`atelier-product-card-${product.id}`}
      className="ax-edcard group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#DDD3BD]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Warm duotone */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/15 via-transparent to-transparent" />

        {/* Burgundy wax seal — top-left */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-[#0A0A0A]/15 bg-[#EAE3D4]/90 px-2.5 py-1 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C4A56B]" />
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#0A0A0A]/85">
            {String(index + 1).padStart(2, "0")} · ATELIER
          </span>
        </div>

        {/* Hover label */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="ax-glass px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#0A0A0A]/90">
            {t("editorial.view")}
          </span>
        </div>
      </div>

      <div className="ax-edcard-meta mt-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.4em] text-[#0A0A0A]/45">
            {product.product_type || t("editorial.piece")}
          </div>
          <div className="font-display mt-1.5 text-lg uppercase tracking-[0.04em] text-[#0A0A0A]">
            {product.name}
          </div>
        </div>
        <div className="font-display whitespace-nowrap text-base text-[#C4A56B]">{price}</div>
      </div>
    </Link>
  );
};

export const FeaturedAtelier = ({ products = [] }) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();
  const list = products.slice(0, 4);
  if (list.length === 0) return null;

  return (
    <section
      ref={ref}
      data-testid="featured-products-grid"
      className={`relative overflow-hidden bg-[#F5F1E8] text-[#0A0A0A] lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="ax-grain pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-[1800px] px-6 py-24 sm:px-12 sm:py-32 lg:py-40">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#0A0A0A]/12 pb-8">
          <div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.55em] text-[#C4A56B]">
              <span className="h-px w-10 bg-[#C4A56B]" />
              {t("featured.kicker")}
            </div>
            <h2
              className="font-display mt-5 text-[#0A0A0A]"
              style={{ fontSize: "clamp(40px, 5.5vw, 96px)", lineHeight: 0.9 }}
            >
              {t("featured.title")}
            </h2>
          </div>
          <Link
            to="/shop/all"
            className="text-[10px] uppercase tracking-[0.45em] text-[#0A0A0A]/70 hover:text-[#C4A56B]"
            data-testid="featured-see-all"
          >
            {t("featured.see_all")} →
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-20">
          {list.map((p, i) => (
            <AtelierProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAtelier;
