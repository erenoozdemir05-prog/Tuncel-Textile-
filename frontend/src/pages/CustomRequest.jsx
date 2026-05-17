import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitCustomRequest } from "@/lib/api";
import { useSettings, buildWhatsappLink } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react";

const PRODUCT_TYPES = [
  { key: "hoodie", label: "Hoodie", desc: "Heavyweight fleece, oversized cut" },
  { key: "tshirt", label: "T-Shirt", desc: "Heavy cotton, drop shoulder" },
  { key: "longsleeve", label: "Long Sleeve", desc: "Mid-weight knit" },
  { key: "tote", label: "Tote bag", desc: "Heavy canvas" },
  { key: "cap", label: "Cap", desc: "Six panel cotton" },
  { key: "other", label: "Something else", desc: "Tell us in the brief" },
];

const STYLES = [
  { key: "minimalist", label: "Minimalist", body: "Type-led, sparse" },
  { key: "typographic", label: "Typographic", body: "Big quotes, large type" },
  { key: "graphic", label: "Graphic", body: "Illustration, mascot" },
  { key: "monochrome", label: "Monochrome", body: "Black on white / inverse" },
  { key: "editorial", label: "Editorial", body: "Photography-based" },
  { key: "other", label: "Open to ideas", body: "We'll propose" },
];

const PLACEMENTS = ["Front chest", "Centre front", "Centre back", "Left sleeve", "Right sleeve", "Hood / collar", "Full print"];
const BUDGETS = ["Under €50 · 1 piece", "€50 – €150 · few pieces", "€150 – €500 · small drop", "€500 – €1 500 · larger run", "€1 500+ · wholesale"];

export default function CustomRequest() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [refImages, setRefImages] = useState([]); // base64 thumbnails for preview only
  const [form, setForm] = useState({
    customer_name: "", email: "", phone: "",
    product_type: "hoodie", design_style: "minimalist",
    idea_description: "", print_placement: "Centre front",
    primary_color: "#0B0B0B", quantity: 1, budget_range: "€50 – €150 · few pieces",
    contact_preference: "email",
  });

  const onFile = (files) => {
    const arr = Array.from(files).slice(0, 4);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setRefImages((prev) => [...prev, reader.result].slice(0, 4));
      reader.readAsDataURL(file);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.email || !form.idea_description) {
      toast.error("Please complete name, email and your brief.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitCustomRequest({
        ...form,
        quantity: Number(form.quantity) || 1,
        image_urls: refImages, // base64 inline; admin can review
      });
      setSubmitted(res);
      toast.success(`Request received · ${res.reference}`);
    } catch {
      toast.error("Submit failed — please try again or message us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = useMemo(() => PRODUCT_TYPES.find((p) => p.key === form.product_type), [form.product_type]);
  const selectedStyle = useMemo(() => STYLES.find((s) => s.key === form.design_style), [form.design_style]);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <Sparkles className="mx-auto h-8 w-8 text-black" />
        <h1 className="font-display mt-6 text-6xl uppercase leading-none tracking-[0.02em] sm:text-7xl">Brief received</h1>
        <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-neutral-700">
          Thank you. We've logged your brief — reference <span className="font-mono font-semibold">{submitted.reference}</span>. One of the founders will review it personally and reply within 24 hours.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={buildWhatsappLink(settings, `Hello — I just submitted custom request ${submitted.reference}.`)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white">Continue on WhatsApp</a>
          <Link to="/shop/all" className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">Browse the collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="custom-request-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      {/* HERO */}
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Atelier · Bespoke service</div>
        <h1 className="font-display mt-3 text-7xl uppercase leading-[0.9] tracking-[0.02em] sm:text-[10rem]">
          Your idea,
          <br />
          hand-finished by us.
        </h1>
        <p className="mt-8 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          From <strong className="text-black">a single tee for yourself</strong> to a small-batch drop or wholesale run — share your concept below and one of the founders will reply personally within <strong className="text-black">24 hours</strong> with a sample mock-up and a transparent quote. Starting from <strong className="text-black">€35</strong> per piece.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Free design consultation</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Sample mock-up included</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Made in our Riga atelier</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Minimum 1 piece — no MOQ</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-10" data-testid="custom-request-form">
          {/* STEP 1 — Product */}
          <Section step="01" title="Choose a canvas">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRODUCT_TYPES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  data-testid={`cr-product-${p.key}`}
                  onClick={() => setForm({ ...form, product_type: p.key })}
                  className={`flex flex-col items-start gap-1 border p-4 text-left text-[12px] uppercase tracking-[0.15em] transition-colors ${
                    form.product_type === p.key ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                  }`}
                >
                  <span className="font-display text-xl">{p.label}</span>
                  <span className={`text-[10px] tracking-[0.2em] ${form.product_type === p.key ? "text-white/70" : "text-neutral-500"}`}>{p.desc}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* STEP 2 — Style */}
          <Section step="02" title="Pick a design direction">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  data-testid={`cr-style-${s.key}`}
                  onClick={() => setForm({ ...form, design_style: s.key })}
                  className={`flex flex-col items-start gap-1 border p-4 text-left text-[12px] uppercase tracking-[0.15em] transition-colors ${
                    form.design_style === s.key ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                  }`}
                >
                  <span className="font-display text-xl">{s.label}</span>
                  <span className={`text-[10px] tracking-[0.2em] ${form.design_style === s.key ? "text-white/70" : "text-neutral-500"}`}>{s.body}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* STEP 3 — Idea brief */}
          <Section step="03" title="Tell us the idea">
            <textarea
              data-testid="cr-idea"
              rows={6}
              value={form.idea_description}
              onChange={(e) => setForm({ ...form, idea_description: e.target.value })}
              placeholder="Describe the print, story, copy, mood, references. The more vivid the better."
              className="w-full border border-black/15 px-4 py-3 text-[15px] leading-[1.7] outline-none focus:border-black"
            />
            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Reference images (up to 4)</label>
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
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFile(e.target.files)} data-testid="cr-upload" />
                  </label>
                )}
              </div>
            </div>
          </Section>

          {/* STEP 4 — Placement, color, qty, budget */}
          <Section step="04" title="Production details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField label="Print placement" value={form.print_placement} onChange={(v) => setForm({ ...form, print_placement: v })} options={PLACEMENTS} testid="cr-placement" />
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Primary color</label>
                <div className="mt-2 flex items-center gap-3">
                  <input type="color" data-testid="cr-color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-11 w-16 cursor-pointer border border-black/15" />
                  <input type="text" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1 border border-black/15 px-3 py-2 font-mono text-sm uppercase" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Quantity</label>
                <div className="mt-2 inline-flex items-center border border-black/15">
                  <button type="button" onClick={() => setForm({ ...form, quantity: Math.max(1, Number(form.quantity) - 1) })} className="px-3 py-2 hover:bg-black hover:text-white">−</button>
                  <input data-testid="cr-quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-20 border-x border-black/15 px-3 py-2 text-center text-sm font-semibold" />
                  <button type="button" onClick={() => setForm({ ...form, quantity: Number(form.quantity) + 1 })} className="px-3 py-2 hover:bg-black hover:text-white">+</button>
                </div>
              </div>
              <SelectField label="Budget range" value={form.budget_range} onChange={(v) => setForm({ ...form, budget_range: v })} options={BUDGETS} testid="cr-budget" />
            </div>
          </Section>

          {/* STEP 5 — Contact */}
          <Section step="05" title="How can we reach you?">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Full name *" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} required testid="cr-name" />
              <TextField label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required testid="cr-email" />
              <TextField label="Phone / WhatsApp" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="cr-phone" />
              <SelectField label="Preferred channel" value={form.contact_preference} onChange={(v) => setForm({ ...form, contact_preference: v })} options={["email", "whatsapp"]} testid="cr-channel" />
            </div>
          </Section>

          <button
            type="submit"
            disabled={submitting}
            data-testid="cr-submit"
            className="inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-5 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Sending…" : "Submit brief · Receive a reply within 24h"}
          </button>
        </form>

        {/* LIVE PREVIEW */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="border border-black/15 p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Live preview</div>
            <div className="mt-3 font-display text-3xl uppercase tracking-[0.04em]">Your brief</div>

            <div className="mt-6 aspect-[4/5] w-full overflow-hidden bg-neutral-100">
              <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: form.primary_color }}>
                <div className="px-6 text-center">
                  <div className="font-display text-3xl uppercase tracking-[0.04em] text-white mix-blend-difference">{selectedProduct?.label}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/80 mix-blend-difference">{selectedStyle?.label}</div>
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-[12px] uppercase tracking-[0.2em] text-neutral-600">
              <li><span className="text-neutral-400">Canvas · </span><span className="text-black">{selectedProduct?.label}</span></li>
              <li><span className="text-neutral-400">Style · </span><span className="text-black">{selectedStyle?.label}</span></li>
              <li><span className="text-neutral-400">Placement · </span><span className="text-black">{form.print_placement}</span></li>
              <li><span className="text-neutral-400">Quantity · </span><span className="text-black">{form.quantity}</span></li>
              <li><span className="text-neutral-400">Budget · </span><span className="text-black">{form.budget_range}</span></li>
              <li><span className="text-neutral-400">Color · </span><span className="font-mono text-black">{form.primary_color}</span></li>
            </ul>

            <div className="mt-6 border-t border-black/10 pt-4 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              No surprises. We confirm everything in writing before production starts.
            </div>
          </div>
        </aside>
      </div>

      {/* FAQ teaser */}
      <section className="border-t border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">More questions?</div>
        <h2 className="font-display mt-2 text-4xl uppercase tracking-[0.04em] sm:text-5xl">Read the FAQ →</h2>
        <Link to="/faq" className="tx-link mt-4 inline-block text-[12px] uppercase tracking-[0.25em]">All answered questions</Link>
      </section>
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

const TextField = ({ label, value, onChange, type = "text", required = false, testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
      className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black" />
  </div>
);

const SelectField = ({ label, value, onChange, options, testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    <div className="relative mt-2">
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
        className="w-full appearance-none border border-black/15 bg-white px-3 py-2 pr-9 outline-none focus:border-black">
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  </div>
);
