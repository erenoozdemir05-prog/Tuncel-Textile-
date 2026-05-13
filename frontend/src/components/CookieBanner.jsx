import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

const KEY = "tuncel_cookie_consent_v1";

export const CookieBanner = () => {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const handle = (val) => {
    localStorage.setItem(KEY, val);
    setShow(false);
  };

  if (!show) return null;
  return (
    <div
      data-testid="cookie-banner"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl border border-black/10 bg-white p-5 shadow-2xl ring-1 ring-black/5 sm:inset-x-4 sm:bottom-4 sm:p-6"
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="font-display text-xl uppercase tracking-[0.04em]">{t("cookies.title")}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            {t("cookies.body")}{" "}
            <Link to="/cookie-policy" className="tx-link font-semibold text-black">
              {t("cookies.link")}
            </Link>
            .
          </p>
        </div>
        <div className="flex w-full flex-row gap-2 sm:w-auto">
          <button
            data-testid="cookie-decline"
            onClick={() => handle("essential")}
            className="flex-1 whitespace-nowrap border border-black/15 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white sm:flex-none"
          >
            {t("cookies.decline")}
          </button>
          <button
            data-testid="cookie-accept"
            onClick={() => handle("all")}
            className="flex-1 whitespace-nowrap bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 sm:flex-none"
          >
            {t("cookies.accept")}
          </button>
        </div>
      </div>
    </div>
  );
};
