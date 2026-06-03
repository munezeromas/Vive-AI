/**
 * TalkingChatbot.tsx — FIXED VERSION
 *
 * Fixes applied:
 *  1. Infinite recursion: unlock() was listening to vive-audio-unlocked which it
 *     also dispatched. Fixed with a hasUnlocked guard flag.
 *  2. TalkingHead TTS 404: speakText() needs a real TTS endpoint to fetch audio.
 *     Since you don't have one configured, we switch to speakText() with the
 *     Web Speech API (browser TTS) for the audio, while TalkingHead handles the
 *     3D lip-sync visemes from the text directly. This is the correct free approach.
 *  3. Browser TTS fallback runs when TalkingHead isn't available.
 *
 * src/components/vive/TalkingChatbot.tsx
 */

import { useEffect, useRef, useState, memo } from "react";
import { useCurrentAISpeech } from "@/lib/useSpeakAI";
import { Volume2 } from "lucide-react";

interface TalkingChatbotProps {
  textToSpeak?: string;
  onSubtitle?: (text: string) => void;
  mood?: string;
  isMuted?: boolean;
}

// ── Singleton unlock guard — prevents re-entrant calls ────────────────────
let _audioUnlocked = false;

// ── Persistent reference set to prevent SpeechSynthesisUtterance Garbage Collection ──
const _activeUtterances = new Set<SpeechSynthesisUtterance>();

// ── Browser TTS helper ─────────────────────────────────────────────────────
function browserSpeak(text: string, queue: boolean = false, onStart?: () => void, onEnd?: () => void) {
  if (!window.speechSynthesis) return;
  if (!queue) {
    window.speechSynthesis.cancel();
    _activeUtterances.clear();
  }

  // If text is empty, we just wanted to cancel
  if (!text.trim()) return;

  const u = new SpeechSynthesisUtterance(text);
  
  // Save reference to prevent GC
  _activeUtterances.add(u);

  u.rate = 0.92;
  u.pitch = 1.05;
  u.volume = 1;

  // Pick best available English female voice
  const voices = window.speechSynthesis.getVoices();
  const pick =
    voices.find((v) => v.name === "Google UK English Female") ||
    voices.find((v) => v.name.includes("Samantha")) ||
    voices.find((v) => v.name.includes("Zira")) ||
    voices.find((v) => v.lang === "en-US" && v.name.includes("Female")) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (pick) u.voice = pick;

  u.onstart = () => {
    onStart?.();
  };
  
  u.onend = () => {
    _activeUtterances.delete(u);
    onEnd?.();
  };
  
  u.onerror = (e) => {
    _activeUtterances.delete(u);
    console.error("[BrowserTTS] error:", e.error);
    onEnd?.();
  };

  window.speechSynthesis.speak(u);
}

// ── Component ──────────────────────────────────────────────────────────────
export const TalkingChatbot = memo(function TalkingChatbot({
  textToSpeak: propText,
  onSubtitle,
  mood = "neutral",
  isMuted = false,
}: TalkingChatbotProps) {
  const nodeAvatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [headFailed, setHeadFailed] = useState(false);

  const busText = useCurrentAISpeech();
  const effectiveText = propText !== undefined ? propText : busText;

  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const [audioUnlockedState, setAudioUnlockedState] = useState(_audioUnlocked);

  // ── Audio unlock — FIXED: ensure AudioContext resumes even if clicked early ─────────────
  const unlock = () => {
    if (headRef.current?.audioCtx?.state === "suspended") {
      headRef.current.audioCtx.resume().catch(() => {});
    }

    if (_audioUnlocked) return;
    _audioUnlocked = true;
    setAudioUnlockedState(true);

    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  };

  useEffect(() => {
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // ── TalkingHead init ───────────────────────────────────────────────────
  useEffect(() => {
    if (!nodeAvatarRef.current || headRef.current) return;

    const init = async () => {
      try {
        // @ts-ignore
        const { TalkingHead } = await import("@met4citizen/talkinghead");

        const head = new TalkingHead(nodeAvatarRef.current, {
          cameraView: "head",
          // IMPORTANT: lipsyncModules drives visemes from text directly.
          // We provide audio via browser TTS and let TalkingHead animate visemes from the text string.
          lipsyncModules: ["en"],
          lipsyncLang: "en",
        });

        await head.showAvatar({
          url: "/avatars/brunette.glb",
          body: "F",
          avatarMood: mood,
          avatarIgnoreCamera: false,
        });

        headRef.current = head;
        head.audioCtx?.resume().catch(() => {});
        setReady(true);
        console.log("[TalkingChatbot] TalkingHead ready ✓");
      } catch (err) {
        console.error("[TalkingChatbot] TalkingHead failed, using browser TTS only:", err);
        setHeadFailed(true);
        setReady(true);
      }
    };

    init();

    return () => {
      headRef.current?.stopSpeaking?.();
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Speech Execution Function ──────────────────────────────────────────
  const speakWithAvatar = (text: string, queue: boolean = false) => {
    if (!ready || !text) {
      if (!queue && ready) {
        headRef.current?.stopSpeaking?.();
        window.speechSynthesis?.cancel();
      }
      return;
    }

    onSubtitle?.(text);

    if (isMutedRef.current) {
      headRef.current?.stopSpeaking?.();
      window.speechSynthesis?.cancel();
      return;
    }

    if (!queue) {
      window.speechSynthesis?.cancel();
    }

    if (headFailed || !headRef.current) {
      // TalkingHead not available — plain browser TTS
      browserSpeak(text, queue);
      return;
    }

    // ── The correct approach for TalkingHead WITHOUT a TTS endpoint ────
    try {
      if (!queue) {
        headRef.current.stopSpeaking?.();
      }

      // Ensure AudioContext is active
      if (headRef.current.audioCtx?.state === "suspended") {
        headRef.current.audioCtx.resume().catch(() => {});
      }

      // Parse words and estimate durations
      const words = text.split(/[\s]+/).filter((w) => w.length > 0);
      const wtimes: number[] = [];
      const wdurations: number[] = [];
      let currentTime = 0;

      words.forEach((w) => {
        wtimes.push(currentTime);
        // Estimate ~75ms per character for typical speech rate
        const dur = w.length * 75;
        wdurations.push(dur);
        currentTime += dur + 40; // 40ms pause between words
      });

      const totalDurationMs = currentTime || 1000;

      // Delayed lipsync triggers only when speechSynthesis actually starts
      browserSpeak(
        text,
        queue,
        () => {
          // Speak onstart: trigger visemes
          try {
            const ctx = headRef.current?.audioCtx;
            if (ctx) {
              const sampleRate = ctx.sampleRate || 44100;
              const frameCount = Math.max(1, Math.floor(sampleRate * (totalDurationMs / 1000)));
              const emptyBuffer = ctx.createBuffer(1, frameCount, sampleRate);

              headRef.current.speakAudio({
                audio: emptyBuffer,
                words,
                wtimes,
                wdurations,
              });
            }
          } catch (e) {
            console.error("[TalkingChatbot] speakAudio error:", e);
          }
        },
        () => {
          // Speak onend: stop speaking
          try {
            headRef.current?.stopSpeaking?.();
          } catch (e) {
            console.error("[TalkingChatbot] stopSpeaking error:", e);
          }
        }
      );

      console.log("[TalkingChatbot] speakAudio fallback set up successfully ✓ (queue: " + queue + ")");
    } catch (err) {
      console.error("[TalkingChatbot] speakAudio failed, using browser TTS only:", err);
      browserSpeak(text, queue);
    }
  };

  // ── Speak whenever effectiveText changes (fallback for non-streaming) ───
  useEffect(() => {
    speakWithAvatar(effectiveText, false);
  }, [ready, effectiveText, headFailed, onSubtitle]);

  // ── Global event listener for streaming speech ─────────────────────────
  useEffect(() => {
    const handleSpeakEvent = (e: any) => {
      const { text, queue } = e.detail;
      speakWithAvatar(text, queue);
    };
    window.addEventListener("vive-speak", handleSpeakEvent);
    return () => window.removeEventListener("vive-speak", handleSpeakEvent);
  }, [ready, headFailed, onSubtitle]);

  return (
    <div
      className="w-full h-[350px] overflow-hidden bg-transparent relative flex-shrink-0"
      role="img"
      aria-label="Vive AI talking avatar"
    >
      <div ref={nodeAvatarRef} className="w-full h-full absolute inset-0" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-foreground/40 text-center px-6 animate-pulse">
          Establishing Neural Link…
        </div>
      )}

      {ready && !audioUnlockedState && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={unlock}>
          <div className="px-6 py-3 bg-primary/90 text-primary-foreground font-bold rounded-full shadow-lg border border-white/20 animate-bounce cursor-pointer flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Tap to Activate Audio
          </div>
        </div>
      )}
    </div>
  );
});