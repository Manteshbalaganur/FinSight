"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { presetQA, FALLBACK_RESPONSE } from "@/lib/mockData";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function getResponse(text: string): string {
    const lowered = text.toLowerCase();
    for (const qa of presetQA) {
      if (
        text.toLowerCase().trim() === qa.question.toLowerCase() ||
        qa.keywords.some((kw) => lowered.includes(kw))
      ) {
        return qa.answer;
      }
    }
    return FALLBACK_RESPONSE;
  }

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setTyping(false);
    }, 800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Financial Research Assistant</h1>
        <p className="mt-1 text-sm text-text-muted">Ask about your portfolio, holdings, sectors, risks, and news</p>
      </div>

      <div className="flex gap-6">
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-bg-card" style={{ height: "calc(100vh - 220px)" }}>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 text-4xl">🤖</div>
                <p className="text-text-muted">Ask a question or pick a suggested prompt from the right panel.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-bg-hover text-text-primary rounded-bl-sm border border-border"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-border bg-bg-hover px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="typing-dot h-2 w-2 rounded-full bg-text-muted" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-text-muted" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-text-muted" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your portfolio..."
                className="flex-1 rounded-lg border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors duration-200"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary/80 disabled:opacity-50"
                disabled={!input.trim() || typing}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-xl border border-border bg-bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Suggested Questions</h3>
            <div className="space-y-2">
              {presetQA.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(qa.question)}
                  disabled={typing}
                  className="w-full rounded-lg border border-border bg-bg-base p-3 text-left text-xs text-text-muted transition-colors duration-200 hover:border-primary/40 hover:text-text-primary disabled:opacity-50"
                >
                  {qa.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
