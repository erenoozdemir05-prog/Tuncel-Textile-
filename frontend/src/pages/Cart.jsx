import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, cartKey } from "@/contexts/CartContext";
import { createCheckout, createIbanOrder } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import { ArrowLeft, CreditCard, Landmark, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { items, updateQty, removeItem, totals } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState("cart"); // cart | choose | iban
  const [loading, setLoading] = useState(false);
  const [iban, setIban] = useState({ name: "", email: "", address: "", note: "" });

  const startCheckout = () => {
    if (items.length === 0) return;
    setStep("choose");
  };

  const handleCard = async () => {
    setLoading(true);
    try {
      const payload = {
        items: items.map((it) => ({
          product_id: it.product_id, quantity: it.quantity, size: it.size, color: it.color,
        })),
        origin_url: window.location.origin,
      };
      const res = await createCheckout(payload);
      if (res?.url) window.location.href = res.url;
      else throw new Error("No checkout URL");
    } catch (e) {
      console.error(e);
      toast.error("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  const handleIban = async (e) => {
    e.preventDefault();
    if (!iban.name || !iban.email) {
      toast.error("Please provide your name and email");
      return;
    }
    setLoading(true);
    try {
      const res = await createIbanOrder({
        items: items.map((it) => ({
          product_id: it.product_id, quantity: it.quantity, size: it.size, color: it.color,
        })),
        customer_name: iban.name,
        customer_email: iban.email,
        shipping_address: iban.address || null,
        note: iban.note || null,
      });
      navigate(`/checkout/iban-success?ref=${encodeURIComponent(res.reference)}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not place the order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div data-testid="cart-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="border-b border-black/10 py-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("cart.kicker")}</div>
        <h1 className="font-display mt-2 text-7xl uppercase leading-none tracking-[0.02em] sm:text-[8rem]">
          {step === "iban" ? t("cart.pay_iban") : t("cart.title")}
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <div className="font-display text-4xl uppercase tracking-[0.05em] text-neutral-400">
            {t("cart.empty")}
          </div>
          <Link
            to="/shop/all"
            data-testid="cart-empty-shop-link"
            className="mt-8 inline-flex items-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            {t("cart.start_shopping")}
          </Link>
        </div>
      ) : step === "iban" ? (
        // ---------- IBAN form ----------
        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleIban} className="space-y-5" data-testid="iban-form">
            <button
              type="button"
              onClick={() => setStep("choose")}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-neutral-600 hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("cart.back")}
            </button>
            <p className="max-w-md text-sm text-neutral-700">
              We'll email you the IBAN details after you place the order. Pay within 3 days using the unique reference we generate. We confirm and ship within 24h of receiving your transfer.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required value={iban.name} onChange={(v) => setIban({ ...iban, name: v })} testid="iban-name" />
              <Field label="Email" required type="email" value={iban.email} onChange={(v) => setIban({ ...iban, email: v })} testid="iban-email" />
            </div>
            <Field label="Shipping address" value={iban.address} onChange={(v) => setIban({ ...iban, address: v })} multiline testid="iban-address" />
            <Field label="Note (optional)" value={iban.note} onChange={(v) => setIban({ ...iban, note: v })} multiline testid="iban-note" />
            <button
              type="submit"
              disabled={loading}
              data-testid="iban-submit"
              className="inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? "Placing order…" : "Place Order · Receive IBAN"}
            </button>
          </form>
          <Summary t={t} subtotal={totals.subtotal} />
        </div>
      ) : step === "choose" ? (
        // ---------- Payment choice ----------
        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_360px]">
          <div data-testid="payment-choice">
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-neutral-600 hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("cart.back")}
            </button>
            <h2 className="font-display mt-4 text-4xl uppercase tracking-[0.04em] sm:text-5xl">
              {t("cart.choose_payment")}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={handleCard}
                disabled={loading}
                data-testid="pay-card-button"
                className="group flex flex-col items-start gap-3 border border-black/15 p-6 text-left transition-colors hover:border-black hover:bg-black hover:text-white"
              >
                <CreditCard className="h-6 w-6" />
                <div className="font-display text-2xl uppercase tracking-[0.04em]">{t("cart.pay_card")}</div>
                <div className="text-[12px] text-neutral-600 group-hover:text-white/80">{t("cart.pay_card_sub")}</div>
              </button>
              <button
                onClick={() => setStep("iban")}
                data-testid="pay-iban-button"
                className="group flex flex-col items-start gap-3 border border-black/15 p-6 text-left transition-colors hover:border-black hover:bg-black hover:text-white"
              >
                <Landmark className="h-6 w-6" />
                <div className="font-display text-2xl uppercase tracking-[0.04em]">{t("cart.pay_iban")}</div>
                <div className="text-[12px] text-neutral-600 group-hover:text-white/80">{t("cart.pay_iban_sub")}</div>
              </button>
            </div>
          </div>
          <Summary t={t} subtotal={totals.subtotal} />
        </div>
      ) : (
        // ---------- Cart list ----------
        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-black/10">
            {items.map((it) => {
              const k = cartKey(it);
              return (
                <div key={k} data-testid={`cart-item-${it.product_id}`} className="flex gap-5 py-6">
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
                      <button data-testid={`cart-remove-${it.product_id}`} onClick={() => removeItem(k)} className="text-neutral-500 hover:text-black" aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div className="inline-flex items-center border border-black/15">
                        <button data-testid={`cart-qty-decrease-${it.product_id}`} onClick={() => updateQty(k, it.quantity - 1)} className="px-3 py-2 hover:bg-black hover:text-white" aria-label="Decrease">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-10 px-3 py-2 text-center text-sm font-semibold">{it.quantity}</span>
                        <button data-testid={`cart-qty-increase-${it.product_id}`} onClick={() => updateQty(k, it.quantity + 1)} className="px-3 py-2 hover:bg-black hover:text-white" aria-label="Increase">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="font-semibold">${(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Summary t={t} subtotal={totals.subtotal} onCheckout={startCheckout} loading={loading} />
        </div>
      )}
    </div>
  );
}

const Summary = ({ t, subtotal, onCheckout, loading }) => (
  <aside className="h-fit border border-black/10 p-6">
    <div className="font-display text-3xl uppercase tracking-[0.04em]">{t("cart.summary")}</div>
    <div className="mt-6 space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-neutral-600">{t("cart.subtotal")}</span>
        <span data-testid="cart-subtotal" className="font-semibold">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-neutral-600">{t("cart.shipping")}</span>
        <span className="text-neutral-500">{t("cart.shipping_calc")}</span>
      </div>
      <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-base font-semibold">
        <span>{t("cart.total")}</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
    </div>
    {onCheckout && (
      <button
        data-testid="checkout-button"
        onClick={onCheckout}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? "…" : t("cart.checkout")}
      </button>
    )}
  </aside>
);

const Field = ({ label, value, onChange, type = "text", required = false, multiline = false, testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}{required ? " *" : ""}</label>
    {multiline ? (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
      />
    ) : (
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
      />
    )}
  </div>
);
