import React from "react";
import { Link } from "react-router-dom";

export const ProductCard = ({ product }) => {
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
          ${Number(product.price).toFixed(2)}
        </div>
      </div>
    </Link>
  );
};
