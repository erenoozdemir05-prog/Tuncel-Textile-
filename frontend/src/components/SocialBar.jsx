import React from "react";
import { useSettings, buildWhatsappLink } from "@/contexts/SettingsContext";

const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <path d="M14 8.5h2.5V5.5H14a3 3 0 0 0-3 3V11H8.5v3H11v6h3v-6h2.5l.5-3H14V9c0-.3.2-.5.5-.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M17.5 3h3l-7 8.1L22 21h-6.4l-5-6.5L4.8 21H1.7l7.5-8.6L1.5 3h6.6l4.5 6 5-6Zm-1 16h1.6L7.6 4.7H5.9L16.5 19Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h4v12H3V9Zm6 0h4v2c.7-1.3 2.2-2.2 4-2.2 3 0 4 1.9 4 4.7V21h-4v-6.3c0-1.6-.6-2.5-2-2.5s-2 .9-2 2.6V21H9V9Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M23 7.4a3 3 0 0 0-2.1-2.2C19 4.8 12 4.8 12 4.8s-7 0-8.9.4A3 3 0 0 0 1 7.4 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.6a3 3 0 0 0 2.1 2.2C5 19.2 12 19.2 12 19.2s7 0 8.9-.4a3 3 0 0 0 2.1-2.2 31 31 0 0 0 .5-4.6 31 31 0 0 0-.5-4.6ZM10 15V9l5 3-5 3Z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M16 3a5.5 5.5 0 0 0 5.5 5.5V12a8.5 8.5 0 0 1-5-1.6V16a6 6 0 1 1-6-6c.4 0 .7 0 1 .1V13a3 3 0 1 0 2 2.8V3h2.5Z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5">
      <path d="M19.11 17.29c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.58-.49-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.08 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35Zm-5.07 6.95h-.01a9.94 9.94 0 0 1-5.06-1.39l-.36-.21-3.76.99 1-3.67-.24-.38a9.93 9.93 0 0 1-1.52-5.3c0-5.49 4.47-9.96 9.97-9.96 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.92 7.04c0 5.49-4.47 9.96-9.98 9.96Zm8.49-18.45A11.86 11.86 0 0 0 14.04 2C7.46 2 2.11 7.35 2.1 13.92c0 2.1.55 4.15 1.59 5.96L2 26l6.27-1.65a11.91 11.91 0 0 0 5.76 1.47h.01c6.58 0 11.93-5.35 11.94-11.92a11.85 11.85 0 0 0-3.49-8.46Z" />
    </svg>
  ),
};

const LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

export const SocialBar = ({ variant = "dark" }) => {
  const { settings } = useSettings();
  const social = settings?.social || {};
  const items = Object.entries(LABELS)
    .map(([key, label]) => {
      if (key === "whatsapp") {
        const num = (settings?.whatsapp_number || "").replace(/[^0-9]/g, "");
        if (!num) return null;
        return { key, label, href: buildWhatsappLink(settings) };
      }
      const url = social[key];
      if (!url) return null;
      return { key, label, href: url.startsWith("http") ? url : `https://${url}` };
    })
    .filter(Boolean);

  if (items.length === 0) return null;

  const dark = variant === "dark";
  const cls = dark
    ? "border-white/25 text-white/90 hover:border-white hover:bg-white hover:text-black"
    : "border-black/15 text-black hover:border-black hover:bg-black hover:text-white";

  return (
    <div data-testid="social-bar" className="flex flex-wrap items-center gap-2.5">
      {items.map((it) => (
        <a
          key={it.key}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          data-testid={`social-${it.key}`}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 ${cls}`}
        >
          {ICONS[it.key]}
        </a>
      ))}
    </div>
  );
};
