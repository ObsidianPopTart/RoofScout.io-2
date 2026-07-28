"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

type SupportChatText = {
  launcherLabel: string;
  title: string;
  disclaimer: string;
  greeting: string;
  placeholder: string;
  send: string;
  thinking: string;
  limitReached: string;
  errorFallback: string;
  close: string;
};

const MAX_MESSAGES = 16;
const STORAGE_KEY = "rs-support-chat";

export default function SupportChat({ t }: { t: SupportChatText }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // ignore corrupt/blocked storage
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore storage quota/blocked errors
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading, open]);

  const atLimit = messages.length >= MAX_MESSAGES;

  async function send() {
    const content = input.trim();
    if (!content || loading || atLimit) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? t.errorFallback }]);
    } catch {
      setError(true);
      setMessages([...next, { role: "assistant", content: t.errorFallback }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open && (
        <div className="flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--rs-ink)] text-[var(--rs-paper)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="font-bold">{t.title}</div>
              <div className="mt-0.5 text-xs text-[var(--rs-paper)]/50">{t.disclaimer}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="shrink-0 rounded-full p-1.5 text-[var(--rs-paper)]/60 hover:bg-white/10 hover:text-[var(--rs-paper)]"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--rs-ink-2)] px-3 py-2 text-sm">
              {t.greeting}
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto rounded-br-sm bg-[var(--rs-amber)] text-[#1a1206]"
                    : "rounded-bl-sm bg-[var(--rs-ink-2)] text-[var(--rs-paper)]"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--rs-ink-2)] px-3 py-2 text-sm text-[var(--rs-paper)]/50">
                {t.thinking}
              </div>
            )}
            {atLimit && (
              <div className="rounded-lg border border-[var(--rs-amber)]/30 bg-[var(--rs-amber)]/10 px-3 py-2 text-xs text-[var(--rs-amber)]">
                {t.limitReached}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              disabled={loading || atLimit}
              maxLength={1000}
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-sm focus:border-[var(--rs-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-amber)]/25 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || atLimit || !input.trim()}
              className="shrink-0 rounded-full bg-[var(--rs-amber)] px-4 py-2 text-sm font-bold text-[#1a1206] disabled:opacity-40"
            >
              {t.send}
            </button>
          </form>
          {error && <div className="sr-only" aria-live="polite">{t.errorFallback}</div>}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.launcherLabel}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--rs-amber)] text-2xl text-[#1a1206] shadow-lg transition-transform hover:-translate-y-0.5"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
