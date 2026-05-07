import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchProduct, fetchProducts } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
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

  // Build a "gallery" by repeating the main image with subtle variants for now (placeholder)
  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.image_url, product.image_url, product.image_url, product.image_url];
  }, [product]);

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
        <h1 className="font-display text-5xl uppercase">Product not found</h1>
        <Link to="/shop/all" className="tx-link mt-6 inline-block text-sm uppercase tracking-[0.25em]">Return to Shop →</Link>
      </div>
    );
  }

  const handleAdd = (goToCart = false) => {
    addItem(product, { size, color, quantity: qty });
    toast.success(`Added — ${product.name}`);
    if (goToCart) navigate("/cart");
  };

  return (
    <div data-testid="product-detail-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="flex items-center gap-2 py-6 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
        <Link to="/" className="tx-link">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/shop/${product.category}`} className="tx-link">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 pb-16 md:grid-cols-[100px_1fr_1fr] md:gap-8">
        {/* Thumbnails (desktop) */}
        <div className="order-2 hidden flex-col gap-3 md:order-1 md:flex">
          {gallery.map((g, i) => (
            <button
              key={i}
              data-testid={`gallery-thumb-${i}`}
              onClick={() => setActiveImage(i)}
              className={`aspect-[4/5] overflow-hidden border-2 ${activeImage === i ? "border-black" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={g} alt={`view ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="order-1 md:order-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
            <img src={gallery[activeImage]} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            {product.print_name && (
              <div className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-black">
                {product.print_name}
              </div>
            )}
          </div>
          {/* Mobile thumbnails */}
          <div className="mt-3 flex gap-2 md:hidden">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-[4/5] w-16 overflow-hidden border-2 ${activeImage === i ? "border-black" : "border-transparent opacity-60"}`}
              >
                <img src={g} alt={`view ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="order-3 flex flex-col">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{product.product_type} · {product.category}</div>
          <h1 className="font-display mt-2 text-5xl uppercase leading-none tracking-[0.02em] sm:text-7xl">{product.name}</h1>
          <div className="mt-4 text-2xl font-semibold">${Number(product.price).toFixed(2)}</div>

          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-neutral-700">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mt-10">
              <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                Color · <span className="text-black">{color}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    data-testid={`product-color-${c.toLowerCase()}`}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.25em] ${color === c ? "bg-black text-white" : "border border-black/15 text-neutral-700 hover:border-black"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                Size · <span className="text-black">{size}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    data-testid={`product-size-${s.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setSize(s)}
                    className={`min-w-12 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] ${size === s ? "bg-black text-white" : "border border-black/15 text-neutral-700 hover:border-black"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div className="mt-8">
            <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">Quantity</div>
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
              Add to Bag
            </button>
            <button
              data-testid="buy-now-button"
              onClick={() => handleAdd(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 border border-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white"
            >
              Buy Now
            </button>
          </div>

          <ul className="mt-8 space-y-2 border-t border-black/10 pt-6 text-sm text-neutral-700">
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Limited edition · low stock</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Hand-printed in our studio</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Free shipping over $120</li>
          </ul>

          {/* Accordion details */}
          <Accordion type="single" collapsible className="mt-8 border-t border-black/10">
            <AccordionItem value="size" className="border-b border-black/10">
              <AccordionTrigger data-testid="size-guide-trigger" className="font-display text-lg uppercase tracking-[0.04em] hover:no-underline">Size guide</AccordionTrigger>
              <AccordionContent>
                <table className="w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    <tr><th className="py-2 text-left">Size</th><th className="text-left">Chest (cm)</th><th className="text-left">Length (cm)</th></tr>
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
              <AccordionTrigger className="font-display text-lg uppercase tracking-[0.04em] hover:no-underline">Materials & care</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-neutral-700">
                100% heavyweight organic cotton. Water-based screen print. Machine wash cold inside out. Tumble dry low. Iron reverse only — never directly on the print.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="font-display text-lg uppercase tracking-[0.04em] hover:no-underline">Shipping & returns</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-neutral-700">
                Ships within 48h from Riga. Free shipping on orders over $120. 14-day returns on unworn pieces — limited editions are final sale.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-black/10 py-16">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">More from {product.category}</div>
          <h3 className="font-display mt-2 text-4xl uppercase tracking-[0.04em] sm:text-5xl">You may also like</h3>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {related.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}
    </div>
  );
}
