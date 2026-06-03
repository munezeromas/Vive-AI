/**
 * TutorPage.tsx — Vive AI tutor with lip-synced avatar
 *
 * Full version with debug logging.
 * Drop this at your route file, e.g. src/routes/student.tutor.tsx
 * (keep whatever createFileRoute wrapper you already have — just replace
 *  the component export)
 */

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { TalkingChatbot } from "@/components/vive/TalkingChatbot";
import { speakAI } from "@/lib/useSpeakAI";

// If you have the AvatarMuteContext wired up, use it:
// import { useAvatarMuted } from "@/components/vive/AccessibilityBar";
// const { avatarMuted } = useAvatarMuted();
// Otherwise default to false:
const avatarMuted = false;

type Message = { role: "user" | "ai"; text: string };

/** Remove markdown symbols so the avatar doesn't speak "asterisk asterisk" */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1")
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/>\s/g, "")
    .replace(/[-*+]\s/g, "")
    .replace(/\n{2,}/g, ". ")
    .trim();
}

export function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [micActive, setMicActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // ── AI fetch ────────────────────────────────────────────────────────────
  const fetchAI = useCallback(async (userText: string, history: Message[]): Promise<string> => {
    console.log("[TutorPage] Fetching AI response for:", userText.substring(0, 50));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: `You are Vive AI, a warm and encouraging tutor for primary and secondary school students in Rwanda. 
Rules:
- Keep answers SHORT — 2 to 4 sentences maximum. The avatar will speak them aloud.
- Use simple, age-appropriate language. No jargon.
- Be enthusiastic and supportive.
- End with one short follow-up question to keep the student engaged.
- Never use bullet points, markdown, asterisks, or headers. Plain sentences only.`,
        messages: [
          ...history
            .slice(-8)
            .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
          { role: "user", content: userText },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[TutorPage] API error:", res.status, err);
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json();
    const aiText = data.content?.find((b: any) => b.type === "text")?.text ?? "";
    console.log("[TutorPage] AI response received, length:", aiText.length);
    return aiText;
  }, []);

  // ── Send ────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    console.log("[TutorPage] Sending:", text);
    setInput("");
    const newHistory: Message[] = [...messages, { role: "user", text }];
    setMessages(newHistory);
    setLoading(true);
    scrollToBottom();

    try {
      const aiRaw = await fetchAI(text, newHistory);
      const aiClean = stripMarkdown(aiRaw);

      setMessages((prev) => [...prev, { role: "ai", text: aiRaw }]);
      scrollToBottom();

      // ✅ This triggers the avatar to lip-sync and speak the answer
      console.log("[TutorPage] Calling speakAI with cleaned text:", aiClean.substring(0, 60));
      speakAI(aiClean);
    } catch (err) {
      console.error("[TutorPage] handleSend error:", err);
      const errMsg = "Oops! Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "ai", text: errMsg }]);
      speakAI(errMsg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, fetchAI]);

  // ── Mic ─────────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (micActive) {
      recognitionRef.current?.stop();
      setMicActive(false);
      return;
    }

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input not supported in this browser. Try Chrome.");
      return;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => console.log("[Mic] Listening...");
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      console.log("[Mic] Heard:", transcript);
      setMicActive(false);
      handleSend(transcript);
    };
    rec.onerror = (e: any) => {
      console.error("[Mic] Error:", e.error);
      setMicActive(false);
    };
    rec.onend = () => setMicActive(false);

    rec.start();
    recognitionRef.current = rec;
    setMicActive(true);
  }, [micActive, handleSend]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] min-h-0">

      {/* ── Avatar panel ─────────────────────────────────────────────────── */}
      <div className="lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col items-center gap-3">
        <TalkingChatbot
          onSubtitle={setSubtitle}
          isMuted={avatarMuted}
          mood={loading ? "thinking" : "neutral"}
        />

        {subtitle && (
          <p
            className="text-xs text-center px-4 italic leading-relaxed max-h-20 overflow-hidden"
            style={{ color: "rgba(255,255,255,0.55)" }}
            aria-live="polite"
          >
            "{subtitle}"
          </p>
        )}

        {micActive && (
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Listening…
          </div>
        )}
      </div>

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <p className="text-2xl">👋</p>
              <p className="font-black text-lg" style={{ color: "#7BB8F0" }}>
                Hi, I'm Vive AI!
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                Ask me anything — type or use the mic. I'll speak my answer back to you!
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  "Explain photosynthesis",
                  "What is algebra?",
                  "How do volcanoes form?",
                  "Help me with fractions",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold transition-colors"
                    style={{
                      border: "1px solid rgba(74,144,217,0.4)",
                      color: "#4A90D9",
                      background: "rgba(74,144,217,0.08)",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "ai" && (
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm mr-2 mt-1 font-black"
                  style={{ background: "linear-gradient(135deg, #4A90D9, #2D6DB5)", color: "white" }}
                >
                  V
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                }`}
                style={
                  m.role === "user"
                    ? { background: "#4A90D9", color: "white" }
                    : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
                style={{ background: "linear-gradient(135deg, #4A90D9, #2D6DB5)", color: "white" }}
              >
                V
              </div>
              <div
                className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#4A90D9] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#4A90D9] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#4A90D9] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div
          className="flex items-center gap-2 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={toggleMic}
            aria-label={micActive ? "Stop listening" : "Start voice input"}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              micActive ? "scale-110" : "hover:scale-105"
            }`}
            style={
              micActive
                ? { background: "#ef4444", color: "white" }
                : { background: "rgba(74,144,217,0.15)", color: "#4A90D9" }
            }
          >
            {micActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={micActive ? "Listening…" : "Transmit inquiry to Core…"}
            disabled={micActive}
            className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || micActive}
            aria-label="Send"
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #4A90D9, #2D6DB5)", color: "white" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}