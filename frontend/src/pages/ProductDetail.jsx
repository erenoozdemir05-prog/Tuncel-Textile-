import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchProduct, fetchProducts } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useCms, cmsText } from "@/contexts/CmsContext";
import { useI18n } from "@/contexts/I18nContext";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const SIZE_GUIDE = [
  { size: "XS", chest: "84-88", length: "66" },
  { size: "S", chest: "88-94", length: "68" },
  { size: "M", chest: "94-100", length: "70" },
  { size: "L", chest: "100-108", length: "72" },
  { size: "XL", chest: "108-116", length: "74" },
  { size: "XXL", chest: "116-124", length: "76" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { items: cmsItems } = useCms();
  const { locale, t } = useI18n();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setQty(1);
    fetchProduct(id)
      .then((p) => {
        setProduct(p);
        setSize(p.sizes?.[0] || null);
        setColor(p.colors?.[0] || null);
        setActiveImage(0);
        // load related (same category, not this one)
        fetchProducts({ category: p.category })
          .then((list) => setRelated(list.filter((x) => x.id !== p.id).slice(0, 4)))
          .catch(() => setRelated([]));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Gallery: admin-managed list (gallery_images) first, then fallback to primary + hover, then repeats.
  const gallery = useMemo(() => {
    if (!product) return [];
    const g = (product.gallery_images || []).filter(Boolean);
    if (g.length > 0) return g;
    const base = [product.image_url];
    if (product.hover_image_url) base.push(product.hover_image_url);
    while (base.length < 4) base.push(product.image_url);
    return base;
  }, [product]);

  const scrollToImage = (i) => {
    const el = document.getElementById(`pdp-img-${i}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveImage(i);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse bg-neutral-100" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse bg-neutral-100" />
            <div className="h-6 w-1/3 animate-pulse bg-neutral-100" />
            <div className="h-24 w-full animate-pulse bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-32 text-center sm:px-8">
        <h1 className="font-display text-5xl uppercase">{t("pd.not_found")}</h1>
        <Link to="/shop/all" className="tx-link mt-6 inline-block text-sm uppercase tracking-[0.25em]">{t("pd.return_to_shop")}</Link>
      </div>
    );
  }

  const handleAdd = (goToCart = false) => {
    if ((product.sizes || []).length > 0 && !size) {
      toast.error(t("pd.select_size") || "Please select a size");
      return;
    }
    addItem(product, { size, color, quantity: qty });
    toast.success(t("pd.toast_added").replace("{name}", product.name));
    if (goToCart) navigate("/cart");
  };

  return (
    <div data-testid="product-detail-page" className="w-full">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="flex items-center gap-2 py-6 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
        <Link to="/" className="tx-link">{t("pd.home")}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/shop/${product.category}`} className="tx-link">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-black">{product.name}</span>
      </div>
      </div>

      <div className="grid grid-cols-1 gap-10 pb-16 lg:grid-cols-[50fr_50fr] lg:gap-12">
        {/* LEFT — vertical scroll gallery (Prada-style) */}
        <div className="order-1 lg:pl-0">
          {/* Optional thumbnails (top, horizontal) — click to scroll-to */}
          {gallery.length > 1 && (
            <div className="mb-6 hidden gap-2 lg:flex">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  data-testid={`gallery-thumb-${i}`}
                  onClick={() => scrollToImage(i)}
                  className={`h-16 w-14 overflow-hidden border-2 transition-opacity ${activeImage === i ? "border-black opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                  aria-label={`Scroll to image ${i + 1}`}
                >
                  <img src={g} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="space-y-6 lg:space-y-10">
            {gallery.map((g, i) => (
              <div
                key={i}
                id={`pdp-img-${i}`}
                className="relative w-full overflow-hidden bg-neutral-100"
                style={{ aspectRatio: "4 / 5" }}
              >
                <img
                  src={g}
                  alt={`${product.name} — ${i + 1}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {i === 0 && product.print_name && (
                  <div className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-black">
                    {product.print_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — sticky product info */}
        <div className="order-2 lg:sticky lg:top-24 lg:h-fit lg:pr-8 xl:pr-16">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{product.product_type} · {product.category}</div>
          <h1 className="font-display mt-2 text-5xl uppercase leading-none tracking-[0.02em] sm:text-7xl">{product.name}</h1>
          <div className="mt-4 text-2xl font-semibold">€{Number(product.price).toFixed(2)}</div>

          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-neutral-700">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mt-10">
              <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                {t("pd.color")} · <span className="text-black">{color}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {product.colors.map((c) => {
                  const bg = c.toLowerCase() === "white" ? "#ffffff" : c.toLowerCase() === "black" ? "#0a0a0a" : c;
                  return (
                    <button
                      key={c}
                      data-testid={`product-color-${c.toLowerCase()}`}
                      onClick={() => setColor(c)}
                      title={c}
                      aria-label={c}
                      className={`h-8 w-8 rounded-full border border-black/20 transition-all ${color === c ? "ring-2 ring-black ring-offset-2" : "hover:scale-105"}`}
                      style={{ backgroundColor: bg }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                {t("product.size")} · <span className="text-black">{size}</span>
              </div>
              <div className="relative">
                <select
                  data-testid="product-size-select"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full appearance-none border border-black bg-white px-4 py-3 pr-10 text-[12px] font-semibold uppercase tracking-[0.2em] text-black outline-none focus:border-black"
                >
                  <option value="">{t("pd.select_size") || "Select a size"}</option>
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          )}

          {/* Qty */}
          <div className="mt-8">
            <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("pd.quantity")}</div>
            <div className="inline-flex items-center border border-black/15">
              <button
                data-testid="product-qty-decrease"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-black hover:text-white"
                aria-label="Decrease"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span data-testid="product-qty" className="min-w-10 px-3 py-2 text-center text-sm font-semibold">{qty}</span>
              <button
                data-testid="product-qty-increase"
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2 hover:bg-black hover:text-white"
                aria-label="Increase"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              data-testid="add-to-cart-button"
              onClick={() => handleAdd(false)}
              className="inline-flex flex-1 items-center justify-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800"
            >
              {t("pd.add_to_bag")}
            </button>
            <button
              data-testid="buy-now-button"
              onClick={() => handleAdd(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 border border-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white"
            >
              {t("pd.buy_now")}
            </button>
          </div>

          {/* Wishlist + Size guide */}
          <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-neutral-600">
            <button
              type="button"
              data-testid="pdp-wishlist"
              onClick={() => toast.success(t("pd.wishlist_added") || "Added to your list")}
              className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 transition-colors hover:border-black hover:text-black"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>{t("pd.add_to_list") || "Add to list"}</span>
            </button>
          </div>

          <ul className="mt-8 space-y-2 border-t border-black/10 pt-6 text-sm text-neutral-700">
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> {cmsText(cmsItems, "limited_edition", locale, t("pd.limited_edition"))}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> {cmsText(cmsItems, "handcrafted", locale, t("pd.handcrafted"))}</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> {cmsText(cmsItems, "free_shipping", locale, t("pd.free_shipping"))}</li>
          </ul>

          {/* Accordion details */}
          <Accordion type="single" collapsible className="mt-8 border-t border-black/10">
            <AccordionItem value="size" className="border-b border-black/10">
              <AccordionTrigger data-testid="size-guide-trigger" className="font-display text-lg uppercase tracking-[0.04em] hover:no-underline">{t("pd.size_guide")}</AccordionTrigger>
              <AccordionContent>
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    <tr><th className="py-2 text-left">{t("pd.th_size")}</th><th className="text-left">{t("pd.th_chest")}</th><th className="text-left">{t("pd.th_length")}</th></tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE.map((r) => (
                      <tr key={r.size} className="border-t border-black/5">
                        <td className="py-2 font-semibold">{r.size}</td>
                        <td>{r.chest}</td>
                        <td>{r.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="materials" className="border-b border-black/10">
              <AccordionTrigger className="font-display text-lg uppercase tracking-[0.04em] hover:no-underline">{t("pd.materials_care")}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-neutral-700">
                {t("pd.materials_body")}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="font-display text-lg uppercase tracking-[0.04em] hover:no-underline">{t("pd.shipping_returns")}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-neutral-700">
                {t("pd.shipping_body")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-black/10 py-16">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("pd.more_from")} {product.category}</div>
          <h3 className="font-display mt-2 text-4xl uppercase tracking-[0.04em] sm:text-5xl">{t("pd.you_may_also_like")}</h3>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {related.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
          </div>
        </section>
      )}

      {/* Mobile sticky add-to-cart bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden"
        data-testid="pdp-mobile-cta"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{product.name}</div>
            <div className="font-semibold">€{Number(product.price).toFixed(2)}</div>
          </div>
          <button
            onClick={() => handleAdd(false)}
            data-testid="pdp-mobile-add"
            className="bg-black px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            {t("pd.add_to_bag")}
          </button>
        </div>
      </div>
    </div>
  );
}
