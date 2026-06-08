import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Turnstile, { useTurnstile } from "react-turnstile";

/**
 * TurnstileField — drop-in Cloudflare Turnstile widget.
 *
 * Usage:
 *   const ref = useRef();
 *   <TurnstileField ref={ref} onToken={setToken} action="newsletter" />
 *   // on backend error: ref.current?.reset()
 *
 * Falls back to a noop placeholder if REACT_APP_TURNSTILE_SITE_KEY is not set.
 */
const TurnstileField = forwardRef(({ onToken, action, theme = "light" }, ref) => {
  const sitekey = process.env.REACT_APP_TURNSTILE_SITE_KEY;
  const widgetRef = useRef(null);
  const [key, setKey] = useState(0);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onToken?.(null);
      setKey((k) => k + 1); // force re-mount
    },
  }), [onToken]);

  if (!sitekey) {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-red-700">
        Turnstile not configured · REACT_APP_TURNSTILE_SITE_KEY missing
      </div>
    );
  }

  return (
    <div data-testid="turnstile-field" key={key} ref={widgetRef}>
      <Turnstile
        sitekey={sitekey}
        action={action}
        theme={theme}
        appearance="always"
        onVerify={(token) => onToken?.(token)}
        onExpire={() => onToken?.(null)}
        onError={() => onToken?.(null)}
      />
    </div>
  );
});

TurnstileField.displayName = "TurnstileField";
export default TurnstileField;
