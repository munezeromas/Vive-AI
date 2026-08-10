import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { TalkingChatbot } from "@/components/vive/TalkingChatbot";
import { TUTOR_REPLIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Send, Cpu, Sparkles, Network, Mic, MicOff, Volume2, XCircle } from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { memo as reactMemo } from "react";
import { toast } from "sonner";

const MemoizedTalkingChatbot = reactMemo(TalkingChatbot);

export const Route = createFileRoute("/student/tutor")({
  head: () => ({ meta: [{ title: "Vive AI — Your Personal Tutor" }] }),
  component: Tutor,
  errorComponent: ({ error }) => (
    <div className="p-10 bg-red-950 text-red-400 font-mono text-xs rounded-3xl m-10">
      <h2 className="text-xl font-bold mb-4">Runtime Error</h2>
      <pre className="whitespace-pre-wrap">{error.message}</pre>
      <pre className="whitespace-pre-wrap mt-4 opacity-50">{error.stack}</pre>
    </div>
  )
});

type Msg = { role: "user" | "ai"; text: string };

// Persist chat history across navigations
let globalChatHistory: Msg[] = [
  { role: "ai", text: "Neural synchronization complete. I am Vive, designed to help you learn and improve your grammar! What shall we explore today?" }
];

const getFriendlyMicError = (errorCode: string): { message: string, suggestion: string } => {
  switch (errorCode) {
    case 'not-allowed':
      return {
        message: "Microphone access is blocked!",
        suggestion: "Please click the lock icon 🔒 in your browser's address bar (top-left) and set Microphone to 'Allow'. If you are on Windows, also check Windows Settings -> Privacy -> Microphone and turn on 'Allow apps to access your microphone'."
      };
    case 'audio-capture':
      return {
        message: "No microphone detected!",
        suggestion: "Please make sure a microphone or headset is plugged in, powered on, and selected as the default input device in your computer settings."
      };
    case 'network':
      return {
        message: "Internet connection issue!",
        suggestion: "Speech translation requires a stable internet connection in your browser. Please check your Wi-Fi or Ethernet connection and try again."
      };
    case 'service-not-allowed':
      return {
        message: "Speech service not allowed!",
        suggestion: "Your browser or device has restricted access to the speech recognition service. Try using official Google Chrome or check system permissions."
      };
    case 'no-speech':
      return {
        message: "We didn't hear anything!",
        suggestion: "Please speak a bit louder or check if your microphone is muted. Click the microphone button to try speaking again!"
      };
    default:
      return {
        message: `Microphone issue detected: ${errorCode}`,
        suggestion: "Please try refreshing the page, replugging your microphone, or opening this page in a secure browser like Google Chrome."
      };
  }
};

function Tutor() {
  const [messages, setMessages] = useState<Msg[]>(globalChatHistory);

  // Sync to global history whenever messages update
  useEffect(() => {
    globalChatHistory = messages;
  }, [messages]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpeech, setLastSpeech] = useState("Neural synchronization complete. I am Vive, designed to help you learn and improve your grammar. What shall we explore today?");
  const [isMuted, setIsMuted] = useState(false);
  const [micError, setMicError] = useState<{ message: string, suggestion: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopDSPStream();
    };
  }, []);

  const shouldBeListeningRef = useRef(false);
  const dspStreamRef = useRef<MediaStream | null>(null);
  const retryCountRef = useRef(0);

  const startDSPStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        dspStreamRef.current = stream;
        console.log("[DSP] Pre-warmed audio pipeline with Auto-Gain Control.");
      }
    } catch (e) {
      console.warn("[DSP] Could not warm up hardware audio pipeline:", e);
    }
  };

  const stopDSPStream = () => {
    if (dspStreamRef.current) {
      dspStreamRef.current.getTracks().forEach((track) => track.stop());
      dspStreamRef.current = null;
      console.log("[DSP] Released audio pipeline.");
    }
  };

  const toggleListen = async () => {
    if (isListening && recognitionRef.current) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      stopDSPStream();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition isn't supported in your browser. Please try Chrome.", { id: "speech-support" });
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    shouldBeListeningRef.current = true;
    retryCountRef.current = 0;
    setMicError(null);
    setIsListening(true);
    setLastSpeech(""); // Stop any current avatar speaking immediately

    // Warm up the hardware DSP pipeline
    await startDSPStream();

    const startRecognitionSession = () => {
      if (!shouldBeListeningRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // standard sentence chunking
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          if (interimTranscript) {
             setInput(interimTranscript);
          }
          
          if (finalTranscript.trim()) {
            setInput(finalTranscript);
            shouldBeListeningRef.current = false;
            stopDSPStream();
            setIsListening(false);
            recognition.stop();
            send(finalTranscript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("[Tutor Speech] Session Error:", e.error);
          
          if (e.error === 'no-speech') {
            console.log('[Tutor Speech] No speech detected, stopping restart cycle.');
            const friendly = getFriendlyMicError(e.error);
            setMicError(friendly);
            shouldBeListeningRef.current = false;
            stopDSPStream();
            setIsListening(false);
            return;
          }

          if (e.error === 'aborted') {
            // Ignore intentional abort without restarting
            return;
          }
          
          if (e.error === 'network') {
            retryCountRef.current += 1;
            if (retryCountRef.current <= 5) {
              console.log(`[Tutor Speech] Network glitch. Retrying segment (${retryCountRef.current}/5)...`);
              setTimeout(() => {
                startRecognitionSession();
              }, 1000);
              return;
            } else {
              toast.error("Network issue with Chrome's speech servers. Please check your internet connection.", { id: "network-error" });
              shouldBeListeningRef.current = false;
              stopDSPStream();
              setIsListening(false);
            }
            return;
          }
          
          const friendly = getFriendlyMicError(e.error);
          setMicError(friendly);
          toast.error(friendly.message, { id: "mic-error" });
          shouldBeListeningRef.current = false;
          stopDSPStream();
          setIsListening(false);
        };

        recognition.onend = () => {
           if (shouldBeListeningRef.current) {
              console.log("[Tutor Speech] Silence/Pause segment ended. Seamlessly restarting via new session...");
              setTimeout(() => {
                if (shouldBeListeningRef.current) {
                  startRecognitionSession();
                }
              }, 100);
              return;
           }
           setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
         console.error("[Tutor Speech] Start failed:", err);
         setIsListening(false);
      }
    };

    startRecognitionSession();
  };

  const send = async (t?: string) => {
    const txt = (t ?? input).trim();
    if (!txt) return;
    setInput("");
    setLastSpeech(""); // Stop current speech immediately
    setMicError(null);
    setMessages((m) => [...m, { role: "user", text: txt }]);
    setLoading(true);

    try {
      const systemPrompt = `You are Vive AI, a warm, encouraging, and patient AI tutor for primary school students (P1–P6) in Rwanda. You were made to help children learn, grow, and feel confident.

Language Rules:
- Your default language is English. You must converse in English by default.
- You fully support BOTH English AND Kinyarwanda. If the student writes in Kinyarwanda or asks to speak in Kinyarwanda, immediately switch to clear, simple Kinyarwanda and keep using it until asked otherwise. Never refuse to use Kinyarwanda.
- Match the language the student uses. If they mix both languages, that is fine.

Rwandan Curriculum (P1–P6):
- Mathematics: operations, fractions, shapes, measurements using RWF (Rwandan Francs) and local market contexts.
- English: grammar, reading, spelling, sentence writing.
- Science: plants, animals, environment, hygiene, the human body, ecology in Rwanda.
- Social Studies: Rwanda's districts, provinces, community roles, national values, and local geography.
- Always pitch your answer at the right grade level.

Tone & Style:
- Be warm, encouraging, and never judgmental. Never scold.
- Only gently note a spelling mistake IF it causes confusion or IF the student asks for language help — do NOT correct every message.
- Explain things with short, simple sentences and concrete, local examples (Rwandan markets, food, nature, people).
- End each response with a short encouraging word or a follow-up question to keep the student engaged.
- Keep answers concise — 3 to 6 sentences is ideal unless the student asks for more detail.`;

      // Build conversational memory map, filtering out any empty states
      const chatHistory = messages
        .filter(m => m.text && m.text.trim().length > 0)
        .map(m => ({
          role: m.role === "user" ? "USER" : "CHATBOT",
          message: m.text
        }));

      const res = await fetch("/api/ai/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: txt,
          chatHistory: chatHistory,
          systemPrompt: systemPrompt
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      if (!res.body) throw new Error("Network stream unavailable.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let replyTokenBuffer = "";
      let streamBuffer = "";
      let spokenCursor = 0;

      const speakSentence = (sentenceText: string, isFirst: boolean) => {
        // Clean formatting while preserving essential content
        const cleanText = sentenceText
          .replace(/\*\*+/g, "") // remove bold markers
          .replace(/\*+/g, "") // remove italic markers
          .replace(/__+/g, "") // remove underline markers
          .replace(/`+/g, "") // remove code markers
          // Keep emojis - don't remove them as they're part of the message
          .replace(/\s+/g, " ")
          .trim();

        if (!cleanText) return;

        console.log("[Tutor Stream Speech] Dispatching:", cleanText, "isFirst:", isFirst);
        window.dispatchEvent(
          new CustomEvent("vive-speak", {
            detail: {
              text: cleanText,
              queue: !isFirst,
            },
          })
        );
      };

      const flushSpeakableSegments = (force = false) => {
        const pendingText = replyTokenBuffer.substring(spokenCursor);
        if (!pendingText) return;

        console.debug("[Tutor Stream] flushSpeakableSegments start", {
          force,
          pendingLength: pendingText.length,
          spokenCursor,
        });

        const segments: string[] = [];
        const boundaryRegex = /([^.?!]+[.?!]+)(\s+|$)/g;
        let match;
        let lastMatchEnd = 0;

        while ((match = boundaryRegex.exec(pendingText)) !== null) {
          const sentence = match[1].trim();
          if (sentence) segments.push(sentence);
          lastMatchEnd = match.index + match[0].length;
        }

        if (lastMatchEnd > 0) {
          spokenCursor += lastMatchEnd;
        } else if (force || pendingText.length > 180) {
          const safeCutoff = Math.max(
            pendingText.lastIndexOf("\n", 180),
            pendingText.lastIndexOf(" ", 180),
            pendingText.lastIndexOf(",", 180),
            pendingText.lastIndexOf(";", 180)
          );

          if (safeCutoff > 60) {
            const chunk = pendingText.substring(0, safeCutoff).trim();
            if (chunk) {
              segments.push(chunk);
              spokenCursor += safeCutoff;
            }
          } else if (force && pendingText.length > 20) {
            segments.push(pendingText.trim());
            spokenCursor = replyTokenBuffer.length;
          }
        }

        if (segments.length > 0) {
          console.debug("[Tutor Stream] flushSpeakableSegments dispatching segments", {
            segmentCount: segments.length,
            force,
          });

          const hadSpokenBefore = spokenCursor > 0;
          segments.forEach((segment, index) => {
            if (!segment) return;
            const isFirst = !hadSpokenBefore && index === 0;
            speakSentence(segment, isFirst);
          });
        }
      };
      
      // Inject placeholder
      setMessages((m) => [...m, { role: "ai", text: "" }]);
      // Keep loading true while streaming to show the frying pan animation

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamBuffer += chunk;

        const lines = streamBuffer.split('\n');
        streamBuffer = lines.pop() ?? "";

        let chunkCount = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const data = JSON.parse(trimmed);
            if (data.event_type === "text-generation" && data.text) {
              replyTokenBuffer += data.text;
              chunkCount++;

              if (chunkCount % 4 === 0) {
                setMessages((m) => {
                  const newM = [...m];
                  newM[newM.length - 1] = { role: "ai", text: replyTokenBuffer };
                  return newM;
                });
              }

              flushSpeakableSegments();
            } else if (data.message && data.event_type === undefined) {
              replyTokenBuffer = data.message;
              setMessages((m) => {
                const newM = [...m];
                newM[newM.length - 1] = { role: "ai", text: replyTokenBuffer };
                return newM;
              });

              flushSpeakableSegments();
            }
          } catch (e) {
            console.warn("[Tutor Stream] parse error:", e);
          }
        }

        console.log("[Tutor] Real-time stream batch complete. buffer length:", replyTokenBuffer.length);
      }

      if (streamBuffer.trim()) {
        console.debug("[Tutor Stream] final streamBuffer parse", {
          streamBufferLength: streamBuffer.trim().length,
          preview: streamBuffer.trim().slice(0, 120),
        });
        try {
          const data = JSON.parse(streamBuffer.trim());
          if (data.event_type === "text-generation" && data.text) {
            replyTokenBuffer += data.text;
          } else if (data.message && data.event_type === undefined) {
            replyTokenBuffer = data.message;
          }
        } catch (e) {
          console.warn("[Tutor Stream] final parse error:", e);
        }
      }

      flushSpeakableSegments(true);
      setMessages((m) => {
        const newM = [...m];
        newM[newM.length - 1] = { role: "ai", text: replyTokenBuffer };
        return newM;
      });

      console.log("[Tutor] Real-time stream speech complete. Final buffer length:", replyTokenBuffer.length);
      setLoading(false);
    } catch (err: any) {
      console.error("Chat Error:", err);
      const reply = `I am currently forced into offline diagnostic mode. Error: [${err.message}]. Please check the server logs and ensure your GEMINI_API_KEY is active.`;
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setLastSpeech(reply);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] lg:grid-cols-[450px_1fr] xl:grid-cols-[500px_1fr] gap-4 md:gap-6 xl:gap-8 max-w-400 w-full mx-auto animate-in fade-in zoom-in-95 duration-700 h-auto min-h-[calc(100vh-7rem)] md:h-[calc(100vh-7rem)] pb-6 px-4">
      
      {/* 3D AVATAR MODULE */}
      <div className="relative rounded-[40px] bg-linear-to-b from-card/80 to-background/50 border border-white/10 shadow-[0_0_80px_rgba(var(--primary),0.05)] overflow-hidden flex flex-col items-center">
        
        {/* Dynamic backdrop glow */}
        <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

        <div className="w-full shrink-0 relative mt-4 md:mt-6 lg:mt-8 px-4 md:px-6 lg:px-8">
           <div className="rounded-[32px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative bg-black/10 border border-white/5 ring-1 ring-black/20">
             <MemoizedTalkingChatbot textToSpeak={lastSpeech} isMuted={isMuted} />
             <div className="absolute top-4 left-4 glass bg-black/40 rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10 shadow-sm backdrop-blur-md">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(var(--success),0.8)]" />
                <span className="text-[9px] font-black tracking-widest text-white/90 uppercase mt-0.5">Core Active</span>
             </div>
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className="absolute top-4 right-4 glass bg-black/40 hover:bg-black/60 rounded-full p-2 border border-white/10 shadow-sm backdrop-blur-md text-white transition-colors"
               title={isMuted ? "Unmute Avatar" : "Mute Avatar"}
             >
               {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
             </button>
           </div>
        </div>
        <div className="text-center mt-6 md:mt-8 lg:mt-10 mb-6 md:mb-8 lg:mb-10 z-10 px-4 md:px-6 lg:px-8 flex-1 flex flex-col justify-center w-full">
           <h2 className="text-4xl font-black tracking-tighter mb-2">Vive <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">AI</span></h2>
        </div>
      </div>

      {/* INTELLIGENT CHAT INTERFACE */}
      <div className="rounded-[40px] glass bg-card/40 border border-white/5 shadow-2xl flex flex-col h-125 md:h-full overflow-hidden relative mt-4 md:mt-0">
        <div className="absolute right-0 bottom-0 w-125 h-125 bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        {/* Header */}
        <div className="p-8 pb-5 flex items-center gap-4 relative z-10 border-b border-white/5 bg-background/20 backdrop-blur-sm">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <RiveAnimation src="/riv-animations/22673-42423-for-education-purpose.riv" className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Vive AI Portal</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mt-1"><Sparkles className="h-3 w-3" /> Always here to listen</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
              <div className={`max-w-[85%] rounded-[28px] px-8 py-5 text-[15px] font-medium leading-relaxed shadow-md backdrop-blur-md whitespace-pre-wrap relative group ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm bg-linear-to-br from-primary to-primary/80" : "glass bg-card/80 border border-white/10 rounded-bl-sm text-foreground"}`}>
                 {m.text}
                 {m.role === "ai" && m.text && (
                   <button 
                     onClick={() => setLastSpeech(m.text + " ")} 
                     className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full glass bg-white/10 hover:bg-primary/20 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                     title="Read Aloud"
                   >
                     <Volume2 className="h-4 w-4" />
                   </button>
                 )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start animate-in fade-in">
               <div className="rounded-[28px] rounded-bl-sm px-4 py-3 flex flex-col items-start gap-1 shadow-sm" style={{ background: "rgba(74,144,217,0.15)", border: "1px solid rgba(74,144,217,0.2)" }}>
                 <div className="w-32 h-24 bg-white rounded-2xl shadow-sm mb-2 overflow-hidden flex items-center justify-center">
                   <RiveAnimation src="/riv-animations/1137-2229-cooking-animation.riv" className="w-[120%] h-[120%]" stateMachines="State Machine 1" />
                 </div>
                 <p className="text-xs font-black text-[#4A90D9] italic">Vive is cooking... 🍳</p>
               </div>
             </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 pt-2 relative z-10 bg-linear-to-t from-background/80 to-transparent flex flex-col gap-4">
          {micError && (
            <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-left animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">
                    {micError.message}
                  </p>
                  <p className="text-xs font-semibold text-white/95 leading-relaxed">
                    {micError.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="relative flex items-center gap-3">
             <Button size="icon" variant={isListening ? "default" : "outline"} onClick={toggleListen} className={`h-16 w-16 shrink-0 rounded-full transition-all border-white/10 ${isListening ? "animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.6)] bg-primary text-white" : "glass bg-background/50 hover:bg-background/80"}`}>
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6 text-primary" />}
             </Button>
             <input value={input} disabled={loading || isListening} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={isListening ? "Listening natively..." : "Transmit inquiry to Core..."} className="flex-1 rounded-full glass bg-background/80 focus:ring-4 ring-primary/20 placeholder:text-muted-foreground/40 px-8 py-6 text-base font-semibold border border-white/10 shadow-inner transition-all disabled:opacity-50" />
             <Button size="icon" disabled={loading || isListening || !input.trim()} onClick={() => send()} className="h-16 w-16 shrink-0 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_25px_rgba(var(--primary),0.6)] disabled:shadow-none hover:scale-105 transition-all text-white">
                <Send className="h-6 w-6 ml-1" />
             </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
