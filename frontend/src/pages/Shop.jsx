import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

const TITLES = {
  men: { kicker: "Wardrobe / 01", title: "Men" },
  women: { kicker: "Wardrobe / 02", title: "Women" },
  accessories: { kicker: "Wardrobe / 03", title: "Accessories" },
  all: { kicker: "Edition 01", title: "All Pieces" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "hoodie", label: "Hoodies" },
  { key: "tshirt", label: "T-Shirts" },
  { key: "accessory", label: "Accessories" },
];

export default function Shop() {
  const { category = "all" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type") || "all";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = TITLES[category] || TITLES.all;

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "all") params.category = category;
    fetchProducts(params)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = useMemo(() => {
    if (activeType === "all") return products;
    return products.filter((p) => p.product_type === activeType);
  }, [products, activeType]);

  const setType = (t) => {
    if (t === "all") {
      searchParams.delete("type");
    } else {
      searchParams.set("type", t);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Hide accessories filter on accessories page; hide hoodie/tshirt on accessories page
  const visibleFilters = FILTERS.filter((f) => {
    if (category === "accessories") return f.key === "all" || f.key === "accessory";
    if (category === "men" || category === "women") return f.key !== "accessory";
    return true;
  });

  return (
    <div data-testid={`shop-page-${category}`} className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="border-b border-black/10 py-14">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
          {meta.kicker}
        </div>
        <h1 className="font-display mt-3 text-7xl uppercase leading-none tracking-[0.02em] sm:text-[10rem]">
          {meta.title}
        </h1>
      </div>

      <div className="sticky top-16 z-30 -mx-5 flex gap-1 overflow-x-auto border-b border-black/10 bg-white/90 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
        {visibleFilters.map((f) => (
          <button
            key={f.key}
            data-testid={`shop-filter-${f.key}`}
            onClick={() => setType(f.key)}
            className={`whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
              activeType === f.key
                ? "bg-black text-white"
                : "border border-black/15 text-neutral-700 hover:border-black hover:text-black"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto self-center text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-14 py-14 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] w-full animate-pulse bg-neutral-100" />
            ))
          : filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-24 text-center font-display text-3xl uppercase tracking-[0.05em] text-neutral-400">
            No pieces in this drop. Yet.
          </div>
        )}
      </div>
    </div>
  );
}
