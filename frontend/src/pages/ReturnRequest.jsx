import React, { useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { submitReturn } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import TurnstileField from "@/components/TurnstileField";
import { Loader2, Check, RefreshCw, Coins } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ReturnRequest() {
  const [params] = useSearchParams();
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [refImages, setRefImages] = useState([]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const [form, setForm] = useState({
    order_reference: (params.get("ref") || "").toUpperCase(),
    email: params.get("email") || "",
    return_type: "refund",
    reason: "size_too_small",
    description: "",
    items: [],
    exchange_size: "M",
    iban_for_refund: "",
    iban_choice: "same",
  });

  const REASONS = [
    { key: "size_too_small", label: t("rr.reason_too_small") },
    { key: "size_too_big",   label: t("rr.reason_too_big") },
    { key: "not_as_described", label: t("rr.reason_not_described") },
    { key: "quality_issue",  label: t("rr.reason_quality") },
    { key: "wrong_item",     label: t("rr.reason_wrong_item") },
    { key: "changed_mind",   label: t("rr.reason_changed") },
    { key: "other",          label: t("rr.reason_other") },
  ];

  const onFile = (files) => {
    Array.from(files).slice(0, 4).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setRefImages((prev) => [...prev, reader.result].slice(0, 4));
      reader.readAsDataURL(file);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.order_reference || !form.email || !form.description) {
      toast.error(t("rr.toast_fill"));
      return;
    }
    if (!captchaToken) {
      toast.error(t("toasts.captcha_required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitReturn({
        ...form,
        order_reference: form.order_reference.trim().toUpperCase(),
        email: form.email.trim(),
        image_urls: refImages,
        turnstile_token: captchaToken,
      });
      setSubmitted(res);
      toast.success(t("rr.toast_submitted").replace("{ref}", res.reference));
    } catch (ex) {
      const msg = ex?.response?.data?.detail || t("rr.toast_fail");
      toast.error(msg);
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8" data-testid="return-success">
        <Check className="mx-auto h-8 w-8 text-black" />
        <h1 className="font-display mt-6 text-6xl uppercase leading-none tracking-[0.02em] sm:text-7xl">{t("rr.received_title")}</h1>
        <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-neutral-700">
          {t("rr.received_body").split("{ref}").map((part, i, arr) =>
            i < arr.length - 1
              ? (<React.Fragment key={i}>{part}<span className="font-mono font-semibold">{submitted.reference}</span></React.Fragment>)
              : part
          )}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/track-order" className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white">{t("rr.track_order")}</Link>
          <Link to="/shop/all" className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">{t("rr.continue_shopping")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="return-page" className="mx-auto max-w-[1100px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("rr.kicker")}</div>
        <h1 className="font-display mt-3 text-6xl uppercase leading-none tracking-[0.02em] sm:text-8xl">
          {t("rr.title_a")}
          <br />
          <span className="text-neutral-400">{t("rr.title_b")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          {t("rr.hero_body")}
        </p>
      </section>

      <form onSubmit={submit} className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1fr_380px]" data-testid="return-form">
        <div className="space-y-10">
          <Section step="01" title={t("rr.step1")}>
            <div className="grid grid-cols-2 gap-3">
              <TypeCard
                active={form.return_type === "refund"}
                onClick={() => setForm({ ...form, return_type: "refund" })}
                title={t("rr.type_refund")}
                body={t("rr.type_refund_b")}
                icon={Coins}
                testid="return-type-refund"
              />
              <TypeCard
                active={form.return_type === "exchange"}
                onClick={() => setForm({ ...form, return_type: "exchange" })}
                title={t("rr.type_exchange")}
                body={t("rr.type_exchange_b")}
                icon={RefreshCw}
                testid="return-type-exchange"
              />
            </div>
          </Section>

          <Section step="02" title={t("rr.step2")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label={t("rr.order_ref")} value={form.order_reference} onChange={(v) => setForm({ ...form, order_reference: v.toUpperCase() })} placeholder="TT-XXXXXX" testid="return-ref" mono />
              <TextField label={t("rr.email_used")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testid="return-email" />
            </div>
          </Section>

          <Section step="03" title={t("rr.step3")}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REASONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  data-testid={`return-reason-${r.key}`}
                  onClick={() => setForm({ ...form, reason: r.key })}
                  className={`border p-3 text-left text-[12px] uppercase tracking-[0.15em] transition-colors ${
                    form.reason === r.key ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              data-testid="return-description"
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("rr.desc_ph")}
              className="mt-4 w-full border border-black/15 px-4 py-3 text-[15px] leading-[1.7] outline-none focus:border-black"
              maxLength={4000}
            />

            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("rr.photos_lbl")}</label>
              <div className="mt-2 flex flex-wrap gap-3">
                {refImages.map((src, i) => (
                  <div key={i} className="relative h-24 w-24 overflow-hidden border border-black/15">
                    <img src={src} alt={`ref-${i}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setRefImages(refImages.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-white/90 px-1 text-[10px]">✕</button>
                  </div>
                ))}
                {refImages.length < 4 && (
                  <label className="flex h-24 w-24 cursor-pointer items-center justify-center border border-dashed border-black/30 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:border-black">
                    {t("rr.add")}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFile(e.target.files)} data-testid="return-upload" />
                  </label>
                )}
              </div>
            </div>
          </Section>

          {form.return_type === "exchange" ? (
            <Section step="04" title={t("rr.step4_exchange")}>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-testid={`return-size-${s.toLowerCase()}`}
                    onClick={() => setForm({ ...form, exchange_size: s })}
                    className={`min-w-[60px] border px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] ${
                      form.exchange_size === s ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          ) : (
            <Section step="04" title={t("rr.step4_refund")}>
              <p className="text-sm text-neutral-600">
                {t("rr.refund_body")}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="return-iban-same"
                  onClick={() => setForm({ ...form, iban_choice: "same", iban_for_refund: "__SAME_AS_PAYMENT__" })}
                  className={`border p-4 text-left transition-colors ${
                    form.iban_choice === "same" ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                  }`}
                >
                  <div className="font-display text-lg uppercase tracking-[0.04em]">{t("rr.iban_same")}</div>
                  <div className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${form.iban_choice === "same" ? "text-white/70" : "text-neutral-500"}`}>{t("rr.iban_same_b")}</div>
                </button>
                <button
                  type="button"
                  data-testid="return-iban-different"
                  onClick={() => setForm({ ...form, iban_choice: "different", iban_for_refund: "" })}
                  className={`border p-4 text-left transition-colors ${
                    form.iban_choice === "different" ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                  }`}
                >
                  <div className="font-display text-lg uppercase tracking-[0.04em]">{t("rr.iban_diff")}</div>
                  <div className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${form.iban_choice === "different" ? "text-white/70" : "text-neutral-500"}`}>{t("rr.iban_diff_b")}</div>
                </button>
              </div>
              {form.iban_choice === "different" && (
                <TextField label={t("rr.iban_lbl")} value={form.iban_for_refund} onChange={(v) => setForm({ ...form, iban_for_refund: v })} testid="return-iban" mono placeholder="LV00 0000 0000 0000 0000 0" />
              )}
            </Section>
          )}

          <div className="pt-2">
            <TurnstileField ref={captchaRef} onToken={setCaptchaToken} action="return-request" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            data-testid="return-submit"
            className="inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-5 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? t("rr.sending") : t("rr.submit")}
          </button>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="border border-black/15 p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("rr.policy")}</div>
            <ul className="mt-4 space-y-3 text-[13px] leading-[1.7] text-neutral-700">
              <li>{t("rr.p1")}</li>
              <li>{t("rr.p2")}</li>
              <li>{t("rr.p3")}</li>
              <li>{t("rr.p4")}</li>
              <li>{t("rr.p5")}</li>
            </ul>
            <div className="mt-6 border-t border-black/10 pt-4 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              {t("rr.p_help")}
            </div>
          </div>
        </aside>
      </form>
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

const TextField = ({ label, value, onChange, type = "text", placeholder = "", testid, mono = false }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      placeholder={placeholder}
      className={`mt-2 w-full border border-black/15 px-3 py-3 outline-none focus:border-black ${mono ? "font-mono uppercase" : ""}`}
    />
  </div>
);

const TypeCard = ({ active, onClick, title, body, icon: Icon, testid }) => (
  <button
    type="button"
    data-testid={testid}
    onClick={onClick}
    className={`flex flex-col items-start gap-2 border p-5 text-left transition-colors ${
      active ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
    }`}
  >
    <Icon className="h-5 w-5" />
    <div className="font-display text-2xl uppercase tracking-[0.04em]">{title}</div>
    <div className={`text-[12px] uppercase tracking-[0.15em] ${active ? "text-white/70" : "text-neutral-500"}`}>{body}</div>
  </button>
);
