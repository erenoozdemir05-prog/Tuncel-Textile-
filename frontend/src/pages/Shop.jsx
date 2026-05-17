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

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
];

const PRICE_RANGES = [
  { key: "all", label: "All Prices" },
  { key: "u40", label: "Under €40", max: 40 },
  { key: "40-80", label: "€40 – €80", min: 40, max: 80 },
  { key: "80p", label: "€80+", min: 80 },
];

export default function Shop() {
  const { category = "all" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type") || "all";
  const activeSort = searchParams.get("sort") || "newest";
  const activeRange = searchParams.get("range") || "all";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = TITLES[category] || TITLES.all;

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "all") params.category = category;
    fetchProducts(params).then(setProducts).finally(() => setLoading(false));
  }, [category]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeType !== "all") list = list.filter((p) => p.product_type === activeType);
    const range = PRICE_RANGES.find((r) => r.key === activeRange);
    if (range && (range.min !== undefined || range.max !== undefined)) {
      list = list.filter((p) => {
        if (range.min !== undefined && p.price < range.min) return false;
        if (range.max !== undefined && p.price > range.max) return false;
        return true;
      });
    }
    if (activeSort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (activeSort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }, [products, activeType, activeSort, activeRange]);

  const setParam = (key, val, defaultVal) => {
    if (val === defaultVal) searchParams.delete(key);
    else searchParams.set(key, val);
    setSearchParams(searchParams, { replace: true });
  };

  const visibleFilters = FILTERS.filter((f) => {
    if (category === "accessories") return f.key === "all" || f.key === "accessory";
    if (category === "men" || category === "women") return f.key !== "accessory";
    return true;
  });

  return (
    <div data-testid={`shop-page-${category}`} className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="border-b border-black/10 py-14">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{meta.kicker}</div>
        <h1 className="font-display mt-3 text-7xl uppercase leading-none tracking-[0.02em] sm:text-[10rem]">{meta.title}</h1>
      </div>

      <div className="sticky top-16 z-30 -mx-5 flex flex-wrap gap-2 border-b border-black/10 bg-white/90 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap gap-1">
          {visibleFilters.map((f) => (
            <button
              key={f.key}
              data-testid={`shop-filter-${f.key}`}
              onClick={() => setParam("type", f.key, "all")}
              className={`whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                activeType === f.key
                  ? "bg-black text-white"
                  : "border border-black/15 text-neutral-700 hover:border-black hover:text-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            data-testid="shop-price-range"
            value={activeRange}
            onChange={(e) => setParam("range", e.target.value, "all")}
            className="border border-black/15 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-black"
          >
            {PRICE_RANGES.map((r) => (<option key={r.key} value={r.key}>{r.label}</option>))}
          </select>
          <select
            data-testid="shop-sort"
            value={activeSort}
            onChange={(e) => setParam("sort", e.target.value, "newest")}
            className="border border-black/15 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-black"
          >
            {SORTS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
          </select>
          <span className="self-center pl-1 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-14 py-14 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (<div key={i} className="aspect-[4/5] w-full animate-pulse bg-neutral-100" />))
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
