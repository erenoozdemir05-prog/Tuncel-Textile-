import React, { useEffect, useState } from "react";
import { fetchFaqs } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

export default function FAQ() {
  const { locale, t } = useI18n();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("all");

  useEffect(() => { fetchFaqs().then(setItems).catch(() => {}); }, []);

  const CATS = [
    { key: "all",      label: t("faq_page.cat_all") },
    { key: "shipping", label: t("faq_page.cat_shipping") },
    { key: "returns",  label: t("faq_page.cat_returns") },
    { key: "payment",  label: t("faq_page.cat_payment") },
    { key: "custom",   label: t("faq_page.cat_custom") },
    { key: "general",  label: t("faq_page.cat_general") },
  ];

  const visible = cat === "all" ? items : items.filter((i) => i.category === cat);
  const pick = (obj) => obj?.[locale] || obj?.en || "";

  return (
    <div data-testid="faq-page" className="mx-auto max-w-[1100px] px-5 sm:px-8">
      <section className="border-b border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("faq_page.hero_kicker")}</div>
        <h1 className="font-display mt-3 text-6xl uppercase leading-none tracking-[0.02em] sm:text-8xl">
          {t("faq_page.title_a")}
          <br />
          <span className="text-neutral-400">{t("faq_page.title_b")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-700">
          {t("faq_page.hero_body")}
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
              {c.label}
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
              {t("faq_page.empty")}
            </div>
          )}
        </Accordion>
      </section>

      <section className="border-t border-black/10 py-16">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">{t("faq_page.still_curious")}</div>
        <h2 className="font-display mt-2 text-4xl uppercase tracking-[0.04em] sm:text-6xl">{t("faq_page.talk_maker")}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/custom-request" className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white">{t("faq_page.start_custom")}</Link>
          <a href="mailto:tunceltextile@gmail.com" className="inline-flex items-center gap-2 border border-black px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">{t("faq_page.email_us")}</a>
        </div>
      </section>
    </div>
  );
}
