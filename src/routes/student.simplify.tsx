import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { simplifyText as localSimplifyText } from "@/lib/mock-data";
import { Volume2, Square, Type, Sparkles, RefreshCw, Info } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/student/simplify")({
  head: () => ({ meta: [{ title: "Linguistic Synthesizer — Vive AI" }] }),
  component: Simplify,
});

const SAMPLE =
  "Photosynthesis is the process plants use to make their own food. Plants take in sunlight, water, and carbon dioxide, then make glucose for energy and release oxygen into the air.";



function Simplify() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [text, setText] = useState(SAMPLE);
  const [overlay, setOverlay] = useState<"none" | "cream" | "mint" | "rose">("none");
  const [dyslexic, setDyslexic] = useState(true);
  const [simplifiedText, setSimplifiedText] = useState("");
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [engine, setEngine] = useState<"gemini" | "rule-based" | "none">("none");
  const [isReading, setIsReading] = useState(false);

  // Initialize with Rule-based on start
  useEffect(() => {
    handleSimplify(true); // fast rule-based simplification initially
  }, []);

  const handleSimplify = async (forceRuleBased = false) => {
    if (!text.trim()) {
      setSimplifiedText("");
      setEngine("none");
      return;
    }
    
    setIsSimplifying(true);
    
    if (forceRuleBased) {
      // Simulate quick thinking
      setTimeout(() => {
        setSimplifiedText(localSimplifyText(text));
        setEngine("rule-based");
        setIsSimplifying(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/ai/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, grade: "P6", subject: "Science" }),
      });

      if (response.ok) {
        const data = await response.json();
        setSimplifiedText(data.simplified);
        setEngine(data.engine);
      } else {
        // Fallback to rules-based on error
        setSimplifiedText(localSimplifyText(text));
        setEngine("rule-based");
      }
    } catch (err) {
      setSimplifiedText(localSimplifyText(text));
      setEngine("rule-based");
    } finally {
      setIsSimplifying(false);
    }
  };

  const speak = (t: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    if (!t) return;
    window.speechSynthesis.cancel();
    
    const u = new SpeechSynthesisUtterance(t);
    u.rate = 0.92;
    u.pitch = 1.05;
    
    // Attempt to select a premium english voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Premium") || v.name.includes("Google"))) || 
                  voices.find(v => v.lang.startsWith("en"));
    if (voice) u.voice = voice;
    
    u.onstart = () => setIsReading(true);
    u.onend = () => setIsReading(false);
    u.onerror = () => setIsReading(false);
    
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
  };

  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0";

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in main-content-padding pb-28">
      
      {/* ── HERO BANNER ── */}
      <div className="relative rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 shadow-xl hover-glow"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1, #5BA0E3)", minHeight: "180px" }}>
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full filter blur-[80px] animate-pulse-glow" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full filter blur-[40px]" />

        <div className="relative z-10 flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> Linguistic Analyzer
          </div>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight">
            Text <span className="text-yellow-300">Synthesizer</span>
          </h1>
          <p className="text-white/80 font-medium text-sm max-w-lg">
            Make any complex textbook chapter, article, or homework problem instantly easy to read and understand.
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => handleSimplify(false)}
            disabled={isSimplifying}
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSimplifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-100" />
            )}
            Simplify with AI
          </button>
          
          <button
            onClick={() => handleSimplify(true)}
            className="text-white/85 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            Use Rule Engine
          </button>
        </div>
      </div>

      {/* ── CONTROLS CARD ── */}
      <div className="pro-card glass-panel p-6 relative overflow-hidden">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: textMuted }}>
              <Type className="h-3.5 w-3.5" /> Visual Overlays
            </div>
            <div className="flex gap-2">
              {(["none", "cream", "mint", "rose"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOverlay(o)}
                  className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    overlay === o
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/35"
                      : (isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={dyslexic}
                onChange={(e) => setDyslexic(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-none bg-slate-200 accent-indigo-600 cursor-pointer transition-all"
              />
              <span className="text-[10px] font-black uppercase tracking-widest transition-colors"
                style={{ color: dyslexic ? "#6366F1" : textMuted }}>
                Dyslexic Typeface
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── SOURCE AND SIMPLIFIED GRID ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Left: Input Text */}
        <div className="pro-card glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg,transparent,#8B5CF6,transparent)" }} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
              📚 Source Material
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              {text.length} chars
            </span>
          </div>

          <div className="relative flex-1 min-h-[350px] flex flex-col">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type difficult study materials here..."
              className={`w-full flex-1 min-h-[320px] rounded-2xl p-6 text-base font-semibold leading-relaxed border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all resize-none ${
                dyslexic ? "font-dyslexic" : ""
              } ${overlay !== "none" ? `overlay-${overlay}` : (isDark ? "bg-white/5 text-slate-100" : "bg-slate-50 text-slate-800")}`}
            />
            
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => speak(text)}
                title="Read aloud original text"
                className="h-10 w-10 p-0 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-indigo-600 hover:text-white border border-white/10 shadow-lg text-slate-400"
              >
                <Volume2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Simplified Text */}
        <div className="pro-card glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg,transparent,#5BA0E3,transparent)" }} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: textMuted }}>
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Synthesized Result
            </span>
            
            {engine !== "none" && (
              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                engine === "gemini"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}>
                {engine === "gemini" ? "Vive AI (Gemini)" : "Rule Engine (Offline)"}
              </span>
            )}
          </div>

          <div className="relative flex-1 min-h-[350px] flex flex-col">
            <div className={`w-full flex-1 min-h-[320px] rounded-2xl p-6 text-base font-semibold leading-relaxed whitespace-pre-wrap ${
              dyslexic ? "font-dyslexic" : ""
            } ${overlay !== "none" ? `overlay-${overlay}` : (isDark ? "bg-indigo-950/20 text-slate-100" : "bg-indigo-50/40 text-slate-800")}`}
              style={{ border: `1px solid ${cardBorder}` }}>
              {isSimplifying ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center gap-3">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-400 animate-pulse">
                    Synthesizing chapters...
                  </p>
                </div>
              ) : (
                simplifiedText || (
                  <span className="opacity-30 italic text-sm">
                    Enter source material and click "Simplify with AI" to generate...
                  </span>
                )
              )}
            </div>

            {simplifiedText && !isSimplifying && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => speak(simplifiedText)}
                  title="Read simplified text"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-md shadow-indigo-600/35"
                >
                  <Volume2 className="h-4 w-4" /> Listen
                </button>
                <button
                  onClick={stop}
                  title="Stop speech"
                  className={`h-10 w-10 p-0 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-red-600 hover:text-white border border-white/10 shadow-lg ${
                    isReading ? "text-red-500 animate-pulse" : "text-slate-400"
                  }`}
                >
                  <Square className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── EDUCATIONAL INFORMATION BOX ── */}
      <div className="pro-card glass-panel p-5 relative overflow-hidden flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <Info className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h4 className="text-sm font-black mb-1" style={{ color: textPrimary }}>Inclusive Dyslexic Assist</h4>
          <p className="text-xs font-medium leading-relaxed" style={{ color: textMuted }}>
            Our synthesizer optimizes font spacing, applies dyslexia-friendly weightings, and applies color sensitivity overlays (such as Irlen syndrome cream and mint sheets) to decrease visual stress and maximize reading focus.
          </p>
        </div>
      </div>

    </div>
  );
}
