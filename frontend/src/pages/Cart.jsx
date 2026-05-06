import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart, cartKey } from "@/contexts/CartContext";
import { createCheckout } from "@/lib/api";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { items, updateQty, removeItem, totals } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
        })),
        origin_url: window.location.origin,
      };
      const res = await createCheckout(payload);
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div data-testid="cart-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="border-b border-black/10 py-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">
          Your bag
        </div>
        <h1 className="font-display mt-2 text-7xl uppercase leading-none tracking-[0.02em] sm:text-[8rem]">
          Cart
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <div className="font-display text-4xl uppercase tracking-[0.05em] text-neutral-400">
            Your bag is empty.
          </div>
          <Link
            to="/shop/all"
            data-testid="cart-empty-shop-link"
            className="mt-8 inline-flex items-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-black/10">
            {items.map((it) => {
              const k = cartKey(it);
              return (
                <div
                  key={k}
                  data-testid={`cart-item-${it.product_id}`}
                  className="flex gap-5 py-6"
                >
                  <div className="aspect-[4/5] w-24 shrink-0 overflow-hidden bg-neutral-100 sm:w-32">
                    <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-2xl uppercase tracking-[0.04em]">{it.name}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                          {[it.size, it.color].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <button
                        data-testid={`cart-remove-${it.product_id}`}
                        onClick={() => removeItem(k)}
                        className="text-neutral-500 hover:text-black"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div className="inline-flex items-center border border-black/15">
                        <button
                          data-testid={`cart-qty-decrease-${it.product_id}`}
                          onClick={() => updateQty(k, it.quantity - 1)}
                          className="px-3 py-2 hover:bg-black hover:text-white"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-10 px-3 py-2 text-center text-sm font-semibold">
                          {it.quantity}
                        </span>
                        <button
                          data-testid={`cart-qty-increase-${it.product_id}`}
                          onClick={() => updateQty(k, it.quantity + 1)}
                          className="px-3 py-2 hover:bg-black hover:text-white"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="font-semibold">
                        ${(it.price * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="h-fit border border-black/10 p-6">
            <div className="font-display text-3xl uppercase tracking-[0.04em]">Summary</div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span data-testid="cart-subtotal" className="font-semibold">
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-neutral-500">Calculated at checkout</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-semibold">
                <span>Total</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              data-testid="checkout-button"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Checkout"}
            </button>
            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Secure payment via Stripe
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
