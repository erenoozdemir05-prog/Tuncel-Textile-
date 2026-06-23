import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, cartKey } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { createCheckout, createIbanOrder, previewGiftCard } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Landmark, Loader2, Lock, ShieldCheck } from "lucide-react";

const COUNTRIES = [
  "Latvia", "Lithuania", "Estonia", "Türkiye", "Germany", "France", "Italy",
  "Spain", "Netherlands", "Belgium", "Poland", "Sweden", "Finland", "Denmark",
  "Austria", "Czech Republic", "Portugal", "Ireland", "United Kingdom", "Norway",
  "Switzerland", "United States", "Canada", "Other",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// E.164-ish: starts with optional +, 7-15 digits total. Allow spaces / dashes / parens during typing.
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;
const ZIP_RE = /^[A-Za-z0-9 \-]{3,10}$/;

const emptyAddress = {
  first_name: "", last_name: "", email: "", phone: "",
  country: "Latvia", state: "", city: "", postal_code: "",
  address1: "", address2: "",
};

export default function Checkout() {
  const { items, totals, clear } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [ship, setShip] = useState(emptyAddress);
  const [bill, setBill] = useState(emptyAddress);
  const [sameBilling, setSameBilling] = useState(true);
  const [method, setMethod] = useState("stripe"); // stripe | iban
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Gift card
  const [giftInput, setGiftInput] = useState("");
  const [gift, setGift] = useState(null);
  const [giftLoading, setGiftLoading] = useState(false);

  // Auto-apply gift code stored from Cart page
  useEffect(() => {
    try {
      const code = sessionStorage.getItem("tt_gift_code");
      if (code && subtotal > 0) {
        setGiftInput(code);
        previewGiftCard(code, subtotal).then((res) => setGift(res)).catch(() => {});
      }
    } catch (_) { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = totals.subtotal;
  const shippingCost = subtotal >= 120 ? 0 : 8;
  const tax = 0; // VAT included in price
  const giftDiscount = gift?.discount || 0;
  const total = Math.max(0, +(subtotal + shippingCost - giftDiscount).toFixed(2));

  const applyGiftCard = async () => {
    const code = giftInput.trim().toUpperCase();
    if (!code) return;
    setGiftLoading(true);
    try {
      const res = await previewGiftCard(code, subtotal);
      setGift(res);
      toast.success(`Gift card · −€${res.discount.toFixed(2)}`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Invalid gift card code");
    } finally {
      setGiftLoading(false);
    }
  };

  const removeGiftCard = () => { setGift(null); setGiftInput(""); };

  const validateAddress = (a, prefix) => {
    const errs = {};
    if (!a.first_name?.trim()) errs[`${prefix}_first_name`] = t("co.err_required");
    if (!a.last_name?.trim()) errs[`${prefix}_last_name`] = t("co.err_required");
    if (!a.email?.trim()) errs[`${prefix}_email`] = t("co.err_required");
    else if (!EMAIL_RE.test(a.email.trim())) errs[`${prefix}_email`] = t("co.err_email");
    if (!a.phone?.trim()) errs[`${prefix}_phone`] = t("co.err_required");
    else if (!PHONE_RE.test(a.phone.trim())) errs[`${prefix}_phone`] = t("co.err_phone");
    if (!a.country?.trim()) errs[`${prefix}_country`] = t("co.err_required");
    if (!a.city?.trim()) errs[`${prefix}_city`] = t("co.err_required");
    if (!a.postal_code?.trim()) errs[`${prefix}_postal_code`] = t("co.err_required");
    else if (!ZIP_RE.test(a.postal_code.trim())) errs[`${prefix}_postal_code`] = t("co.err_postal");
    if (!a.address1?.trim()) errs[`${prefix}_address1`] = t("co.err_required");
    return errs;
  };

  const validate = () => {
    let errs = validateAddress(ship, "ship");
    if (!sameBilling) errs = { ...errs, ...validateAddress(bill, "bill") };
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const proceed = async () => {
    if (items.length === 0) { toast.error(t("co.err_empty")); return; }
    if (!validate()) { toast.error(t("co.err_form")); return; }
    setLoading(true);
    try {
      if (method === "stripe") {
        const res = await createCheckout({
          items: items.map((it) => ({
            product_id: it.product_id,
            quantity: it.quantity,
            size: it.size,
            color: it.color,
          })),
          origin_url: window.location.origin,
          customer_email: ship.email,
          gift_card_code: gift?.code,
          shipping_address: ship,
          billing_address: sameBilling ? null : bill,
          billing_same_as_shipping: sameBilling,
        });
        window.location.href = res.url;
      } else {
        const fullShip = `${ship.address1}${ship.address2 ? ", " + ship.address2 : ""}, ${ship.city}, ${ship.state ? ship.state + ", " : ""}${ship.postal_code}, ${ship.country}`;
        const res = await createIbanOrder({
          items: items.map((it) => ({
            product_id: it.product_id,
            quantity: it.quantity,
            size: it.size,
            color: it.color,
          })),
          customer_email: ship.email,
          customer_name: `${ship.first_name} ${ship.last_name}`.trim(),
          shipping_address: fullShip,
          shipping_address_obj: ship,
          billing_address_obj: sameBilling ? null : bill,
          billing_same_as_shipping: sameBilling,
          note: note || undefined,
          gift_card_code: gift?.code,
        });
        clear();
        navigate(`/iban-success?ref=${encodeURIComponent(res.reference)}`);
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || t("co.err_generic"));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-5xl uppercase tracking-[0.04em]">{t("co.empty_title")}</h1>
        <p className="mt-4 text-sm text-neutral-600">{t("co.empty_body")}</p>
        <Link to="/shop/all" className="mt-8 inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white">
          {t("co.shop_now")}
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="checkout-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black/10 py-6">
        <Link to="/cart" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-neutral-600 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> {t("co.back_cart")}
        </Link>
        <span className="ml-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          <Lock className="h-3 w-3" /> {t("co.secure")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-12 py-10 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT — form */}
        <div className="space-y-12">
          <Section step="01" title={t("co.shipping")}>
            <AddressForm value={ship} onChange={setShip} prefix="ship" errors={errors} testidPrefix="ship" t={t} />
          </Section>

          <Section step="02" title={t("co.billing")}>
            <label className="flex cursor-pointer items-start gap-3 border border-black/15 p-4 hover:border-black" data-testid="checkout-same-billing">
              <input
                type="checkbox"
                checked={sameBilling}
                onChange={(e) => setSameBilling(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>
                <span className="font-display block text-xl uppercase tracking-[0.04em]">{t("co.same_billing")}</span>
                <span className="mt-1 block text-[12px] text-neutral-500">{t("co.same_billing_body")}</span>
              </span>
            </label>

            {!sameBilling && (
              <div className="mt-6">
                <AddressForm value={bill} onChange={setBill} prefix="bill" errors={errors} testidPrefix="bill" t={t} />
              </div>
            )}
          </Section>

          <Section step="03" title={t("co.payment_method")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                data-testid="pay-method-stripe"
                onClick={() => setMethod("stripe")}
                className={`flex flex-col items-start gap-2 border p-5 text-left transition-colors ${method === "stripe" ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}
              >
                <CreditCard className="h-5 w-5" />
                <div className="font-display text-2xl uppercase tracking-[0.04em]">{t("co.card")}</div>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${method === "stripe" ? "text-white/70" : "text-neutral-500"}`}>Stripe · Visa · Mastercard</div>
              </button>
              <button
                type="button"
                data-testid="pay-method-iban"
                onClick={() => setMethod("iban")}
                className={`flex flex-col items-start gap-2 border p-5 text-left transition-colors ${method === "iban" ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}
              >
                <Landmark className="h-5 w-5" />
                <div className="font-display text-2xl uppercase tracking-[0.04em]">{t("co.iban")}</div>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${method === "iban" ? "text-white/70" : "text-neutral-500"}`}>{t("co.iban_sub")}</div>
              </button>
            </div>
            {method === "iban" && (
              <textarea
                rows={3}
                data-testid="checkout-note"
                placeholder={t("co.note_ph")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-4 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
              />
            )}
          </Section>
        </div>

        {/* RIGHT — order summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="border border-black/15 p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("co.order_summary")}</div>
            <h2 className="font-display mt-2 text-3xl uppercase tracking-[0.04em]">{t("co.your_bag")}</h2>

            <ul className="mt-6 divide-y divide-black/10">
              {items.map((it) => (
                <li key={cartKey(it)} className="flex gap-3 py-4">
                  <img src={it.image_url} alt={it.name} className="h-20 w-16 object-cover" />
                  <div className="flex-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                      {[it.size, it.color].filter(Boolean).join(" · ") || "—"}
                    </div>
                    <div className="font-display mt-0.5 text-base uppercase tracking-[0.04em]">{it.name}</div>
                    <div className="mt-1 text-[12px] text-neutral-500">× {it.quantity}</div>
                  </div>
                  <div className="font-semibold">€{(Number(it.price) * it.quantity).toFixed(2)}</div>
                </li>
              ))}
            </ul>

            {/* Gift card */}
            <div className="mt-5 border-t border-black/10 pt-4">
              {!gift ? (
                <div className="flex gap-2">
                  <input
                    data-testid="checkout-gift-input"
                    value={giftInput}
                    onChange={(e) => setGiftInput(e.target.value.toUpperCase())}
                    placeholder={t("co.gift_ph")}
                    className="flex-1 border border-black/15 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={applyGiftCard}
                    disabled={giftLoading || !giftInput}
                    data-testid="checkout-gift-apply"
                    className="border border-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-black hover:text-white disabled:opacity-50"
                  >
                    {giftLoading ? "…" : t("co.apply")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between border border-emerald-700 bg-emerald-50 px-3 py-2 text-[12px]" data-testid="gift-applied">
                  <span className="font-mono">{gift.code} · −€{gift.discount.toFixed(2)}</span>
                  <button onClick={removeGiftCard} className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 hover:text-black">{t("co.remove")}</button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-5 space-y-2 border-t border-black/10 pt-5 text-sm">
              <Row label={t("co.subtotal")} value={`€${subtotal.toFixed(2)}`} />
              <Row label={t("co.shipping")} value={shippingCost === 0 ? t("co.free") : `€${shippingCost.toFixed(2)}`} />
              <Row label={t("co.tax")} value={t("co.tax_incl")} muted />
              {gift && <Row label={t("co.gift_discount")} value={`−€${giftDiscount.toFixed(2)}`} />}
              <div className="flex justify-between border-t border-black/15 pt-3">
                <span className="text-[12px] uppercase tracking-[0.25em] text-neutral-500">{t("co.total")}</span>
                <span className="font-display text-2xl tracking-[0.02em]" data-testid="checkout-total">€{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={proceed}
              disabled={loading}
              data-testid="checkout-pay"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? t("co.processing") : (method === "stripe" ? t("co.pay_now") : t("co.confirm_iban"))}
            </button>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-500">{t("co.secure_note")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

const Section = ({ step, title, children }) => (
  <section>
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-3xl uppercase tracking-[0.04em] sm:text-4xl">{title}</h2>
      <span className="font-display text-3xl text-neutral-300 sm:text-5xl">{step}</span>
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const Row = ({ label, value, muted }) => (
  <div className="flex justify-between">
    <span className={`text-[12px] uppercase tracking-[0.18em] ${muted ? "text-neutral-400" : "text-neutral-600"}`}>{label}</span>
    <span className={muted ? "text-neutral-400" : ""}>{value}</span>
  </div>
);

const Field = ({ label, value, onChange, type = "text", error, testid, autoComplete, required = true, ...rest }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
      {label}{required && " *"}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      autoComplete={autoComplete}
      {...rest}
      className={`mt-2 w-full border px-3 py-2.5 text-sm outline-none transition-colors ${error ? "border-red-500" : "border-black/15 focus:border-black"}`}
    />
    {error && <div className="mt-1 text-[11px] text-red-600">{error}</div>}
  </div>
);

const AddressForm = ({ value, onChange, prefix, errors, testidPrefix, t }) => {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t("co.first_name")} value={value.first_name} onChange={(v) => set("first_name", v)} testid={`${testidPrefix}-first-name`} autoComplete="given-name" error={errors[`${prefix}_first_name`]} />
      <Field label={t("co.last_name")}  value={value.last_name}  onChange={(v) => set("last_name", v)}  testid={`${testidPrefix}-last-name`}  autoComplete="family-name" error={errors[`${prefix}_last_name`]} />
      <Field label={t("co.email")}      value={value.email}      onChange={(v) => set("email", v)}      testid={`${testidPrefix}-email`}      autoComplete="email" type="email"            error={errors[`${prefix}_email`]} />
      <Field label={t("co.phone")}      value={value.phone}      onChange={(v) => set("phone", v)}      testid={`${testidPrefix}-phone`}      autoComplete="tel"   type="tel"              error={errors[`${prefix}_phone`]} />
      <div>
        <label className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">{t("co.country")} *</label>
        <select
          value={value.country}
          onChange={(e) => set("country", e.target.value)}
          data-testid={`${testidPrefix}-country`}
          autoComplete="country-name"
          className={`mt-2 w-full appearance-none border bg-white px-3 py-2.5 text-sm outline-none ${errors[`${prefix}_country`] ? "border-red-500" : "border-black/15 focus:border-black"}`}
        >
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors[`${prefix}_country`] && <div className="mt-1 text-[11px] text-red-600">{errors[`${prefix}_country`]}</div>}
      </div>
      <Field label={t("co.state")}       value={value.state}       onChange={(v) => set("state", v)}       testid={`${testidPrefix}-state`}       autoComplete="address-level1" required={false} />
      <Field label={t("co.city")}        value={value.city}        onChange={(v) => set("city", v)}        testid={`${testidPrefix}-city`}        autoComplete="address-level2" error={errors[`${prefix}_city`]} />
      <Field label={t("co.postal_code")} value={value.postal_code} onChange={(v) => set("postal_code", v)} testid={`${testidPrefix}-postal-code`} autoComplete="postal-code"    error={errors[`${prefix}_postal_code`]} />
      <div className="sm:col-span-2">
        <Field label={t("co.address1")}  value={value.address1}    onChange={(v) => set("address1", v)}    testid={`${testidPrefix}-address1`}    autoComplete="address-line1"  error={errors[`${prefix}_address1`]} />
      </div>
      <div className="sm:col-span-2">
        <Field label={t("co.address2")}  value={value.address2}    onChange={(v) => set("address2", v)}    testid={`${testidPrefix}-address2`}    autoComplete="address-line2"  required={false} />
      </div>
    </div>
  );
};
