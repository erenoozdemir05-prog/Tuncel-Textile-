import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { Cookie, Settings, X, Check } from "lucide-react";

const KEY = "tuncel_cookie_consent_v2";

const DEFAULT_PREFS = {
  essential: true,   // always on (locked)
  analytics: false,
  marketing: false,
  preferences: true, // language, locale, cart — practical default
};

export const getCookieConsent = () => {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { return null; }
};

export const setCookieConsent = (prefs) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ ...prefs, essential: true, ts: Date.now() }));
};

const CATEGORIES = [
  { key: "essential", title: "Essential",   body: "Cart, checkout, secure login, IBAN reference cookies. Cannot be turned off — the site won't work without them." },
  { key: "preferences", title: "Preferences", body: "Remember your language (EN/RU/LV), region and recently viewed pieces so you don't have to re-set them." },
  { key: "analytics", title: "Analytics",    body: "Anonymous traffic, page-view and conversion measurement (e.g. Plausible / GA). Helps us see what to make next. No tracking across other sites." },
  { key: "marketing", title: "Marketing",    body: "Personalised drops and re-targeting on Instagram, Meta and TikTok. Turn off if you'd rather not see Tuncel ads anywhere else." },
];

export const CookieBanner = () => {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const acceptAll = () => {
    const next = { essential: true, analytics: true, marketing: true, preferences: true };
    setCookieConsent(next);
    setPrefs(next);
    setShow(false); setCustomize(false);
  };
  const rejectAll = () => {
    const next = { essential: true, analytics: false, marketing: false, preferences: false };
    setCookieConsent(next);
    setPrefs(next);
    setShow(false); setCustomize(false);
  };
  const savePrefs = () => {
    setPrefs((current) => {
      setCookieConsent(current);
      return current;
    });
    setShow(false);
    setCustomize(false);
  };

  if (!show && !customize) return null;

  if (customize) {
    return (
      <div className="fixed inset-0 z-[100] flex items-stretch justify-end bg-black/60 backdrop-blur-sm" data-testid="cookie-modal">
        <div className="flex w-full max-w-md flex-col bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <div className="font-display text-xl uppercase tracking-[0.04em]">Cookie preferences</div>
            </div>
            <button data-testid="cookie-modal-close" onClick={() => setCustomize(false)} className="p-1 hover:bg-black/5">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-sm leading-relaxed text-neutral-700">
              Choose what we can use to make Tuncel Textile better. You can change these any time from the cookie policy page.
            </p>
            <div className="mt-6 space-y-4">
              {CATEGORIES.map((c) => {
                const checked = c.key === "essential" ? true : !!prefs[c.key];
                const locked = c.key === "essential";
                return (
                  <div key={c.key} className={`flex items-start justify-between gap-4 border p-4 ${checked ? "border-black bg-neutral-50" : "border-black/15"} ${locked ? "opacity-90" : ""}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-display text-base uppercase tracking-[0.04em]">{c.title}</div>
                        {locked && <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">Always on</span>}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-600">{c.body}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      data-testid={`cookie-toggle-${c.key}`}
                      disabled={locked}
                      onClick={(e) => { e.stopPropagation(); if (!locked) setPrefs((p) => ({ ...p, [c.key]: !checked })); }}
                      className={`relative mt-1 h-6 w-11 flex-shrink-0 transition-colors ${checked ? "bg-black" : "bg-neutral-300"} ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-black/10 p-4 sm:flex-row">
            <button data-testid="cookie-reject-all" onClick={rejectAll} className="flex-1 border border-black/15 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-black hover:text-white">
              Reject all
            </button>
            <button data-testid="cookie-save" onClick={savePrefs} className="flex-1 bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800">
              Save preferences
            </button>
            <button data-testid="cookie-accept-all" onClick={acceptAll} className="flex-1 border border-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-black hover:text-white">
              Accept all
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="cookie-banner"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl border border-black/10 bg-white p-5 shadow-2xl ring-1 ring-black/5 sm:inset-x-4 sm:bottom-4 sm:p-6"
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Cookie className="h-4 w-4" />
            <div className="font-display text-xl uppercase tracking-[0.04em]">{t("cookies.title")}</div>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            {t("cookies.body")}{" "}
            <Link to="/cookie-policy" className="tx-link font-semibold text-black">
              {t("cookies.link")}
            </Link>
            .
          </p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-row">
          <button
            data-testid="cookie-customize"
            onClick={() => setCustomize(true)}
            className="whitespace-nowrap border border-black/15 px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white sm:px-4"
          >
            Customize
          </button>
          <button
            data-testid="cookie-decline"
            onClick={rejectAll}
            className="whitespace-nowrap border border-black/15 px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white sm:px-4"
          >
            {t("cookies.decline")}
          </button>
          <button
            data-testid="cookie-accept"
            onClick={acceptAll}
            className="whitespace-nowrap bg-black px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 sm:px-5"
          >
            {t("cookies.accept")}
          </button>
        </div>
      </div>
    </div>
  );
};
