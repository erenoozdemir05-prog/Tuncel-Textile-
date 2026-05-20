import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * EditorialProductCard — ultra-minimal Rick Owens / Balenciaga style card.
 * Image dominates. Tiny overline label + name + price on hover.
 */
export const EditorialProductCard = ({ product, index = 0 }) => {
  const { t } = useI18n();
  if (!product) return null;
  const price = `€${Number(product.price).toFixed(0)}`;

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`editorial-product-card-${product.id}`}
      className="lx-edcard group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0f0f11]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-95 transition-opacity duration-700 group-hover:opacity-100"
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {/* Edition tag */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-white/20 px-2 py-1 backdrop-blur-md">
          <span className="h-1 w-1 rounded-full bg-[#C8B38A]" />
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/80">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Hover quick-view affordance */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="lx-glass px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/90">
            {t("editorial.view")}
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">
            {t("editorial.atelier")}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="lx-edcard-meta mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.4em] text-white/40">
            {product.product_type || t("editorial.piece")}
          </div>
          <div className="lx-display mt-1.5 text-lg uppercase tracking-[0.04em] text-[#F5F4F0]">
            {product.name}
          </div>
        </div>
        <div className="lx-display whitespace-nowrap text-base text-[#C8B38A]">{price}</div>
      </div>
    </Link>
  );
};

export const FeaturedEditorial = ({ products = [] }) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();
  const list = products.slice(0, 4);

  if (list.length === 0) return null;

  return (
    <section
      ref={ref}
      data-testid="featured-products-grid"
      className={`relative overflow-hidden bg-[#0a0a0b] text-[#F5F4F0] lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="lx-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-24 sm:px-12 sm:py-32 lg:py-40">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.45em] text-[#C8B38A]">
              {t("featured.kicker")}
            </div>
            <h2
              className="lx-display mt-5 text-[#F5F4F0]"
              style={{ fontSize: "clamp(40px, 5.5vw, 88px)", lineHeight: 0.92 }}
            >
              {t("featured.title")}
            </h2>
          </div>
          <Link to="/shop/all" className="text-[10px] uppercase tracking-[0.45em] text-white/60 hover:text-[#C8B38A]" data-testid="featured-see-all">
            {t("featured.see_all")} →
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-20">
          {list.map((p, i) => (
            <EditorialProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEditorial;
