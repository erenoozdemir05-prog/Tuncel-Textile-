import React from "react";

export default function CookiePolicy() {
  return (
    <div data-testid="cookie-policy-page" className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Legal · Cookies</div>
      <h1 className="font-display mt-3 text-5xl uppercase leading-none tracking-[0.02em] sm:text-7xl">
        Cookie Policy
      </h1>
      <div className="mt-10 space-y-6 text-[15px] leading-[1.8] text-neutral-700">
        <p>
          This page explains what cookies we use on tunceltextile.com and how to control them. We
          aim to be brief because, frankly, you have better things to read.
        </p>
        <h2 className="font-display mt-10 text-2xl uppercase tracking-[0.04em] text-black">
          Essential cookies
        </h2>
        <p>
          We use a small number of strictly necessary cookies so the site works. These store your
          shopping bag, your authentication session (if you sign in), your preferred language and
          your cookie-consent choice. Without these the site cannot function.
        </p>
        <h2 className="font-display mt-8 text-2xl uppercase tracking-[0.04em] text-black">
          Analytics
        </h2>
        <p>
          With your consent, we use minimal anonymous analytics to understand which pages are
          visited and how long pages take to load. We do not sell, share or rent any personal data.
        </p>
        <h2 className="font-display mt-8 text-2xl uppercase tracking-[0.04em] text-black">
          Third-party services
        </h2>
        <p>
          Payments are processed by Stripe (or via direct bank transfer). When you reach the
          checkout, Stripe may set its own cookies under their privacy policy. We never see or store
          your card details.
        </p>
        <h2 className="font-display mt-8 text-2xl uppercase tracking-[0.04em] text-black">
          Your choices
        </h2>
        <p>
          When you first visit, we ask whether you accept analytics cookies or only essential
          cookies. You can change your choice anytime by clearing site data in your browser. The
          essential cookies cannot be disabled — without them the cart and login break.
        </p>
        <h2 className="font-display mt-8 text-2xl uppercase tracking-[0.04em] text-black">
          Contact
        </h2>
        <p>
          Questions? Email{" "}
          <a className="tx-link" href="mailto:hello@tunceltextile.com">
            hello@tunceltextile.com
          </a>{" "}
          or message us on WhatsApp.
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Last updated · {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}
