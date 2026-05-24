import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";

const ACCENT = "#1F4D3D";

const TITLES = {
  men: { kicker: "COLLECTION I", title_key: "nav.men" },
  women: { kicker: "COLLECTION II", title_key: "nav.women" },
  accessories: { kicker: "COLLECTION III", title_key: "nav.accessories" },
  all: { kicker: "ATELIER · MMXXVI", title_key: "shop_page.all_pieces" },
};

const FILTERS = [
  { key: "all", label: "ALL" },
  { key: "hoodie", label: "HOODIES" },
  { key: "tshirt", label: "T-SHIRTS" },
  { key: "accessory", label: "ACCESSORIES" },
];

const SORTS = [
  { key: "newest", label: "NEWEST" },
  { key: "price-asc", label: "PRICE ↑" },
  { key: "price-desc", label: "PRICE ↓" },
];

const RANGES = [
  { key: "all", label: "ALL PRICES" },
  { key: "u40", label: "UNDER €40", max: 40 },
  { key: "40-80", label: "€40 — €80", min: 40, max: 80 },
  { key: "80p", label: "€80+", min: 80 },
];

const ProductCard = ({ product, index }) => (
  <Link
    to={`/product/${product.id}`}
    data-testid={`shop-card-${product.id}`}
    className="group block"
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F1E8]">
      <img
        src={product.image_url}
        alt={product.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute left-3 top-3 text-[9px] uppercase tracking-[0.4em] text-white mix-blend-difference">
        {String(index + 1).padStart(2, "0")}
      </div>
    </div>
    <div className="flex items-start justify-between gap-3 px-4 pb-10 pt-4">
      <div>
        <div className="text-[9px] uppercase tracking-[0.4em] text-black/45">
          {product.product_type || "ATELIER"}
        </div>
        <div className="font-prada mt-1 text-[14px] tracking-[0.04em]">{product.name}</div>
      </div>
      <div className="font-prada whitespace-nowrap text-[14px]">€{Number(product.price).toFixed(0)}</div>
    </div>
  </Link>
);

export default function Shop() {
  const { category = "all" } = useParams();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type") || "all";
  const activeSort = searchParams.get("sort") || "newest";
  const activeRange = searchParams.get("range") || "all";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = TITLES[category] || TITLES.all;
  const titleText = t(meta.title_key);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== "all") params.category = category;
    fetchProducts(params).then(setProducts).finally(() => setLoading(false));
  }, [category]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeType !== "all") list = list.filter((p) => p.product_type === activeType);
    const r = RANGES.find((x) => x.key === activeRange);
    if (r && (r.min !== undefined || r.max !== undefined)) {
      list = list.filter((p) => {
        if (r.min !== undefined && p.price < r.min) return false;
        if (r.max !== undefined && p.price > r.max) return false;
        return true;
      });
    }
    if (activeSort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (activeSort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }, [products, activeType, activeSort, activeRange]);

  const setParam = (k, v, def) => {
    if (v === def) searchParams.delete(k);
    else searchParams.set(k, v);
    setSearchParams(searchParams, { replace: true });
  };

  const visibleFilters = FILTERS.filter((f) => {
    if (category === "accessories") return f.key === "all" || f.key === "accessory";
    if (category === "men" || category === "women") return f.key !== "accessory";
    return true;
  });

  return (
    <div data-testid={`shop-page-${category}`} className="min-h-screen bg-white text-black">
      {/* Editorial header — centered like Prada */}
      <div className="mx-auto max-w-[1800px] px-6 sm:px-12">
        <div className="border-b border-black/15 py-16 text-center sm:py-20">
          <div className="text-[10px] uppercase tracking-[0.55em]" style={{ color: ACCENT }}>
            {meta.kicker}
          </div>
          <h1
            className="font-display mt-5 uppercase"
            style={{ fontSize: "clamp(48px, 7vw, 130px)", letterSpacing: "0.04em", lineHeight: 1 }}
          >
            {titleText.toUpperCase()}
          </h1>
          <div className="mt-5 text-[10px] uppercase tracking-[0.5em] text-black/55">
            {filtered.length} {filtered.length === 1 ? t("shop_page.piece") : t("shop_page.pieces")} · MMXXVI
          </div>
        </div>

        {/* Filter bar */}
        <div className="sticky top-[70px] z-30 -mx-6 flex flex-wrap items-center gap-3 border-b border-black/10 bg-white/95 px-6 py-4 backdrop-blur-md sm:-mx-12 sm:px-12">
          <div className="flex flex-wrap gap-1">
            {visibleFilters.map((f) => (
              <button
                key={f.key}
                data-testid={`shop-filter-${f.key}`}
                onClick={() => setParam("type", f.key, "all")}
                className={`whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.3em] transition-colors ${
                  activeType === f.key
                    ? "bg-black text-white"
                    : "border border-black/15 text-black/70 hover:border-black hover:text-black"
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
              className="border border-black/15 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-black focus:border-black focus:outline-none"
            >
              {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <select
              data-testid="shop-sort"
              value={activeSort}
              onChange={(e) => setParam("sort", e.target.value, "newest")}
              className="border border-black/15 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-black focus:border-black focus:outline-none"
            >
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid — Prada-style edge-to-edge, hairline 2px gaps */}
      <div className="grid grid-cols-2 gap-[2px] md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full animate-pulse bg-[#F5F1E8]" />
            ))
          : filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-32 text-center">
            <div className="font-display text-3xl uppercase tracking-[0.05em] text-black/30 sm:text-5xl">
              {t("shop_page.empty")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
