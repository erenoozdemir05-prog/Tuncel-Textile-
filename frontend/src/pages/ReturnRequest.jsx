import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { submitReturn } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Check, RefreshCw, Coins } from "lucide-react";

const REASONS = [
  { key: "size_too_small", label: "Size too small" },
  { key: "size_too_big", label: "Size too big" },
  { key: "not_as_described", label: "Not as described" },
  { key: "quality_issue", label: "Quality issue / defect" },
  { key: "wrong_item", label: "Wrong item received" },
  { key: "changed_mind", label: "Changed my mind" },
  { key: "other", label: "Other" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ReturnRequest() {
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [refImages, setRefImages] = useState([]);
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
      toast.error("Please fill order reference, email and a brief description.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitReturn({
        ...form,
        order_reference: form.order_reference.trim().toUpperCase(),
        email: form.email.trim(),
        image_urls: refImages,
      });
      setSubmitted(res);
      toast.success(`Return request submitted · ${res.reference}`);
    } catch (ex) {
      const msg = ex?.response?.data?.detail || "Submission failed — please check your details.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8" data-testid="return-success">
        <Check className="mx-auto h-8 w-8 text-black" />
        <h1 className="font-display mt-6 text-6xl uppercase leading-none tracking-[0.02em] sm:text-7xl">Received</h1>
        <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-neutral-700">
          Thank you. Your return request <span className="font-mono font-semibold">{submitted.reference}</span> has been logged. We review every request within 24 hours and reply by email with the next steps.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/track-order" className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white">Track your order</Link>
          <Link to="/shop/all" className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="return-page" className="mx-auto max-w-[1100px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Atelier · Returns & exchanges</div>
        <h1 className="font-display mt-3 text-6xl uppercase leading-none tracking-[0.02em] sm:text-8xl">
          Not quite
          <br />
          <span className="text-neutral-400">right?</span>
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          Standard pieces may be returned unworn within 14 days for a refund or an exchange.
          Limited-edition drops and bespoke pieces are final sale. Fill in the form and we'll respond personally within 24 hours.
        </p>
      </section>

      <form onSubmit={submit} className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1fr_380px]" data-testid="return-form">
        <div className="space-y-10">
          {/* TYPE */}
          <Section step="01" title="Refund or exchange?">
            <div className="grid grid-cols-2 gap-3">
              <TypeCard
                active={form.return_type === "refund"}
                onClick={() => setForm({ ...form, return_type: "refund" })}
                title="Refund"
                body="Money back to your card or IBAN"
                icon={Coins}
                testid="return-type-refund"
              />
              <TypeCard
                active={form.return_type === "exchange"}
                onClick={() => setForm({ ...form, return_type: "exchange" })}
                title="Exchange"
                body="Swap for a different size"
                icon={RefreshCw}
                testid="return-type-exchange"
              />
            </div>
          </Section>

          {/* ORDER */}
          <Section step="02" title="Find your order">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Order reference" value={form.order_reference} onChange={(v) => setForm({ ...form, order_reference: v.toUpperCase() })} placeholder="TT-XXXXXX" testid="return-ref" mono />
              <TextField label="Email used at checkout" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testid="return-email" />
            </div>
          </Section>

          {/* REASON */}
          <Section step="03" title="Tell us why">
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
              placeholder="Describe the issue. Be as specific as possible."
              className="mt-4 w-full border border-black/15 px-4 py-3 text-[15px] leading-[1.7] outline-none focus:border-black"
              maxLength={4000}
            />

            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Photos (up to 4) — helpful for defects</label>
              <div className="mt-2 flex flex-wrap gap-3">
                {refImages.map((src, i) => (
                  <div key={i} className="relative h-24 w-24 overflow-hidden border border-black/15">
                    <img src={src} alt={`ref-${i}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setRefImages(refImages.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-white/90 px-1 text-[10px]">✕</button>
                  </div>
                ))}
                {refImages.length < 4 && (
                  <label className="flex h-24 w-24 cursor-pointer items-center justify-center border border-dashed border-black/30 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:border-black">
                    Add
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFile(e.target.files)} data-testid="return-upload" />
                  </label>
                )}
              </div>
            </div>
          </Section>

          {/* CONDITIONAL: exchange size or refund IBAN */}
          {form.return_type === "exchange" ? (
            <Section step="04" title="Which size would you like instead?">
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
            <Section step="04" title="Where should we send your refund?">
              <p className="text-sm text-neutral-600">
                Card payments are refunded to the original card automatically. For IBAN orders, choose how you'd like the refund.
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
                  <div className="font-display text-lg uppercase tracking-[0.04em]">Same IBAN I paid from</div>
                  <div className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${form.iban_choice === "same" ? "text-white/70" : "text-neutral-500"}`}>No need to type it again</div>
                </button>
                <button
                  type="button"
                  data-testid="return-iban-different"
                  onClick={() => setForm({ ...form, iban_choice: "different", iban_for_refund: "" })}
                  className={`border p-4 text-left transition-colors ${
                    form.iban_choice === "different" ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                  }`}
                >
                  <div className="font-display text-lg uppercase tracking-[0.04em]">A different IBAN</div>
                  <div className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${form.iban_choice === "different" ? "text-white/70" : "text-neutral-500"}`}>Enter the IBAN below</div>
                </button>
              </div>
              {form.iban_choice === "different" && (
                <TextField label="IBAN" value={form.iban_for_refund} onChange={(v) => setForm({ ...form, iban_for_refund: v })} testid="return-iban" mono placeholder="LV00 0000 0000 0000 0000 0" />
              )}
            </Section>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="return-submit"
            className="inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-5 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Sending…" : "Submit request · Reply within 24h"}
          </button>
        </div>

        {/* SIDEBAR — policy */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="border border-black/15 p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Return policy</div>
            <ul className="mt-4 space-y-3 text-[13px] leading-[1.7] text-neutral-700">
              <li>· 14 days from delivery to start a return.</li>
              <li>· Items must be unworn, unwashed, with tags.</li>
              <li>· Limited-edition drops & bespoke = final sale.</li>
              <li>· Refunds processed within 7 business days.</li>
              <li>· Exchange shipping covered by us for size issues.</li>
            </ul>
            <div className="mt-6 border-t border-black/10 pt-4 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              Questions? Email tunceltextile@gmail.com or WhatsApp us.
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
