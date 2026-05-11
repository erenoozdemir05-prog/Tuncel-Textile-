import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeSession } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    // Use ref synchronously to avoid StrictMode double-run
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const sessionId = params.get("session_id");

    if (!sessionId) {
      navigate("/", { replace: true });
      return;
    }

    (async () => {
      try {
        const me = await exchangeSession(sessionId);
        setUser(me);
        // Clean the URL hash
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/account", { replace: true, state: { user: me } });
      } catch (e) {
        console.error("Auth exchange failed", e);
        navigate("/", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-[12px] uppercase tracking-[0.25em] text-neutral-500">Signing you in…</p>
    </div>
  );
}
