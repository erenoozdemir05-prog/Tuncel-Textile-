import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

const LABELS = {
  in_stock: null,
  low_stock: { en: "Low stock", ru: "Заканчивается", lv: "Beigsies drīz", cls: "bg-amber-100 text-amber-900 border-amber-200" },
  out_of_stock: { en: "Sold out", ru: "Распродано", lv: "Izpārdots", cls: "bg-neutral-900 text-white border-black" },
  coming_soon: { en: "Coming soon", ru: "Скоро", lv: "Drīzumā", cls: "bg-black text-white border-black" },
};

const localize = (label, locale, count) => {
  if (!label) return "";
  let text = label[locale] || label.en;
  if (count) text = `${text} · ${count}`;
  return text;
};

export const ProductCard = ({ product }) => {
  const { locale } = useI18n();
  const label = LABELS[product.status_label] || null;

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="tx-card group block"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="tx-card-img absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {product.print_name && (
          <div className="pointer-events-none absolute left-4 top-4 bg-white/90 px-2 py-1 font-display text-[11px] uppercase tracking-[0.2em] text-black">
            {product.print_name}
          </div>
        )}
        {label && (
          <div
            data-testid={`product-status-${product.id}`}
            className={`pointer-events-none absolute right-4 top-4 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${label.cls}`}
          >
            {localize(label, locale, product.status_label === "low_stock" ? product.stock_count : null)}
          </div>
        )}
        <div className="tx-card-cta absolute inset-x-3 bottom-3 hidden md:block">
          <div className="bg-black px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
            View Product
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            {product.product_type}
          </div>
          <div className="mt-1 font-display text-xl tracking-[0.04em] text-black">
            {product.name}
          </div>
        </div>
        <div className="font-body text-sm font-semibold text-black">
          €{Number(product.price).toFixed(2)}
        </div>
      </div>
    </Link>
  );
};
