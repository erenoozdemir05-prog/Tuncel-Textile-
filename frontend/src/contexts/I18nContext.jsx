import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LOCALES, TRANSLATIONS } from "@/i18n/translations";

const I18nContext = createContext(null);
const STORAGE_KEY = "tuncel_locale";

const getNested = (obj, path) => {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
};

export const I18nProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && TRANSLATIONS[stored]) return stored;
    const browser = (navigator.language || "en").slice(0, 2);
    return TRANSLATIONS[browser] ? browser : "en";
  });

  const setLocale = useCallback((code) => {
    if (!TRANSLATIONS[code]) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLocaleState(code);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (path, fallback = "") => {
      const val = getNested(TRANSLATIONS[locale], path);
      if (val !== undefined) return val;
      const en = getNested(TRANSLATIONS.en, path);
      return en !== undefined ? en : fallback || path;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, locales: LOCALES }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
};
