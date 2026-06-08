import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { purchaseGiftCard } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import TurnstileField from "@/components/TurnstileField";
import { Loader2, Gift, Mail, Sparkles } from "lucide-react";

const DENOMINATIONS = [25, 50, 100, 150, 250];

export default function GiftCards() {
  const { t } = useI18n();
  const [amount, setAmount] = useState(50);
  const [customMode, setCustomMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    recipient_name: "",
    recipient_email: "",
    message: "",
    sendTo: "recipient",
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.buyer_name || !form.buyer_email) {
      toast.error(t("gc.toast_fill"));
      return;
    }
    if (form.sendTo === "recipient" && !form.recipient_email) {
      toast.error(t("gc.toast_recipient"));
      return;
    }
    if (!amount || amount < 5) {
      toast.error(t("gc.toast_min"));
      return;
    }
    if (!captchaToken) {
      toast.error(t("toasts.captcha_required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await purchaseGiftCard({
        amount: Number(amount),
        buyer_name: form.buyer_name,
        buyer_email: form.buyer_email,
        recipient_name: form.sendTo === "recipient" ? form.recipient_name : form.buyer_name,
        recipient_email: form.sendTo === "recipient" ? form.recipient_email : form.buyer_email,
        message: form.message,
        turnstile_token: captchaToken,
      });
      window.location.href = res.checkout_url;
    } catch (ex) {
      const msg = ex?.response?.data?.detail || t("gc.toast_pay_fail");
      toast.error(msg);
      captchaRef.current?.reset();
      setCaptchaToken(null);
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="gift-cards-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("gc.hero_kicker")}</div>
        <h1 className="font-display mt-3 text-7xl uppercase leading-[0.9] tracking-[0.02em] sm:text-[10rem]">
          {t("gc.title_a")}
          <br />
          <span className="text-neutral-400">{t("gc.title_b")}</span>
        </h1>
        <p className="mt-8 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          {t("gc.hero_body")}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={submit} className="space-y-10" data-testid="gift-form">
          <Section step="01" title={t("gc.step1")}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {DENOMINATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  data-testid={`gift-amount-${d}`}
                  onClick={() => { setAmount(d); setCustomMode(false); }}
                  className={`flex flex-col items-center gap-1 border p-4 transition-colors ${
                    !customMode && amount === d ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                  }`}
                >
                  <div className="font-display text-3xl">€{d}</div>
                </button>
              ))}
              <button
                type="button"
                data-testid="gift-amount-custom"
                onClick={() => setCustomMode(true)}
                className={`flex flex-col items-center gap-1 border p-4 transition-colors ${
                  customMode ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                }`}
              >
                <div className="font-display text-lg">{t("gc.custom")}</div>
              </button>
            </div>
            {customMode && (
              <div className="mt-4 inline-flex items-center border border-black">
                <span className="px-4 py-3 font-display text-2xl">€</span>
                <input
                  type="number"
                  min={5}
                  max={1000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-32 border-l border-black px-3 py-3 font-display text-2xl outline-none"
                  data-testid="gift-amount-input"
                />
              </div>
            )}
          </Section>

          <Section step="02" title={t("gc.step2")}>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                data-testid="gift-to-recipient"
                onClick={() => setForm({ ...form, sendTo: "recipient" })}
                className={`flex flex-col items-start gap-2 border p-5 text-left transition-colors ${
                  form.sendTo === "recipient" ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                }`}
              >
                <Mail className="h-5 w-5" />
                <div className="font-display text-2xl uppercase tracking-[0.04em]">{t("gc.a_friend")}</div>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${form.sendTo === "recipient" ? "text-white/70" : "text-neutral-500"}`}>{t("gc.a_friend_b")}</div>
              </button>
              <button
                type="button"
                data-testid="gift-to-self"
                onClick={() => setForm({ ...form, sendTo: "self" })}
                className={`flex flex-col items-start gap-2 border p-5 text-left transition-colors ${
                  form.sendTo === "self" ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                }`}
              >
                <Gift className="h-5 w-5" />
                <div className="font-display text-2xl uppercase tracking-[0.04em]">{t("gc.myself")}</div>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${form.sendTo === "self" ? "text-white/70" : "text-neutral-500"}`}>{t("gc.myself_b")}</div>
              </button>
            </div>
          </Section>

          <Section step="03" title={t("gc.step3")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Text label={t("gc.your_name")}  value={form.buyer_name}  onChange={(v) => setForm({ ...form, buyer_name: v })}  testid="gift-buyer-name" />
              <Text label={t("gc.your_email")} value={form.buyer_email} onChange={(v) => setForm({ ...form, buyer_email: v })} testid="gift-buyer-email" type="email" />
            </div>
          </Section>

          {form.sendTo === "recipient" && (
            <Section step="04" title={t("gc.step4")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Text label={t("gc.their_name")}    value={form.recipient_name}  onChange={(v) => setForm({ ...form, recipient_name: v })}  testid="gift-recipient-name" />
                <Text label={t("gc.their_email")}   value={form.recipient_email} onChange={(v) => setForm({ ...form, recipient_email: v })} testid="gift-recipient-email" type="email" />
              </div>
              <div className="mt-4">
                <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("gc.message")}</label>
                <textarea
                  rows={4}
                  data-testid="gift-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 500) })}
                  placeholder={t("gc.message_ph")}
                  className="mt-2 w-full border border-black/15 px-3 py-3 text-[15px] leading-[1.7] outline-none focus:border-black"
                />
                <div className="mt-1 text-right text-[10px] uppercase tracking-[0.2em] text-neutral-400">{form.message.length}/500</div>
              </div>
            </Section>
          )}

          <div className="pt-2">
            <TurnstileField ref={captchaRef} onToken={setCaptchaToken} action="gift-card" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            data-testid="gift-submit"
            className="inline-flex w-full items-center justify-center gap-3 bg-black px-8 py-5 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {submitting ? t("gc.redirecting") : t("gc.purchase").replace("{amount}", Number(amount || 0).toFixed(2))}
          </button>
        </form>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="overflow-hidden border border-black shadow-2xl">
            <div className="relative aspect-[5/3] bg-black text-white">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12), transparent 50%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.35em] text-white/50">{t("gc.card_brand")}</div>
                    <div className="font-display mt-1 text-2xl uppercase tracking-[0.04em]">{t("gc.card_label")}</div>
                  </div>
                  <Gift className="h-6 w-6 text-white/70" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">{t("gc.card_amount")}</div>
                  <div className="font-display mt-1 text-7xl uppercase leading-none tracking-[0.04em]">€{Number(amount || 0).toFixed(0)}</div>
                  <div className="mt-6 flex items-baseline justify-between gap-3">
                    <div className="font-mono text-xs tracking-[0.2em] text-white/70">XXXX-XXXX-XXXX-XXXX</div>
                    <div className="text-[9px] uppercase tracking-[0.25em] text-white/40">{t("gc.card_valid")}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-5">
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">{t("gc.what_they_see")}</div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                <strong>{form.recipient_name || t("gc.recipient_default")}</strong> {t("gc.preview_body_a")}
              </p>
            </div>
          </div>

          <div className="mt-6 border border-black/15 p-5">
            <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">{t("gc.how_it_works")}</div>
            <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-neutral-700">
              <li>{t("gc.how_a")}</li>
              <li>{t("gc.how_b")}</li>
              <li>{t("gc.how_c")}</li>
              <li>{t("gc.how_d")}</li>
            </ol>
            <Link to="/faq" className="tx-link mt-4 inline-block text-[11px] uppercase tracking-[0.25em]">{t("gc.more_questions")}</Link>
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

const Text = ({ label, value, onChange, type = "text", testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      className="mt-2 w-full border border-black/15 px-3 py-3 outline-none focus:border-black"
    />
  </div>
);
