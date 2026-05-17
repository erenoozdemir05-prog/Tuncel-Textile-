import React from "react";
import { Truck, Clock, ShieldCheck } from "lucide-react";

/**
 * Slim premium bar advertising same-day shipping (orders before 14:00 CET).
 * Drop it under the navbar, on the cart page, or as a strip on the product page.
 */
export function ShippingBar({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-3 border-y border-black/10 bg-neutral-50 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-neutral-700" data-testid="shipping-bar">
        <Clock className="h-3 w-3" />
        <span>Order before <strong className="text-black">14:00 CET</strong> · ships same day from Riga</span>
      </div>
    );
  }
  return (
    <section className="border-y border-black/10 bg-black text-white" data-testid="shipping-bar">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-12 gap-y-3 px-5 py-3 text-[11px] uppercase tracking-[0.25em] sm:px-8">
        <span className="inline-flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          Order by <strong className="text-white">14:00 CET</strong> — same-day dispatch
        </span>
        <span className="inline-flex items-center gap-2">
          <Truck className="h-3.5 w-3.5" />
          Free EU shipping over €30
        </span>
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Hand-finished in Riga · 14-day returns
        </span>
      </div>
    </section>
  );
}
