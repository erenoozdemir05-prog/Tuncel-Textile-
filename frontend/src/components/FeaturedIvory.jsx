import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useReveal } from "@/hooks/useReveal";

/**
 * Light luxury editorial product card — ivory paper background, warm gold accents,
 * Toteme / The Row aesthetic.
 */
export const IvoryProductCard = ({ product, index = 0 }) => {
  const { t } = useI18n();
  if (!product) return null;
  const price = `€${Number(product.price).toFixed(0)}`;

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`ivory-product-card-${product.id}`}
      className="ix-edcard group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2EDE2]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Soft warm tone */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B14]/12 via-transparent to-transparent" />

        {/* Edition tag */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-[#1F1B14]/20 bg-[#F8F5EE]/85 px-2.5 py-1 backdrop-blur-md">
          <span className="h-1 w-1 rounded-full bg-[#B89968]" />
          <span className="text-[9px] uppercase tracking-[0.35em] text-[#1F1B14]/85">
            {String(index + 1).padStart(2, "0")} · ATELIER
          </span>
        </div>

        {/* Hover overlay — "discover" label */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="ix-glass px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#1F1B14]/90">
            {t("editorial.view")}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="ix-edcard-meta mt-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.4em] text-[#1F1B14]/45">
            {product.product_type || t("editorial.piece")}
          </div>
          <div className="font-display mt-1.5 text-lg uppercase tracking-[0.04em] text-[#1F1B14]">
            {product.name}
          </div>
        </div>
        <div className="font-display whitespace-nowrap text-base text-[#B89968]">{price}</div>
      </div>
    </Link>
  );
};

export const FeaturedIvory = ({ products = [] }) => {
  const { t } = useI18n();
  const { ref, visible } = useReveal();
  const list = products.slice(0, 4);
  if (list.length === 0) return null;

  return (
    <section
      ref={ref}
      data-testid="featured-products-grid"
      className={`relative overflow-hidden bg-[#FBF8F2] text-[#1F1B14] lx-reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="ix-grain pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-[1800px] px-6 py-24 sm:px-12 sm:py-32 lg:py-40">
        {/* Section heading — asymmetric */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#1F1B14]/10 pb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.5em] text-[#B89968]">
              {t("featured.kicker")}
            </div>
            <h2
              className="font-display mt-5 text-[#1F1B14]"
              style={{ fontSize: "clamp(40px, 5.5vw, 96px)", lineHeight: 0.9 }}
            >
              {t("featured.title")}
            </h2>
          </div>
          <Link
            to="/shop/all"
            className="text-[10px] uppercase tracking-[0.45em] text-[#1F1B14]/65 hover:text-[#B89968]"
            data-testid="featured-see-all"
          >
            {t("featured.see_all")} →
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-20">
          {list.map((p, i) => (
            <IvoryProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIvory;
