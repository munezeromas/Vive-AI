import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, ArrowLeft, Mic, MicOff, Volume2, Loader2,
  CheckCircle2, XCircle, ChevronRight, BookOpen, Headphones, Repeat2, Sparkles
} from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { STUDENT } from "@/lib/mock-data";
import { useSession } from "@/lib/auth-client";
import { geminiSimplify } from "@/lib/gemini-server";
import { toast } from "sonner";



export const Route = createFileRoute("/student/speak")({
  head: () => ({ meta: [{ title: "Language Playground — Vive AI" }] }),
  component: SpeakListenDashboard,
});

type ModeId = "read-speak" | "listen-write" | "listen-repeat";

const MODES = [
  {
    id: "read-speak" as ModeId,
    title: "Read & Speak",
    desc: "Read the sentence aloud — Vive AI listens and checks your pronunciation!",
    icon: BookOpen,
    gradient: "from-sky-500 to-cyan-400",
    glow: "rgba(14,165,233,0.3)",
    skill: "reading and speaking",
  },
  {
    id: "listen-write" as ModeId,
    title: "Listen & Write",
    desc: "Listen to the sentence, then type exactly what you heard.",
    icon: Headphones,
    gradient: "from-emerald-500 to-green-400",
    glow: "rgba(16,185,129,0.3)",
    skill: "listening and spelling",
  },
  {
    id: "listen-repeat" as ModeId,
    title: "Listen & Repeat",
    desc: "Listen to the pronunciation and speak it back perfectly!",
    icon: Repeat2,
    gradient: "from-violet-500 to-purple-400",
    glow: "rgba(139,92,246,0.3)",
    skill: "listening and pronunciation",
  },
];

function getFriendlyMicError(code: string): { message: string; suggestion: string } {
  const map: Record<string, { message: string; suggestion: string }> = {
    "not-allowed":        { message: "Microphone access is blocked!", suggestion: "Click the lock 🔒 in your address bar → set Microphone to 'Allow'. On Windows, also check Settings → Privacy → Microphone." },
    "audio-capture":      { message: "No microphone detected!", suggestion: "Plug in a microphone or headset, make sure it is powered on and selected as the default input device." },
    "network":            { message: "Internet connection issue!", suggestion: "Speech recognition needs a stable internet connection. Check your Wi-Fi and try again." },
    "service-not-allowed":{ message: "Speech service not allowed!", suggestion: "Try Google Chrome for the best speech recognition support." },
    "no-speech":          { message: "We didn't hear anything!", suggestion: "Speak louder or check your microphone. Click the mic button to try again!" },
  };
  return map[code] ?? { message: `Microphone issue: ${code}`, suggestion: "Try refreshing the page or using Google Chrome." };
}

function SpeakListenDashboard() {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const userLevel = user && typeof (user as any).level === 'number' ? (user as any).level : STUDENT.level;
  const [activeMode, setActiveMode] = useState<ModeId | null>(null);
  const [practiceText, setPracticeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [userInput, setUserInput] = useState("");
  const [micError, setMicError] = useState<{ message: string; suggestion: string } | null>(null);

  const recognitionRef        = useRef<any>(null);
  const practiceTextRef       = useRef(practiceText);
  const shouldBeRecordingRef  = useRef(false);
  const accumulatedRef        = useRef("");
  const transcriptRef         = useRef("");
  const evaluatedRef          = useRef(false);
  const hasSpokenRef          = useRef(false);
  const dspStreamRef          = useRef<MediaStream | null>(null);
  const retryCountRef         = useRef(0);

  useEffect(() => { practiceTextRef.current = practiceText; }, [practiceText]);

  useEffect(() => () => {
    shouldBeRecordingRef.current = false;
    recognitionRef.current?.stop();
    stopDSP();
  }, []);

  // ── DSP warm-up ────────────────────────────────────────────────────
  const startDSP = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        dspStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
      }
    } catch { /* ignore */ }
  };
  const stopDSP = () => {
    dspStreamRef.current?.getTracks().forEach(t => t.stop());
    dspStreamRef.current = null;
  };

  // ── Fetch new AI sentence ──────────────────────────────────────────
  const fetchNewPractice = async (modeId: string) => {
    const mode = MODES.find(m => m.id === modeId);
    if (!mode) return;
    setLoading(true);
    setPracticeText("");
    setTranscript("");
    setFeedback(null);
    setUserInput("");
    setMicError(null);
    try {
      const raw = await geminiSimplify({
        data: { promptType: "language-practice", grade: userLevel, skill: mode.skill }
      });
      const clean = raw.replace(/^["']|["']$/g, "").replace(/Here is a sentence:|Sentence:/i, "").trim();
      setPracticeText(clean);
    } catch {
      setPracticeText("The quick brown fox jumps over the lazy dog.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartMode = (modeId: ModeId) => {
    setActiveMode(modeId);
    fetchNewPractice(modeId);
  };

  const playTTS = (text: string) => {
    if (!window.speechSynthesis || !text) return;
    
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Premium") || v.name.includes("Google")))
                ?? voices.find(v => v.lang.startsWith("en"));
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };

  // ── Toggle recording ──────────────────────────────────────────────
  const toggleRecording = async () => {
    if (isRecording && recognitionRef.current) {
      shouldBeRecordingRef.current = false;
      recognitionRef.current.stop();
      stopDSP();
      setIsRecording(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Your browser does not support speech recognition. Please use Chrome!", { id: "speech-support" });
      return;
    }

    shouldBeRecordingRef.current = true;
    accumulatedRef.current = "";
    retryCountRef.current = 0;
    setTranscript("");
    transcriptRef.current = "";
    setFeedback(null);
    setMicError(null);
    setIsRecording(true);
    await startDSP();

    const startSession = () => {
      if (!shouldBeRecordingRef.current) return;
      try {
        const rec = new SR();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => { setIsRecording(true); evaluatedRef.current = false; hasSpokenRef.current = false; };

        rec.onresult = (event: any) => {
          let seg = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) seg += event.results[i][0].transcript;
          const combined = (accumulatedRef.current + " " + seg).trim();
          setTranscript(combined);
          transcriptRef.current = combined;
          hasSpokenRef.current = true;

          const target = practiceTextRef.current;
          if (target) {
            const norm = (s: string) => s.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
            if (norm(combined) === norm(target) || norm(combined).includes(norm(target))) {
              evaluatedRef.current = true;
              shouldBeRecordingRef.current = false;
              stopDSP();
              setFeedback({ text: "Correct! Amazing job! 🌟", isSuccess: true });
              rec.stop();
            }
          }
        };

        rec.onerror = (e: any) => {
          if (e.error === "aborted") return;
          if (e.error === "no-speech") {
            setMicError(getFriendlyMicError(e.error));
            shouldBeRecordingRef.current = false;
            stopDSP();
            setIsRecording(false);
            return;
          }
          if (e.error === "network") {
            retryCountRef.current++;
            if (retryCountRef.current <= 5) { setTimeout(startSession, 1000); return; }
          }
          const friendly = getFriendlyMicError(e.error);
          setMicError(friendly);
          toast.error(friendly.message, { id: "mic-error" });
          shouldBeRecordingRef.current = false;
          stopDSP();
          setIsRecording(false);
        };

        rec.onend = () => {
          if (shouldBeRecordingRef.current) {
            accumulatedRef.current = transcriptRef.current;
            setTimeout(() => { if (shouldBeRecordingRef.current) startSession(); }, 100);
            return;
          }
          setIsRecording(false);
          if (evaluatedRef.current) return;
          if (!hasSpokenRef.current && !accumulatedRef.current) return;
          setTimeout(() => evaluateSpeech(transcriptRef.current), 400);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch {
        setIsRecording(false);
      }
    };
    startSession();
  };

  const evaluateSpeech = (spoken: string) => {
    if (!practiceTextRef.current) return;
    if (!spoken?.trim()) {
      setFeedback({ text: "I didn't catch that! Please check your microphone or speak a bit louder.", isSuccess: false });
      return;
    }
    const norm = (s: string) => s.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
    const isMatch = norm(spoken) === norm(practiceTextRef.current) ||
                    norm(spoken).includes(norm(practiceTextRef.current)) ||
                    norm(practiceTextRef.current).includes(norm(spoken));
    setFeedback(isMatch
      ? { text: "Correct! Amazing job! 🌟", isSuccess: true }
      : { text: `Almost! You said: "${spoken}". Try again!`, isSuccess: false });
  };

  const checkWrittenAnswer = () => {
    if (!practiceText) return;
    const norm = (s: string) => s.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
    setFeedback(norm(userInput) === norm(practiceText)
      ? { text: "Perfect spelling! You are a star! ⭐", isSuccess: true }
      : { text: `Not quite! The correct text was: "${practiceText}". Keep trying!`, isSuccess: false });
  };

  // ─────────────────────────── ACTIVE MODE VIEW ────────────────────
  if (activeMode) {
    const mode = MODES.find(m => m.id === activeMode)!;
    const ModeIcon = mode.icon;
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-400">
        <button
          onClick={() => { setActiveMode(null); setTranscript(""); setFeedback(null); setMicError(null); }}
          className="flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-foreground transition-colors bg-card/60 border border-white/10 px-4 py-2 rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Playground
        </button>

        {/* Mode header */}
        <div className={`relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br ${mode.gradient}`}
          style={{ boxShadow: `0 20px 60px ${mode.glow}` }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
              <ModeIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/70">Language Playground</p>
              <h1 className="text-2xl font-black text-white">{mode.title}</h1>
            </div>
          </div>
        </div>

        {/* Practice card */}
        <div className="rounded-3xl bg-card/60 border border-white/10 p-8 space-y-6 shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-32 w-32">
                <RiveAnimation src="/riv-animations/27328-51630-loading-books.riv" className="w-full h-full" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Generating sentence…</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* The sentence */}
              {activeMode === "read-speak" ? (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">📚 Read this aloud:</p>
                  <p className="text-2xl font-black leading-snug">{practiceText}</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col items-center gap-4">
                  <p className="text-sm font-bold text-muted-foreground">🎧 Listen, then {activeMode === "listen-write" ? "type" : "repeat"} the sentence.</p>
                  <button
                    onClick={() => playTTS(practiceText)}
                    className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-105 flex items-center justify-center"
                  >
                    <Volume2 className="h-8 w-8" />
                  </button>
                </div>
              )}

              {/* Mic error */}
              {micError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">{micError.message}</p>
                      <p className="text-xs font-semibold leading-relaxed">{micError.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── READ & SPEAK / LISTEN & REPEAT: mic button */}
              {(activeMode === "read-speak" || activeMode === "listen-repeat") && !feedback?.isSuccess && (
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={toggleRecording}
                    className={`h-20 w-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                        : "bg-primary/10 border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105"
                    }`}
                  >
                    {isRecording ? <MicOff className="h-9 w-9" /> : <Mic className="h-9 w-9" />}
                  </button>
                  {isRecording && (
                    <p className="text-sm font-bold text-red-400 animate-pulse uppercase tracking-widest">
                      LISTENING… SPEAK NOW!
                    </p>
                  )}
                  {transcript && (
                    <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">You said:</p>
                      <p className="text-base font-semibold italic">"{transcript}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── LISTEN & WRITE: text input */}
              {activeMode === "listen-write" && !feedback?.isSuccess && (
                <div className="space-y-3">
                  <textarea
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Type what you heard…"
                    rows={3}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-base font-semibold focus:outline-none focus:ring-2 ring-primary/30 resize-none placeholder:text-muted-foreground/40"
                  />
                  <button
                    onClick={checkWrittenAnswer}
                    disabled={!userInput.trim()}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    Check My Spelling
                  </button>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`p-5 rounded-2xl border animate-in fade-in duration-300 ${
                  feedback.isSuccess
                    ? "bg-emerald-500/10 border-emerald-500/25"
                    : "bg-red-500/10 border-red-500/25"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {feedback.isSuccess
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      : <XCircle className="h-5 w-5 text-red-400" />}
                    <p className={`text-sm font-black uppercase tracking-widest ${
                      feedback.isSuccess ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {feedback.isSuccess ? "Correct! 🎉" : "Keep going! 💪"}
                    </p>
                  </div>
                  <p className="text-base font-semibold">{feedback.text}</p>
                </div>
              )}

              {/* Next sentence button */}
              {feedback && (
                <button
                  onClick={() => fetchNewPractice(activeMode)}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_8px_30px_rgba(99,102,241,0.35)] animate-in zoom-in-95 duration-300"
                >
                  Next Sentence <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────── HOME VIEW ───────────────────────────
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-500">

      {/* Hero */}
      <div className="relative rounded-[2rem] overflow-hidden p-10 text-center"
        style={{ background: "linear-gradient(135deg, #9B59B6 0%, #6366F1 50%, #3B82F6 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 border border-white/30 text-white mb-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Vive Language Lab</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-lg">
            Language <span className="text-yellow-300">Playground</span>
          </h1>
          <p className="text-white/85 font-semibold text-lg max-w-xl mx-auto">
            Master speaking, listening, and writing — Vive AI generates brand-new sentences just for your grade every time!
          </p>
        </div>
      </div>

      {/* Mode cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {MODES.map((mode) => {
          const ModeIcon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => handleStartMode(mode.id)}
              className="group rounded-3xl bg-card/60 border border-white/10 p-7 text-left hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col gap-5 relative overflow-hidden"
            >
              {/* gradient top strip */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mode.gradient}`} />
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
              >
                <ModeIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-black">{mode.title}</h3>
                <p className="text-sm font-semibold text-muted-foreground leading-relaxed">{mode.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                Start Practice <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bot companion card */}
      <div className="rounded-3xl bg-card/60 border border-white/10 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-lg">
        <div className="w-28 h-28 shrink-0">
          <RiveAnimation src="/riv-animations/22673-42423-for-education-purpose.riv" className="w-full h-full" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-black">Practice Makes Perfect! ⭐</h3>
          <p className="text-sm font-semibold text-muted-foreground leading-relaxed max-w-2xl">
            Vive AI generates completely new sentences based on your grade every time you practice. It listens to your pronunciation, checks your spelling, and helps you become a confident speaker. Don't be afraid to make mistakes — that's how we grow!
          </p>
        </div>
      </div>
    </div>
  );
}
