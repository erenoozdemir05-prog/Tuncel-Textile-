import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

const SettingsContext = createContext(null);

const FALLBACK = {
  whatsapp_number: "+371 20677937",
  whatsapp_default_message: "Hello Tuncel Textile, I'm interested in your collection.",
  social: { instagram: "", facebook: "", twitter: "", linkedin: "", youtube: "", tiktok: "" },
  iban: { bank_name: "", account_holder: "Tuncel Textile", iban: "", bic: "", reference_prefix: "TT", instructions: "" },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSettings();
      setSettings({ ...FALLBACK, ...data, social: { ...FALLBACK.social, ...(data.social || {}) }, iban: { ...FALLBACK.iban, ...(data.iban || {}) } });
    } catch {
      setSettings(FALLBACK);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
};

// Builds a wa.me URL with prefilled message
export const buildWhatsappLink = (settings, customMessage) => {
  const num = (settings?.whatsapp_number || "").replace(/[^0-9]/g, "");
  const msg = customMessage || settings?.whatsapp_default_message || "";
  const params = msg ? `?text=${encodeURIComponent(msg)}` : "";
  return `https://wa.me/${num}${params}`;
};
