import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { lookupOrder } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { Loader2, Package, Check, Truck, Home, X, Clock } from "lucide-react";

const STAGE_KEYS = ["pending", "processing", "shipped", "out_for_delivery", "delivered"];
const STAGE_ICON = { pending: Clock, processing: Package, shipped: Truck, out_for_delivery: Truck, delivered: Home };

function indexOfStatus(status) {
  const i = STAGE_KEYS.indexOf(status);
  return i === -1 ? 0 : i;
}

export default function TrackOrder() {
  const [params] = useSearchParams();
  const { t } = useI18n();
  const [reference, setReference] = useState((params.get("ref") || "").toUpperCase());
  const [email, setEmail] = useState(params.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  const STAGES = STAGE_KEYS.map((k) => ({
    key: k,
    label: t(`tk.stage_${k === "out_for_delivery" ? "out" : k}`),
    body: t(`tk.stage_${k === "out_for_delivery" ? "out" : k}_b`),
    icon: STAGE_ICON[k],
  }));

  const search = async (e) => {
    if (e) e.preventDefault();
    if (!reference || !email) {
      toast.error(t("tk.toast_missing"));
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await lookupOrder(reference.trim().toUpperCase(), email.trim());
      setOrder(res);
    } catch (ex) {
      setOrder(null);
      setErr(t("tk.error_not_found"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ref = params.get("ref");
    const em = params.get("email");
    if (ref && em) {
      setReference(ref.toUpperCase());
      setEmail(em);
      setTimeout(() => { search(); }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCancelled = order?.fulfillment_status === "cancelled";
  const stageIdx = order ? indexOfStatus(order.fulfillment_status) : 0;

  return (
    <div data-testid="track-order-page" className="mx-auto max-w-[1100px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("tk.kicker")}</div>
        <h1 className="font-display mt-3 text-6xl uppercase leading-none tracking-[0.02em] sm:text-8xl">
          {t("tk.title_a")}
          <br />
          <span className="text-neutral-400">{t("tk.title_b")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          {t("tk.body").split("{ref}").map((part, i, arr) =>
            i < arr.length - 1 ? (<React.Fragment key={i}>{part}<span className="font-mono">TT-XXXXXX</span></React.Fragment>) : part
          )}
        </p>
      </section>

      <section className="py-10">
        <form onSubmit={search} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]" data-testid="track-form">
          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("tk.ref_label")}</label>
            <input
              data-testid="track-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="TT-XXXXXX"
              className="mt-2 w-full border border-black/15 px-3 py-3 font-mono uppercase outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("tk.email_label")}</label>
            <input
              data-testid="track-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="mt-2 w-full border border-black/15 px-3 py-3 outline-none focus:border-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="track-submit"
            className="self-end bg-black px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("tk.track_btn")}
          </button>
        </form>

        {err && (
          <div data-testid="track-error" className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {err}
          </div>
        )}
      </section>

      {order && (
        <section data-testid="track-result" className="border-t border-black/10 py-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("tk.order_label")}</div>
              <div className="mt-1 flex flex-wrap items-baseline gap-4">
                <h2 className="font-display text-5xl uppercase tracking-[0.04em]">{order.reference}</h2>
                <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  isCancelled ? "bg-red-100 text-red-900" :
                  order.fulfillment_status === "delivered" ? "bg-black text-white" :
                  "bg-neutral-100 text-neutral-700"
                }`}>{(order.fulfillment_status || "pending").replace(/_/g, " ")}</span>
              </div>

              {isCancelled ? (
                <div className="mt-8 flex items-start gap-3 border border-red-200 bg-red-50 p-5">
                  <X className="mt-1 h-5 w-5 text-red-700" />
                  <div>
                    <div className="font-display text-xl uppercase tracking-[0.04em] text-red-900">{t("tk.cancelled_title")}</div>
                    <p className="mt-1 text-sm text-red-800">{order.shipping_note || t("tk.cancelled_default")}</p>
                  </div>
                </div>
              ) : (
                <ol className="mt-10 space-y-6">
                  {STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const done = i < stageIdx;
                    const current = i === stageIdx;
                    return (
                      <li key={stage.key} className="flex items-start gap-4" data-testid={`track-stage-${stage.key}`}>
                        <div className={`mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${
                          done ? "bg-black text-white border-black" : current ? "border-black bg-white text-black" : "border-black/15 text-neutral-300"
                        }`}>
                          {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 border-b border-black/5 pb-6">
                          <div className={`font-display text-xl uppercase tracking-[0.04em] ${current ? "text-black" : done ? "text-neutral-600" : "text-neutral-300"}`}>
                            {stage.label}
                          </div>
                          {(done || current) && (
                            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{stage.body}</p>
                          )}
                          {current && order.shipping_note && (
                            <p className="mt-2 text-sm italic text-neutral-500">&ldquo;{order.shipping_note}&rdquo;</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {(order.tracking_number || order.tracking_url) && !isCancelled && (
                <div className="mt-10 border border-black/10 p-6">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("tk.courier_tracking")}</div>
                  {order.tracking_carrier && (
                    <div className="mt-2 font-display text-2xl uppercase tracking-[0.04em]">{order.tracking_carrier}</div>
                  )}
                  {order.tracking_number && (
                    <div className="mt-2 font-mono text-sm">{order.tracking_number}</div>
                  )}
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="track-courier-link"
                      className="mt-4 inline-flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
                    >
                      {t("tk.open_with_courier")}
                    </a>
                  )}
                </div>
              )}
            </div>

            <aside className="h-fit border border-black/15 p-6">
              <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("tk.summary")}</div>
              <ul className="mt-4 space-y-3 text-[12px] uppercase tracking-[0.2em] text-neutral-600">
                <li className="flex justify-between gap-3">
                  <span className="text-neutral-400">{t("tk.customer")}</span>
                  <span className="text-right text-black">{order.customer_name || "—"}</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-neutral-400">{t("tk.payment")}</span>
                  <span className="text-right text-black">{order.payment_method === "iban" ? t("tk.pay_iban") : t("tk.pay_card")} · {(order.payment_status || "").replace(/_/g, " ")}</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-neutral-400">{t("tk.amount")}</span>
                  <span className="text-right text-black font-semibold">€{Number(order.amount || 0).toFixed(2)}</span>
                </li>
                {order.shipping_address && (
                  <li>
                    <div className="text-neutral-400">{t("tk.ship_to")}</div>
                    <div className="mt-1 text-right text-black normal-case tracking-normal">{order.shipping_address}</div>
                  </li>
                )}
              </ul>
              {order.items_summary && (
                <div className="mt-6 border-t border-black/10 pt-4 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  <div className="text-neutral-400">{t("tk.items")}</div>
                  <div className="mt-1 text-black normal-case tracking-normal">{order.items_summary}</div>
                </div>
              )}
              <div className="mt-6 border-t border-black/10 pt-4 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                {t("tk.help_text")}
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
