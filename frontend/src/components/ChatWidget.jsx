import React, { useEffect, useRef, useState } from "react";
import { chatStart, chatSend, chatFetch } from "@/lib/api";
import { MessageCircle, Send, X } from "lucide-react";

const STORAGE_KEY = "tuncel_chat_session";
const POLL_MS = 3000;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [starting, setStarting] = useState(false);
  const [unread, setUnread] = useState(0);
  const lastSeenRef = useRef(null);
  const scrollRef = useRef(null);

  // Poll messages while session exists
  useEffect(() => {
    if (!sessionId) return undefined;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await chatFetch(sessionId, lastSeenRef.current || undefined);
        if (cancelled) return;
        if (res.messages?.length) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev, ...res.messages.filter((m) => !seen.has(m.id))];
            return merged;
          });
          lastSeenRef.current = res.messages[res.messages.length - 1].created_at;
          // Increment unread if widget closed and admin reply arrived
          const newAdminMsgs = res.messages.filter((m) => m.sender === "admin").length;
          if (!open && newAdminMsgs > 0) setUnread((u) => u + newAdminMsgs);
        }
      } catch (e) {
        // session may have been deleted server-side
        if (e?.response?.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
          setSessionId("");
          setMessages([]);
        }
      }
    };
    // initial full fetch
    (async () => {
      try {
        const res = await chatFetch(sessionId);
        if (cancelled) return;
        setMessages(res.messages || []);
        if (res.messages?.length) lastSeenRef.current = res.messages[res.messages.length - 1].created_at;
      } catch (e) {
        if (e?.response?.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
          setSessionId("");
        }
      }
    })();
    const t = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [sessionId, open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open, messages.length]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const start = async (e) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    setStarting(true);
    try {
      const res = await chatStart({
        customer_name: name.trim() || undefined,
        customer_email: email.trim() || undefined,
        initial_message: draft.trim(),
      });
      localStorage.setItem(STORAGE_KEY, res.session_id);
      setSessionId(res.session_id);
      setDraft("");
    } finally {
      setStarting(false);
    }
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!draft.trim() || !sessionId) return;
    const body = draft.trim();
    setDraft("");
    // optimistic
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      sender: "customer",
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      await chatSend(sessionId, body);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 sm:bottom-8 sm:right-8" data-testid="chat-widget">
      {open && (
        <div className="flex h-[520px] w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-black bg-white shadow-2xl sm:w-[380px]" data-testid="chat-panel">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-black bg-black px-4 py-3 text-white">
            <div>
              <div className="font-display text-base uppercase tracking-[0.18em]">Atelier chat</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/60">Usually replies in 1h</div>
            </div>
            <button data-testid="chat-close" onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* BODY */}
          {!sessionId ? (
            <form onSubmit={start} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              <p className="text-sm text-neutral-700">Hi — leave your name and a quick message. We reply by chat or email.</p>
              <input
                data-testid="chat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <input
                data-testid="chat-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (so we can follow up)"
                className="border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <textarea
                data-testid="chat-initial"
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="How can we help?"
                className="border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={starting || !draft.trim()}
                data-testid="chat-start"
                className="mt-auto bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-50"
              >
                {starting ? "Sending…" : "Start chat"}
              </button>
            </form>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" data-testid="chat-messages">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-neutral-400">No messages yet.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-3 max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
                        m.sender === "admin"
                          ? "ml-0 bg-neutral-100 text-black"
                          : "ml-auto bg-black text-white"
                      }`}
                    >
                      {m.body}
                      <div className={`mt-1 text-[9px] uppercase tracking-[0.2em] ${m.sender === "admin" ? "text-neutral-500" : "text-white/60"}`}>
                        {m.sender === "admin" ? "Atelier" : "You"} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={send} className="flex items-center gap-2 border-t border-black/10 p-3">
                <input
                  data-testid="chat-draft"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  data-testid="chat-send"
                  className="bg-black p-2 text-white disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        data-testid="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
        {unread > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
