import React, { useEffect, useState } from "react";
import { fetchFaqs } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const CATS = [
  { key: "all", en: "All", ru: "Все", lv: "Visi" },
  { key: "shipping", en: "Shipping", ru: "Доставка", lv: "Piegāde" },
  { key: "returns", en: "Returns", ru: "Возврат", lv: "Atgriešana" },
  { key: "payment", en: "Payment", ru: "Оплата", lv: "Maksājumi" },
  { key: "custom", en: "Custom orders", ru: "Кастом", lv: "Pielāgots" },
  { key: "general", en: "General", ru: "Общее", lv: "Vispārējs" },
];

export default function FAQ() {
  const { locale } = useI18n();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("all");

  useEffect(() => { fetchFaqs().then(setItems).catch(() => {}); }, []);

  const visible = cat === "all" ? items : items.filter((i) => i.category === cat);
  const pick = (obj) => obj?.[locale] || obj?.en || "";

  return (
    <div data-testid="faq-page" className="mx-auto max-w-[1100px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Help · Atelier</div>
        <h1 className="font-display mt-3 text-6xl uppercase leading-none tracking-[0.02em] sm:text-8xl">
          Questions
          <br />
          <span className="text-neutral-400">answered.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          Everything we get asked most often — about shipping, returns, custom work and payment. Still need a human? Message us on WhatsApp or write to tunceltextile@gmail.com.
        </p>
      </section>

      <section className="py-10">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.key}
              data-testid={`faq-cat-${c.key}`}
              onClick={() => setCat(c.key)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                cat === c.key ? "bg-black text-white" : "border border-black/15 text-neutral-700 hover:border-black hover:text-black"
              }`}
            >
              {c[locale] || c.en}
            </button>
          ))}
        </div>

        <Accordion type="single" collapsible className="mt-8">
          {visible.map((f, idx) => (
            <AccordionItem key={f.id || idx} value={`item-${idx}`} className="border-b border-black/10">
              <AccordionTrigger data-testid={`faq-item-${idx}`} className="py-6 text-left font-display text-xl uppercase tracking-[0.04em] hover:no-underline sm:text-2xl">
                {pick(f.question)}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-[15px] leading-[1.8] text-neutral-700">
                {pick(f.answer)}
              </AccordionContent>
            </AccordionItem>
          ))}
          {visible.length === 0 && (
            <div className="py-16 text-center font-display text-2xl uppercase tracking-[0.05em] text-neutral-400">
              No answers in this section yet.
            </div>
          )}
        </Accordion>
      </section>

      <section className="border-t border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Still curious?</div>
        <h2 className="font-display mt-2 text-4xl uppercase tracking-[0.04em] sm:text-6xl">Talk to a maker.</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/custom-request" className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white">Start a Custom Request →</Link>
          <a href="mailto:tunceltextile@gmail.com" className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">Email Us</a>
        </div>
      </section>
    </div>
  );
}
