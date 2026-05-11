import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

export const LanguageSwitcher = ({ variant = "light" }) => {
  const { locale, setLocale, locales } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const dark = variant === "dark";
  const btnBase = dark ? "text-white hover:bg-white hover:text-black" : "text-black hover:bg-black hover:text-white";
  const menuBase = dark ? "bg-black text-white border-white/15" : "bg-white text-black border-black/10";

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="lang-switch-trigger"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-10 items-center gap-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${btnBase}`}
      >
        <Globe className="h-3.5 w-3.5" />
        {locale.toUpperCase()}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute right-0 top-full z-50 mt-1 min-w-[140px] border ${menuBase}`}>
          {locales.map((l) => (
            <button
              key={l.code}
              data-testid={`lang-option-${l.code}`}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={`block w-full px-4 py-3 text-left text-[11px] uppercase tracking-[0.2em] ${
                locale === l.code ? (dark ? "bg-white text-black" : "bg-black text-white") : (dark ? "hover:bg-white/10" : "hover:bg-black/5")
              }`}
            >
              {l.label} · {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
