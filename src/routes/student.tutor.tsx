import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { TalkingChatbot, stopAllAISpeech } from "@/components/vive/TalkingChatbot";
import {
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX, XCircle,
  Lightbulb, HelpCircle, FastForward, BookOpen, Bot,
  Layers, Globe, Trash2
} from "lucide-react";
import { memo as reactMemo } from "react";
import { toast } from "sonner";

const MemoizedTalkingChatbot = reactMemo(TalkingChatbot);

export const Route = createFileRoute("/student/tutor")({
  head: () => ({ meta: [{ title: "Vive AI — 3D Intelligent Tutor" }] }),
  component: Tutor,
});

type Msg = { role: "user" | "ai"; text: string };

let globalChatHistory: Msg[] = [
  {
    role: "ai",
    text: "Muraho! Hello! I am Vive, your personal 3D AI tutor. We can solve math problems together, practice English grammar, explore science, or learn in Kinyarwanda. What would you like to explore today?"
  }
];

const SUBJECT_MODES = [
  { id: "all", label: "General", icon: Bot },
  { id: "math", label: "Mathematics", icon: BookOpen },
  { id: "english", label: "English", icon: Sparkles },
  { id: "science", label: "Science", icon: Layers },
  { id: "kinya", label: "Kinyarwanda", icon: Globe },
];

const QUICK_ACTIONS = [
  { label: "Explain simply", prompt: "Could you explain this concept in simple, easy-to-understand words with an example?", icon: Lightbulb },
  { label: "Step-by-step", prompt: "Can you break this down step-by-step for me?", icon: FastForward },
  { label: "Quiz me", prompt: "Give me a quick 1-question quiz to test my understanding!", icon: HelpCircle },
  { label: "In Kinyarwanda", prompt: "Mbabarira ubinsubiriremo mu Kinyarwanda cyoroshye.", icon: Globe },
];

function Tutor() {
  const [messages, setMessages] = useState<Msg[]>(globalChatHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechQueue, setSpeechQueue] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [micError, setMicError] = useState<{ message: string, suggestion: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldBeListeningRef = useRef(false);

  useEffect(() => {
    globalChatHistory = messages;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      stopAllAISpeech();
      window.dispatchEvent(new CustomEvent("vive-stop-speech"));
    };
  }, []);

  const clearChat = () => {
    const initial: Msg[] = [
      {
        role: "ai",
        text: "Chat cleared! What new topic shall we explore?"
      }
    ];
    setMessages(initial);
    globalChatHistory = initial;
    stopAllAISpeech();
    setSpeechQueue("");
  };

  const toggleListen = async () => {
    if (isListening && recognitionRef.current) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    shouldBeListeningRef.current = true;
    setMicError(null);
    setIsListening(true);
    setSpeechQueue("");

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedSubject === "kinya" ? "rw-RW" : "en-US";

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        if (interimTranscript) setInput(interimTranscript);
        if (finalTranscript.trim()) {
          setInput(finalTranscript);
          shouldBeListeningRef.current = false;
          setIsListening(false);
          recognition.stop();
          send(finalTranscript);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') {
          shouldBeListeningRef.current = false;
          setIsListening(false);
          return;
        }
        setMicError({
          message: "Microphone note",
          suggestion: "Please check microphone permissions and try speaking again."
        });
        shouldBeListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const send = async (t?: string) => {
    const txt = (t ?? input).trim();
    if (!txt) return;
    setInput("");
    setSpeechQueue("");
    setMicError(null);
    setMessages((m) => [...m, { role: "user", text: txt }]);
    setLoading(true);

    try {
      const systemPrompt = `You are Vive AI, a warm, encouraging, and intelligent 3D primary school AI tutor.
Language Rules:
- Default language is English.
- If the student speaks/writes in Kinyarwanda or if the subject is Kinyarwanda, reply in natural, clear Kinyarwanda.
Pedagogy:
- Explain concepts with simple, intuitive everyday examples.
- End each response with an encouraging check-in or friendly question.
- Keep responses concise (3-5 sentences).`;

      const chatHistory = messages
        .filter(m => m.text?.trim())
        .map(m => ({
          role: m.role === "user" ? "USER" : "CHATBOT",
          message: m.text
        }));

      const res = await fetch("/api/ai/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: txt,
          chatHistory,
          systemPrompt
        })
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      if (!res.body) throw new Error("Stream unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let replyBuffer = "";
      let streamBuffer = "";

      setMessages((m) => [...m, { role: "ai", text: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamBuffer += chunk;
        const lines = streamBuffer.split('\n');
        streamBuffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed);
            if (data.event_type === "text-generation" && data.text) {
              replyBuffer += data.text;
              setMessages((m) => {
                const newM = [...m];
                newM[newM.length - 1] = { role: "ai", text: replyBuffer };
                return newM;
              });
            } else if (data.message) {
              replyBuffer = data.message;
              setMessages((m) => {
                const newM = [...m];
                newM[newM.length - 1] = { role: "ai", text: replyBuffer };
                return newM;
              });
            }
          } catch {}
        }
      }

      if (streamBuffer.trim()) {
        try {
          const data = JSON.parse(streamBuffer.trim());
          if (data.text) replyBuffer += data.text;
        } catch {}
      }

      setMessages((m) => {
        const newM = [...m];
        newM[newM.length - 1] = { role: "ai", text: replyBuffer };
        return newM;
      });

      if (!isMuted && replyBuffer.trim()) {
        setSpeechQueue(replyBuffer);
      }
      setLoading(false);
    } catch {
      const fallback = `I understand your question on "${txt}". Let me explain clearly. What part would you like to start with?`;
      setMessages((m) => [...m, { role: "ai", text: fallback }]);
      if (!isMuted) setSpeechQueue(fallback);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto h-[calc(100vh-7.5rem)] min-h-[560px] flex flex-col gap-3 animate-fade-in">
      {/* ── TOP TOOLBAR ── */}
      <div className="flex items-center justify-between gap-3 px-1 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUBJECT_MODES.map((sub) => {
            const SIcon = sub.icon;
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#4A8FE7] text-white shadow-md shadow-blue-500/20 scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <SIcon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted) {
                stopAllAISpeech();
                setSpeechQueue("");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
              isMuted
                ? "bg-red-500/10 border-red-500/30 text-red-500"
                : "bg-emerald-500/10 border-emerald-500/30 text-[#0E9F6E]"
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? "Muted" : "Voice On"}</span>
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT: COMPACT AVATAR STACK + EXPANSIVE CHAT ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-4 min-h-0">
        {/* ── LEFT COLUMN: AVATAR CARD ── */}
        <div className="flex flex-col min-h-0">
          {/* 3D Avatar Card — fills the left column */}
          <div
            className="flex-1 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden shadow-sm min-h-0"
            style={{
              background: "linear-gradient(180deg, #0F2447 0%, #132D5E 60%, #0A1628 100%)",
              border: "1px solid rgba(74,143,231,0.18)"
            }}
          >
            {/* Status Header */}
            <div className="relative z-10 flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isListening
                      ? "bg-red-500 animate-ping"
                      : loading || speechQueue
                      ? "bg-[#4A8FE7] animate-pulse"
                      : "bg-[#0E9F6E]"
                  }`}
                />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {isListening ? "Listening" : loading ? "Thinking" : "Ready"}
                </span>
              </div>

              {(speechQueue || loading) && (
                <div className="flex items-center gap-1">
                  {[20, 40, 70, 35, 60].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#4A8FE7] rounded-full animate-pulse"
                      style={{
                        height: `${h * 0.16}px`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 3D Avatar Centerpiece with Hands — fills remaining space */}
            <div className="relative z-10 flex-1 flex items-center justify-center min-h-0 py-2">
              <MemoizedTalkingChatbot textToSpeak={speechQueue} isMuted={isMuted} />
            </div>

            {/* Stage Footer */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1 text-blue-200">
                <Bot className="w-3.5 h-3.5 text-[#4A8FE7]" /> Vive 3D Tutor
              </span>
              <span className="text-[10px] font-black uppercase text-[#D4952A]">
                Adaptive
              </span>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: FULL-HEIGHT CHAT CANVAS ── */}
        <div
          className="rounded-3xl flex flex-col justify-between overflow-hidden shadow-sm"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)"
          }}
        >
          {/* Messages Scroll Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                {m.role === "ai" ? (
                  <div className="flex items-start gap-3 max-w-[85%]">
                    {/* Bot Avatar Icon */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-sm"
                      style={{ background: "linear-gradient(135deg, #4A8FE7, #0F2447)" }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>

                    {/* AI Message Card */}
                    <div
                      className="rounded-2xl rounded-tl-xs p-4 text-sm font-medium leading-relaxed shadow-xs relative group border"
                      style={{
                        background: "var(--muted)",
                        borderColor: "var(--border)",
                        color: "inherit"
                      }}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.text && (
                        <button
                          onClick={() => {
                            if (!isMuted) setSpeechQueue(m.text);
                          }}
                          className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                          title="Read aloud with 3D avatar"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#4A8FE7]" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* User Message Bubble */
                  <div
                    className="max-w-[75%] rounded-2xl rounded-br-xs px-4 py-3 text-sm font-medium leading-relaxed shadow-sm text-white"
                    style={{
                      background: "linear-gradient(135deg, #4A8FE7 0%, #1E5BBE 100%)",
                    }}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3 justify-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ background: "linear-gradient(135deg, #4A8FE7, #0F2447)" }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2.5 shadow-xs"
                  style={{ background: "rgba(74,143,231,0.1)", border: "1px solid rgba(74,143,231,0.2)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#4A8FE7] animate-ping" />
                  <span className="text-xs font-bold text-[#4A8FE7]">Vive is formulating explanation...</span>
                </div>
              </div>
            )}
          </div>

          {/* ── BOTTOM DOCK: QUICK CHIPS + FLOATING INPUT ── */}
          <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/30">
            {/* Quick Inquiries Always Visible Above Input */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_ACTIONS.map((action) => {
                const AIcon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => send(action.prompt)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all text-left cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs hover:scale-102"
                  >
                    <AIcon className="w-3.5 h-3.5 text-[#4A8FE7]" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>

            {micError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-500 font-bold">{micError.suggestion}</p>
              </div>
            )}

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListen}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
                title={isListening ? "Stop listening" : "Speak with microphone"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#4A8FE7]" />}
              </button>

              <input
                value={input}
                disabled={loading || isListening}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={isListening ? "Listening to your voice..." : "Ask Vive any question in English or Kinyarwanda..."}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all shadow-inner"
                style={{
                  background: "var(--input)",
                  border: "1px solid var(--border)"
                }}
              />

              <button
                disabled={loading || !input.trim()}
                onClick={() => send()}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-md shrink-0"
                style={{ background: "linear-gradient(135deg, #4A8FE7, #1E5BBE)" }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
