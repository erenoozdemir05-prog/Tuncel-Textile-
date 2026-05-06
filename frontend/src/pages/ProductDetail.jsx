import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchProduct } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Check, ChevronRight } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProduct(id)
      .then((p) => {
        setProduct(p);
        setSize(p.sizes?.[0] || null);
        setColor(p.colors?.[0] || null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

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
        <Link to="/shop/all" className="tx-link mt-6 inline-block text-sm uppercase tracking-[0.25em]">
          Return to Shop →
        </Link>
      </div>
    );
  }

  const handleAdd = (goToCart = false) => {
    addItem(product, { size, color, quantity: 1 });
    toast.success(`Added to bag — ${product.name}`);
    if (goToCart) navigate("/cart");
  };

  return (
    <div data-testid="product-detail-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 py-6 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
        <Link to="/" className="tx-link">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/shop/${product.category}`} className="tx-link">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 pb-20 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {product.print_name && (
            <div className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-black">
              {product.print_name}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
            {product.product_type} · {product.category}
          </div>
          <h1 className="font-display mt-2 text-5xl uppercase leading-none tracking-[0.02em] sm:text-7xl">
            {product.name}
          </h1>
          <div className="mt-4 text-2xl font-semibold">${Number(product.price).toFixed(2)}</div>

          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-neutral-700">
            {product.description}
          </p>

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
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.25em] ${
                      color === c
                        ? "bg-black text-white"
                        : "border border-black/15 text-neutral-700 hover:border-black"
                    }`}
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
                    className={`min-w-12 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] ${
                      size === s
                        ? "bg-black text-white"
                        : "border border-black/15 text-neutral-700 hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

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

          <ul className="mt-10 space-y-2 border-t border-black/10 pt-6 text-sm text-neutral-700">
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Limited edition · low stock</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Hand-printed in our studio</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Free shipping over $120</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
