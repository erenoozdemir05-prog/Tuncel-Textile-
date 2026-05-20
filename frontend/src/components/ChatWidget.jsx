import React, { useEffect, useRef, useState } from "react";
import { chatStart, chatSend, chatFetch } from "@/lib/api";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const LINK_MAP = {
  track:  { to: "/track-order",   label: "Track your order →" },
  return: { to: "/return-request", label: "Start a return →" },
  custom: { to: "/custom-request", label: "Open custom request →" },
  gift:   { to: "/gift-cards",     label: "Browse gift cards →" },
  faq:    { to: "/faq",            label: "Read the FAQ →" },
};

// Auto-detect intent words in any language and surface the matching CTA below an AI bubble.
const KEYWORD_INTENTS = [
  { key: "track",  rx: /track|tracking|takip|siparişimi|статус|где мой|izsekot|trase/i },
  { key: "return", rx: /return|refund|exchange|iade|değiş|возврат|обмен|atgr/i },
  { key: "custom", rx: /custom|bespoke|özel sipariş|özel baskı|кастом|пасуй/i },
  { key: "gift",   rx: /gift card|hediye kart|подароч|dāvanu/i },
  { key: "faq",    rx: /\bfaq\b|sss|често задав|biežāk/i },
];

function parseSmartLinks(body) {
  if (!body) return { text: "", links: [] };
  const links = new Set();
  // 1. Explicit AI-emitted tokens
  const text = body.replace(/\[link:(track|return|custom|gift|faq)\]/gi, (_m, k) => {
    links.add(k.toLowerCase());
    return "";
  }).trim();
  // 2. Keyword fallback — if no explicit tokens, infer from text content
  if (links.size === 0) {
    for (const { key, rx } of KEYWORD_INTENTS) {
      if (rx.test(text)) {
        links.add(key);
        break; // surface ONE primary CTA, not five
      }
    }
  }
  return { text, links: Array.from(links) };
}

const STORAGE_KEY = "tuncel_chat_session";
const POLL_MS = 3000;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [sessionStatus, setSessionStatus] = useState("open");
  const [aiTyping, setAiTyping] = useState(false);
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
        if (res.session?.status) setSessionStatus(res.session.status);
        setAiTyping(!!res.session?.ai_typing);
        if (res.messages?.length) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev, ...res.messages.filter((m) => !seen.has(m.id))];
            return merged;
          });
          lastSeenRef.current = res.messages[res.messages.length - 1].created_at;
          const newSidedMsgs = res.messages.filter((m) => m.sender === "admin" || m.sender === "ai" || m.sender === "system").length;
          if (!open && newSidedMsgs > 0) setUnread((u) => u + newSidedMsgs);
        }
      } catch (e) {
        if (e?.response?.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
          setSessionId("");
          setMessages([]);
          setSessionStatus("open");
        }
      }
    };
    // initial full fetch
    (async () => {
      try {
        const res = await chatFetch(sessionId);
        if (cancelled) return;
        setMessages(res.messages || []);
        if (res.session?.status) setSessionStatus(res.session.status);
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
    if (!draft.trim() || !sessionId || sessionStatus === "closed") return;
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

  const startNewChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionId("");
    setSessionStatus("open");
    setMessages([]);
    setDraft("");
    lastSeenRef.current = null;
    setName("");
    setEmail("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 sm:bottom-8 sm:right-8" data-testid="chat-widget">
      {open && (
        <div className="flex h-[520px] w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-black bg-white shadow-2xl sm:w-[380px]" data-testid="chat-panel">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-black bg-black px-4 py-3 text-white">
            <div>
              <div className="font-display text-base uppercase tracking-[0.18em]">Atelier chat</div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/70">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                AI Supported · usually replies in seconds
              </div>
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
                  messages.map((m) => {
                    const isAi = m.sender === "ai";
                    const isAdmin = m.sender === "admin";
                    const isSystem = m.sender === "system";
                    if (isSystem) {
                      return (
                        <div key={m.id} className="my-3 text-center" data-testid={`chat-sys-${m.id}`}>
                          <span className="inline-block border border-black/10 bg-neutral-50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{m.body}</span>
                        </div>
                      );
                    }
                    const fromAtelierSide = isAi || isAdmin;
                    const senderLabel = isAi ? "Atelier AI" : isAdmin ? (m.sender_name || "Atelier") : "You";
                    const { text, links } = isAi ? parseSmartLinks(m.body) : { text: m.body, links: [] };
                    return (
                      <div key={m.id} className={`mb-3 flex w-full flex-col ${fromAtelierSide ? "items-start" : "items-end"}`}>
                        <div className={`text-[9px] uppercase tracking-[0.2em] ${isAi ? "text-purple-700" : isAdmin ? "text-neutral-500" : "text-neutral-400"}`}>
                          {senderLabel}
                        </div>
                        <div
                          className={`mt-1 max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                            isAi ? "border border-purple-200 bg-purple-50 text-black"
                            : isAdmin ? "bg-neutral-100 text-black"
                            : "bg-black text-white"
                          }`}
                        >
                          {isAi && (
                            <div className="mb-1 flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-purple-700">
                              <Sparkles className="h-2.5 w-2.5" /> Auto-reply
                            </div>
                          )}
                          {text}
                          <div className={`mt-1 text-[9px] uppercase tracking-[0.2em] ${isAi ? "text-purple-600" : fromAtelierSide ? "text-neutral-500" : "text-white/60"}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        {links.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {links.map((k) => (
                              <Link
                                key={k}
                                to={LINK_MAP[k].to}
                                onClick={() => setOpen(false)}
                                data-testid={`chat-smartlink-${k}`}
                                className="inline-flex items-center gap-1 border border-black bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white"
                              >
                                {LINK_MAP[k].label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {aiTyping && (
                  <div className="mb-3 flex flex-col items-start" data-testid="chat-ai-typing">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-purple-700">Atelier AI</div>
                    <div className="mt-1 inline-flex items-center gap-1.5 border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-600" style={{ animationDelay: "300ms" }} />
                      <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-purple-700">typing…</span>
                    </div>
                  </div>
                )}
              </div>
              {sessionStatus === "closed" ? (
                <div className="border-t border-black/10 p-4 text-center" data-testid="chat-closed-banner">
                  <p className="text-[12px] text-neutral-600">Support chat has been closed.</p>
                  <button
                    onClick={startNewChat}
                    data-testid="chat-start-new"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
                  >
                    Start New Chat
                  </button>
                </div>
              ) : (
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
              )}
            </>
          )}
        </div>
      )}

      {/* FAB with always-visible AI Chat label */}
      <button
        type="button"
        data-testid="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI-supported live chat"
        className="relative inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 pl-3 text-white shadow-xl transition-transform hover:scale-105 sm:px-5 sm:py-3.5"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <MessageCircle className="h-5 w-5" />
          <Sparkles className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 text-emerald-300" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">AI Chat</span>
          <span className="text-[8.5px] uppercase tracking-[0.2em] text-white/60">Live · with humans</span>
        </span>
        {unread > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
