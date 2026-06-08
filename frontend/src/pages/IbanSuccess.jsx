import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getIbanOrder } from "@/lib/api";
import { Copy, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";

export default function IbanSuccess() {
  const [params] = useSearchParams();
  const reference = params.get("ref");
  const { clear } = useCart();
  const { t } = useI18n();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const cleared = useRef(false);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }
    getIbanOrder(reference)
      .then((d) => {
        setOrder(d);
        if (!cleared.current) {
          clear();
          cleared.current = true;
        }
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [reference, clear]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center sm:px-8">
        <p className="text-[12px] uppercase tracking-[0.25em] text-neutral-500">{t("iban_succ.loading")}</p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center sm:px-8">
        <h1 className="font-display text-5xl uppercase">{t("iban_succ.not_found")}</h1>
        <Link to="/" className="tx-link mt-6 inline-block text-sm uppercase tracking-[0.25em]">{t("iban_succ.return_home")}</Link>
      </div>
    );
  }

  const iban = order.iban || {};
  const copy = (val, label) => {
    navigator.clipboard.writeText(val);
    toast.success(t("iban_succ.toast_copied").replace("{label}", label));
  };

  // Branch: gift card fully paid -> show confirmed view (no IBAN/BIC details)
  const fullyPaidByGift =
    order.payment_method === "gift_card" ||
    (order.payment_status === "paid" && Number(order.amount) === 0);

  if (fullyPaidByGift) {
    return (
      <div data-testid="iban-success-page" className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-700" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-500" data-testid="paid-by-gift-badge">
            {t("iban_succ.paid_with_gift")}
          </span>
        </div>
        <h1 className="font-display mt-4 text-5xl uppercase leading-none tracking-[0.02em] sm:text-7xl">
          {t("iban_succ.confirmed_title")}
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-neutral-700">
          {t("iban_succ.gift_covered_body")}
        </p>

        <div className="mt-10 border border-black/15">
          <Row label={t("iban_succ.order_reference")} value={order.reference} highlight onCopy={() => copy(order.reference, t("iban_succ.order_reference"))} />
          <Row label={t("iban_succ.order_total")} value={`€${Number(order.amount_original || 0).toFixed(2)}`} />
          <Row label={t("iban_succ.gift_discount")} value={`−€${Number(order.gift_card_discount || 0).toFixed(2)}`} />
          {order.gift_card_code && (
            <Row label={t("iban_succ.gift_card")} value={`···· ${String(order.gift_card_code).slice(-4)}`} mono />
          )}
          <Row label={t("iban_succ.amount_due")} value="€0.00" highlight />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to={`/track-order?ref=${encodeURIComponent(order.reference)}`}
            data-testid="iban-track-link"
            className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            {t("iban_succ.track_order")}
          </Link>
          <Link
            to="/shop/all"
            className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white"
          >
            {t("iban_succ.continue_shopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="iban-success-page" className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6" />
        <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("iban_succ.order_received")}</span>
      </div>
      <h1 className="font-display mt-4 text-5xl uppercase leading-none tracking-[0.02em] sm:text-7xl">
        {t("iban_succ.awaiting_transfer")}
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-neutral-700">
        {t("iban_succ.awaiting_body")}
      </p>

      <div className="mt-10 border border-black/15">
        <Row label={t("iban_succ.order_reference")} value={order.reference} highlight onCopy={() => copy(order.reference, t("iban_succ.order_reference"))} />
        <Row label={t("iban_succ.amount")} value={`€${Number(order.amount).toFixed(2)}`} onCopy={() => copy(`${Number(order.amount).toFixed(2)}`, t("iban_succ.amount"))} />
        <Row label={t("iban_succ.account_holder")} value={iban.account_holder || "Tuncel Textile"} onCopy={() => copy(iban.account_holder || "Tuncel Textile", t("iban_succ.account_holder"))} />
        <Row label={t("iban_succ.bank")} value={iban.bank_name || "—"} />
        <Row label={t("iban_succ.iban")} value={iban.iban || "—"} mono onCopy={iban.iban ? () => copy(iban.iban, "IBAN") : null} />
        <Row label={t("iban_succ.bic")} value={iban.bic || "—"} mono onCopy={iban.bic ? () => copy(iban.bic, "BIC") : null} />
        <Row label={t("iban_succ.reference_to_use")} value={order.reference} mono highlight onCopy={() => copy(order.reference, t("iban_succ.reference_to_use"))} />
      </div>

      {iban.instructions && (
        <div className="mt-6 flex gap-3 bg-[#F7F6F3] p-5 text-sm text-neutral-700">
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{iban.instructions}</p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to={`/track-order?ref=${encodeURIComponent(order.reference)}`}
          data-testid="iban-track-link"
          className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
        >
          {t("iban_succ.track_order")}
        </Link>
        <Link
          to="/shop/all"
          className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white"
        >
          {t("iban_succ.continue_shopping")}
        </Link>
        <a
          href={`mailto:hello@tunceltextile.com?subject=Order%20${encodeURIComponent(order.reference)}`}
          className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white"
        >
          {t("iban_succ.email_us")}
        </a>
      </div>
    </div>
  );
}

const Row = ({ label, value, mono = false, highlight = false, onCopy }) => (
  <div className={`flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4 last:border-b-0 sm:px-6 ${highlight ? "bg-black text-white" : ""}`}>
    <div className={`text-[10px] uppercase tracking-[0.25em] ${highlight ? "text-white/60" : "text-neutral-500"}`}>{label}</div>
    <div className="flex items-center gap-3">
      <span className={`text-sm ${mono ? "font-mono" : "font-semibold"} ${highlight ? "text-white" : "text-black"}`}>{value}</span>
      {onCopy && (
        <button onClick={onCopy} aria-label="Copy" className={`opacity-70 hover:opacity-100 ${highlight ? "text-white" : "text-black"}`}>
          <Copy className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);
