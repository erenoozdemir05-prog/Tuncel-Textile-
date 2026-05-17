import React from "react";
import { useParams } from "react-router-dom";
import { useCms, cmsText } from "@/contexts/CmsContext";
import { useI18n } from "@/contexts/I18nContext";

const PAGES = {
  privacy: { key: "legal_privacy", titles: { en: "Privacy Policy", ru: "Политика конфиденциальности", lv: "Privātuma politika" } },
  "terms-of-use": { key: "legal_terms_of_use", titles: { en: "Terms of Use", ru: "Условия использования", lv: "Lietošanas noteikumi" } },
  "terms-of-sale": { key: "legal_terms_of_sale", titles: { en: "Terms of Sale", ru: "Условия продажи", lv: "Pārdošanas noteikumi" } },
  imprint: { key: "legal_imprint", titles: { en: "Imprint", ru: "Выходные данные", lv: "Impresums" } },
  accessibility: { key: "legal_accessibility", titles: { en: "Accessibility Statement", ru: "Заявление о доступности", lv: "Pieejamības paziņojums" } },
};

// Tiny markdown-ish renderer (## headings, **bold**, plain paragraphs)
const renderBlocks = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const blocks = [];
  let buffer = [];
  const flush = () => {
    if (buffer.length === 0) return;
    blocks.push(
      <p key={blocks.length} className="text-[15px] leading-[1.8] text-neutral-700">
        {buffer.join(" ").split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-black">{part}</strong> : part))}
      </p>
    );
    buffer = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h2 key={blocks.length} className="font-display mt-10 text-3xl uppercase tracking-[0.04em] sm:text-4xl">
          {line.replace(/^##\s*/, "")}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      flush();
      blocks.push(
        <li key={blocks.length} className="ml-5 list-disc text-[15px] leading-[1.8] text-neutral-700">
          {line.replace(/^-\s*/, "")}
        </li>
      );
    } else {
      buffer.push(line);
    }
  }
  flush();
  return blocks;
};

export default function LegalPage() {
  const { slug } = useParams();
  const meta = PAGES[slug];
  const { items } = useCms();
  const { locale } = useI18n();

  if (!meta) {
    return <div className="mx-auto max-w-2xl px-5 py-32 text-center font-display text-5xl uppercase">Not found</div>;
  }

  const body = cmsText(items, meta.key, locale, "");
  const title = meta.titles[locale] || meta.titles.en;

  return (
    <div data-testid={`legal-page-${slug}`} className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Legal</div>
      <h1 className="font-display mt-3 text-5xl uppercase leading-none tracking-[0.02em] sm:text-7xl">{title}</h1>
      <div className="mt-10 space-y-4">{renderBlocks(body)}</div>
      <p className="mt-16 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Last updated · {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}
