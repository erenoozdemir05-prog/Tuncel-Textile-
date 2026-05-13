import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const CmsContext = createContext(null);

export const CmsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const [cms, hero] = await Promise.all([
        api.get("/cms").then((r) => r.data),
        api.get("/hero").then((r) => r.data),
      ]);
      setItems(cms?.items || []);
      setHeroSlides(hero || []);
    } catch {
      setItems([]);
      setHeroSlides([]);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(() => ({
    items, heroSlides, refresh,
  }), [items, heroSlides, refresh]);

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
};

export const useCms = () => {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be inside CmsProvider");
  return ctx;
};

// Helper: pick CMS text by key with locale fallback
export const cmsText = (items, key, locale, fallback = "") => {
  const it = items.find((i) => i.key === key);
  if (!it) return fallback;
  return it.values?.[locale] || it.values?.en || fallback;
};
