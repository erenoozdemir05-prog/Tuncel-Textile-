import React, { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitCustomRequest } from "@/lib/api";
import { useSettings, buildWhatsappLink } from "@/contexts/SettingsContext";
import { useI18n } from "@/contexts/I18nContext";
import TurnstileField from "@/components/TurnstileField";
import { toast } from "sonner";
import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react";

export default function CustomRequest() {
  const { settings } = useSettings();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [refImages, setRefImages] = useState([]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const [form, setForm] = useState({
    customer_name: "", email: "", phone: "",
    product_type: "hoodie", design_style: "minimalist",
    idea_description: "", print_placement: "centre_front",
    print_size: "M",
    primary_color: "#0B0B0B", quantity: 1, budget_range: "50_150",
    contact_preference: "email",
  });

  const PRODUCT_TYPES = [
    { key: "hoodie",     label: t("cr.pt_hoodie"),     desc: t("cr.pt_hoodie_d") },
    { key: "tshirt",     label: t("cr.pt_tshirt"),     desc: t("cr.pt_tshirt_d") },
    { key: "longsleeve", label: t("cr.pt_longsleeve"), desc: t("cr.pt_longsleeve_d") },
    { key: "tote",       label: t("cr.pt_tote"),       desc: t("cr.pt_tote_d") },
    { key: "cap",        label: t("cr.pt_cap"),        desc: t("cr.pt_cap_d") },
    { key: "other",      label: t("cr.pt_other"),      desc: t("cr.pt_other_d") },
  ];
  const STYLES = [
    { key: "minimalist",  label: t("cr.st_minimalist"),  body: t("cr.st_minimalist_b") },
    { key: "typographic", label: t("cr.st_typographic"), body: t("cr.st_typographic_b") },
    { key: "graphic",     label: t("cr.st_graphic"),     body: t("cr.st_graphic_b") },
    { key: "monochrome",  label: t("cr.st_monochrome"),  body: t("cr.st_monochrome_b") },
    { key: "editorial",   label: t("cr.st_editorial"),   body: t("cr.st_editorial_b") },
    { key: "other",       label: t("cr.st_other"),       body: t("cr.st_other_b") },
  ];
  const PLACEMENTS = [
    { key: "front_chest",   label: t("cr.pl_front_chest") },
    { key: "centre_front",  label: t("cr.pl_centre_front") },
    { key: "centre_back",   label: t("cr.pl_centre_back") },
    { key: "left_sleeve",   label: t("cr.pl_left_sleeve") },
    { key: "right_sleeve",  label: t("cr.pl_right_sleeve") },
    { key: "hood",          label: t("cr.pl_hood") },
    { key: "full",          label: t("cr.pl_full") },
  ];
  const PRINT_SIZES = [
    { key: "S", label: t("cr.ps_s_label"), desc: t("cr.ps_s_desc") },
    { key: "M", label: t("cr.ps_m_label"), desc: t("cr.ps_m_desc") },
    { key: "L", label: t("cr.ps_l_label"), desc: t("cr.ps_l_desc") },
  ];
  const BUDGETS = [
    { key: "under_50", label: t("cr.bud_under") },
    { key: "50_150",   label: t("cr.bud_50_150") },
    { key: "150_500",  label: t("cr.bud_150_500") },
    { key: "500_1500", label: t("cr.bud_500_1500") },
    { key: "1500_p",   label: t("cr.bud_1500p") },
  ];

  const onFile = (files) => {
    Array.from(files).slice(0, 4).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setRefImages((prev) => [...prev, reader.result].slice(0, 4));
      reader.readAsDataURL(file);
    });
  };

  const labelOf = (arr, k) => (arr.find((x) => x.key === k)?.label) || k;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.email || !form.idea_description) {
      toast.error(t("cr.toast_fill"));
      return;
    }
    if (!captchaToken) {
      toast.error(t("toasts.captcha_required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitCustomRequest({
        ...form,
        print_placement: labelOf(PLACEMENTS, form.print_placement),
        budget_range:    labelOf(BUDGETS, form.budget_range),
        quantity: Number(form.quantity) || 1,
        image_urls: refImages,
        turnstile_token: captchaToken,
      });
      setSubmitted(res);
      toast.success(t("cr.toast_received").replace("{ref}", res.reference));
    } catch (ex) {
      toast.error(ex?.response?.data?.detail || t("cr.toast_fail"));
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = useMemo(() => PRODUCT_TYPES.find((p) => p.key === form.product_type), [form.product_type, t]);
  const selectedStyle = useMemo(() => STYLES.find((s) => s.key === form.design_style), [form.design_style, t]);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <Sparkles className="mx-auto h-8 w-8 text-black" />
        <h1 className="font-display mt-6 text-6xl uppercase leading-none tracking-[0.02em] sm:text-7xl">{t("cr.brief_received")}</h1>
        <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-neutral-700">
          {t("cr.brief_received_body").split("{ref}").map((part, i, arr) =>
            i < arr.length - 1
              ? (<React.Fragment key={i}>{part}<span className="font-mono font-semibold">{submitted.reference}</span></React.Fragment>)
              : part
          )}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={buildWhatsappLink(settings, `Hello — I just submitted custom request ${submitted.reference}.`)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white">{t("cr.continue_wa")}</a>
          <Link to="/shop/all" className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">{t("cr.browse_collection")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="custom-request-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("cr.hero_kicker")}</div>
        <h1 className="font-display mt-3 text-7xl uppercase leading-[0.9] tracking-[0.02em] sm:text-[10rem]">
          {t("cr.hero_a")}
          <br />
          {t("cr.hero_b")}
        </h1>
        <p className="mt-8 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          {t("cr.hero_body_a")} <strong className="text-black">{t("cr.hero_strong_a")}</strong> {t("cr.hero_body_b")} <strong className="text-black">{t("cr.hero_strong_b")}</strong> {t("cr.hero_body_c")} <strong className="text-black">{t("cr.hero_strong_c")}</strong> {t("cr.hero_body_d")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {t("cr.badge_consultation")}</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {t("cr.badge_mockup")}</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {t("cr.badge_made")}</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {t("cr.badge_no_moq")}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-10" data-testid="custom-request-form">
          <Section step="01" title={t("cr.step1")}>
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

          <Section step="02" title={t("cr.step2")}>
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

          <Section step="03" title={t("cr.step3")}>
            <textarea
              data-testid="cr-idea"
              rows={6}
              value={form.idea_description}
              onChange={(e) => setForm({ ...form, idea_description: e.target.value })}
              placeholder={t("cr.step3_ph")}
              className="w-full border border-black/15 px-4 py-3 text-[15px] leading-[1.7] outline-none focus:border-black"
            />
            <div className="mt-4">
              <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("cr.step3_refs")}</label>
              <div className="mt-2 flex flex-wrap gap-3">
                {refImages.map((src, i) => (
                  <div key={i} className="relative h-24 w-24 overflow-hidden border border-black/15">
                    <img src={src} alt={`ref-${i}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setRefImages(refImages.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-white/90 px-1 text-[10px]">✕</button>
                  </div>
                ))}
                {refImages.length < 4 && (
                  <label className="flex h-24 w-24 cursor-pointer items-center justify-center border border-dashed border-black/30 text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:border-black">
                    {t("cr.add")}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFile(e.target.files)} data-testid="cr-upload" />
                  </label>
                )}
              </div>
            </div>
          </Section>

          <Section step="04" title={t("cr.step4")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField label={t("cr.print_placement")} value={form.print_placement} onChange={(v) => setForm({ ...form, print_placement: v })} options={PLACEMENTS} testid="cr-placement" />
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("cr.print_size")}</label>
                <div className="mt-2 flex gap-2">
                  {PRINT_SIZES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      data-testid={`cr-printsize-${s.key.toLowerCase()}`}
                      onClick={() => setForm({ ...form, print_size: s.key })}
                      className={`flex-1 border p-3 text-left transition-colors ${
                        form.print_size === s.key ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
                      }`}
                    >
                      <div className="font-display text-xl uppercase">{s.key} · {s.label}</div>
                      <div className={`mt-0.5 text-[10px] uppercase tracking-[0.18em] ${form.print_size === s.key ? "text-white/70" : "text-neutral-500"}`}>{s.desc}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  {t("cr.tolerance")}
                </p>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("cr.primary_color")}</label>
                <div className="mt-2 flex items-center gap-3">
                  <input type="color" data-testid="cr-color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-11 w-16 cursor-pointer border border-black/15" />
                  <input type="text" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1 border border-black/15 px-3 py-2 font-mono text-sm uppercase" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{t("cr.quantity")}</label>
                <div className="mt-2 inline-flex items-center border border-black/15">
                  <button type="button" onClick={() => setForm({ ...form, quantity: Math.max(1, Number(form.quantity) - 1) })} className="px-3 py-2 hover:bg-black hover:text-white">−</button>
                  <input data-testid="cr-quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-20 border-x border-black/15 px-3 py-2 text-center text-sm font-semibold" />
                  <button type="button" onClick={() => setForm({ ...form, quantity: Number(form.quantity) + 1 })} className="px-3 py-2 hover:bg-black hover:text-white">+</button>
                </div>
              </div>
              <SelectField label={t("cr.budget_range")} value={form.budget_range} onChange={(v) => setForm({ ...form, budget_range: v })} options={BUDGETS} testid="cr-budget" />
            </div>
          </Section>

          <Section step="05" title={t("cr.step5")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label={t("cr.full_name")} value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} required testid="cr-name" />
              <TextField label={t("cr.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required testid="cr-email" />
              <TextField label={t("cr.phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="cr-phone" />
              <SelectField label={t("cr.preferred_channel")} value={form.contact_preference} onChange={(v) => setForm({ ...form, contact_preference: v })}
                options={[{ key: "email", label: "Email" }, { key: "whatsapp", label: "WhatsApp" }]} testid="cr-channel" />
            </div>
          </Section>

          <div className="pt-2">
            <TurnstileField ref={captchaRef} onToken={setCaptchaToken} action="custom-request" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            data-testid="cr-submit"
            className="inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-5 text-[12px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? t("cr.sending") : t("cr.submit")}
          </button>
        </form>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="border border-black/15 p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("cr.live_preview")}</div>
            <div className="mt-3 font-display text-3xl uppercase tracking-[0.04em]">{t("cr.your_brief")}</div>

            <div className="mt-6 aspect-[4/5] w-full overflow-hidden bg-neutral-100">
              <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: form.primary_color }}>
                <div className="px-6 text-center">
                  <div className="font-display text-3xl uppercase tracking-[0.04em] text-white mix-blend-difference">{selectedProduct?.label}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/80 mix-blend-difference">{selectedStyle?.label}</div>
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-[12px] uppercase tracking-[0.2em] text-neutral-600">
              <li><span className="text-neutral-400">{t("cr.canvas")} · </span><span className="text-black">{selectedProduct?.label}</span></li>
              <li><span className="text-neutral-400">{t("cr.style")} · </span><span className="text-black">{selectedStyle?.label}</span></li>
              <li><span className="text-neutral-400">{t("cr.placement")} · </span><span className="text-black">{labelOf(PLACEMENTS, form.print_placement)}</span></li>
              <li><span className="text-neutral-400">{t("cr.print_size_lbl")} · </span><span className="text-black">{form.print_size} (±3 cm)</span></li>
              <li><span className="text-neutral-400">{t("cr.qty_lbl")} · </span><span className="text-black">{form.quantity}</span></li>
              <li><span className="text-neutral-400">{t("cr.budget_lbl")} · </span><span className="text-black">{labelOf(BUDGETS, form.budget_range)}</span></li>
              <li><span className="text-neutral-400">{t("cr.color_lbl")} · </span><span className="font-mono text-black">{form.primary_color}</span></li>
            </ul>

            <div className="mt-6 border-t border-black/10 pt-4 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              {t("cr.no_surprises")}
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("cr.more_questions")}</div>
        <h2 className="font-display mt-2 text-4xl uppercase tracking-[0.04em] sm:text-5xl">{t("cr.read_faq")}</h2>
        <Link to="/faq" className="tx-link mt-4 inline-block text-[12px] uppercase tracking-[0.25em]">{t("cr.all_answered")}</Link>
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
        {options.map((o) => (
          <option key={o.key || o} value={o.key || o}>{o.label || o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  </div>
);
