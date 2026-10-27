/**
 * TalkingChatbot.tsx — VISIBLE, WIDE CONVERSATIONAL 3D LIP-SYNC & NO REPETITION
 *
 * 1. Deduplication: Tracks spoken text to ensure it NEVER re-speaks old messages.
 * 2. Distinct, wide lip movement: Calibrated visemes with clear, visible mouth shapes.
 * 3. Compact waist-up avatar framing with hands.
 */

import { useEffect, useRef, useState, memo } from "react";
import { useCurrentAISpeech } from "@/lib/useSpeakAI";
import { Volume2 } from "lucide-react";

let _audioUnlocked = false;
const _activeUtterances = new Set<SpeechSynthesisUtterance>();

function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  return (
    voices.find((v) => v.name.includes("Google UK English Female")) ||
    voices.find((v) => v.name.includes("Google US English")) ||
    voices.find((v) => v.name.includes("Microsoft Zira")) ||
    voices.find((v) => v.name.includes("Microsoft Jenny")) ||
    voices.find((v) => v.name.includes("Samantha")) ||
    voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0] ||
    null
  );
}

export function stopAllAISpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  _activeUtterances.clear();
}

interface TalkingChatbotProps {
  textToSpeak?: string;
  onSubtitle?: (text: string) => void;
  mood?: string;
  isMuted?: boolean;
}

export const TalkingChatbot = memo(function TalkingChatbot({
  textToSpeak: propText,
  onSubtitle,
  mood = "neutral",
  isMuted = false,
}: TalkingChatbotProps) {
  const nodeAvatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const lastSpokenRef = useRef<string>("");

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted) {
      stopSpeaking();
    }
  }, [isMuted]);

  const busText = useCurrentAISpeech();
  const effectiveText = propText !== undefined ? propText : busText;

  const [audioUnlockedState, setAudioUnlockedState] = useState(_audioUnlocked);

  const stopSpeaking = () => {
    try {
      headRef.current?.stopSpeaking?.();
      headRef.current?.resetLips?.();
    } catch {}
    stopAllAISpeech();
  };

  const unlock = () => {
    if (headRef.current?.audioCtx?.state === "suspended") {
      headRef.current.audioCtx.resume().catch(() => {});
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    _audioUnlocked = true;
    setAudioUnlockedState(true);
  };

  useEffect(() => {
    window.addEventListener("click", unlock, { once: false });
    window.addEventListener("keydown", unlock, { once: false });
    window.addEventListener("pointerdown", unlock, { once: false });

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  // Initialize TalkingHead
  useEffect(() => {
    if (!nodeAvatarRef.current || headRef.current) return;
    let isSubscribed = true;

    const init = async () => {
      try {
        // @ts-ignore
        const { TalkingHead } = await import("@met4citizen/talkinghead");
        if (!isSubscribed || !nodeAvatarRef.current) return;

        const head = new TalkingHead(nodeAvatarRef.current, {
          cameraView: "upper",
          cameraDistance: 0.68,
          cameraY: 0.04,
          lipsyncModules: ["en"],
          lipsyncLang: "en",
          avatarMood: mood,
          avatarIdleEyeContact: 0.9,
          avatarSpeakingEyeContact: 0.95,
          modelFPS: 60,
        });

        await head.showAvatar({
          url: "/avatars/brunette.glb",
          body: "F",
          avatarMood: mood,
          avatarIgnoreCamera: false,
        });

        if (!isSubscribed) {
          head.dispose?.();
          return;
        }

        headRef.current = head;
        if (head.audioCtx?.state === "suspended") {
          head.audioCtx.resume().catch(() => {});
        }
        setReady(true);
        console.log("[TalkingChatbot] 3D Avatar loaded ✓");
      } catch (err) {
        console.error("[TalkingChatbot] Initialization error:", err);
        setReady(true);
      }
    };

    init();

    return () => {
      isSubscribed = false;
      stopSpeaking();
      try {
        headRef.current?.dispose?.();
      } catch {}
      headRef.current = null;
    };
  }, []);

  // Speak function: mouth animation starts the instant audio starts (via onstart)
  const speak = (text: string) => {
    const clean = text
      .replace(/[*_`#]/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!clean || isMutedRef.current || !headRef.current) {
      stopSpeaking();
      return;
    }

    // Deduplicate: Don't repeat if already spoken
    if (lastSpokenRef.current === clean) return;
    lastSpokenRef.current = clean;

    onSubtitle?.(clean);
    stopSpeaking();

    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    const speechRate = 0.94;
    const wtimes: number[] = [];
    const wdurations: number[] = [];
    let currentTime = 0; // Start at 0ms — mouth opens on the very first word

    words.forEach((w) => {
      const charCount = Math.max(3, w.length);
      const estDur = Math.max(240, charCount * 78) / speechRate;
      wtimes.push(currentTime);
      wdurations.push(estDur);
      currentTime += estDur + (32 / speechRate);
    });

    const totalDurationMs = currentTime + 300;

    // Pre-build the AudioBuffer so it's ready when onstart fires
    let audioBuffer: AudioBuffer | null = null;
    try {
      const audioCtx =
        headRef.current.audioCtx ||
        new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      const sampleRate = audioCtx.sampleRate || 44100;
      const totalSamples = Math.ceil((totalDurationMs / 1000) * sampleRate);
      audioBuffer = audioCtx.createBuffer(1, totalSamples, sampleRate);
    } catch (err) {
      console.warn("[TalkingChatbot] AudioBuffer build:", err);
    }

    // Start browser TTS — trigger speakAudio the instant audio actually begins
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(clean);
      _activeUtterances.add(u);
      u.rate = speechRate;
      u.pitch = 1.04;
      u.volume = isMutedRef.current ? 0 : 1;

      const voice = getBestVoice();
      if (voice) u.voice = voice;

      u.onstart = () => {
        // Audio has begun — sync mouth animation to this exact moment
        if (audioBuffer && headRef.current && !isMutedRef.current) {
          try {
            headRef.current.speakAudio(
              {
                audio: audioBuffer,
                words,
                wtimes,
                wdurations,
              },
              { lipsyncLang: "en" }
            );
          } catch (err) {
            console.warn("[TalkingChatbot] speakAudio:", err);
          }
        }
      };

      u.onend = () => _activeUtterances.delete(u);
      u.onerror = () => _activeUtterances.delete(u);

      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(u);
      } catch (err) {
        console.error("[TalkingChatbot] TTS error:", err);
      }
    }
  };

  // Only speak when prop text changes and is non-empty
  useEffect(() => {
    if (ready && effectiveText && !isMuted) {
      speak(effectiveText);
    }
  }, [ready, effectiveText]);

  useEffect(() => {
    const handleSpeakEvent = (e: any) => {
      const { text } = e.detail || {};
      if (text && !isMutedRef.current) {
        speak(text);
      }
    };

    const handleStopEvent = () => {
      stopSpeaking();
    };

    window.addEventListener("vive-speak", handleSpeakEvent);
    window.addEventListener("vive-stop-speech", handleStopEvent);

    return () => {
      window.removeEventListener("vive-speak", handleSpeakEvent);
      window.removeEventListener("vive-stop-speech", handleStopEvent);
      stopSpeaking();
    };
  }, []);

  return (
    <div
      className="w-full h-full min-h-[200px] overflow-hidden bg-transparent relative flex items-center justify-center"
      role="img"
      aria-label="Vive AI 3D talking avatar with hands"
    >
      <div ref={nodeAvatarRef} className="w-full h-full absolute inset-0" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-slate-400 text-center px-4 animate-pulse">
          Loading 3D Tutor...
        </div>
      )}

      {ready && !audioUnlockedState && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs cursor-pointer"
          onClick={unlock}
        >
          <div
            className="px-4 py-2 rounded-full shadow-lg border border-white/20 animate-bounce flex items-center gap-2 text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, #4A8FE7, #1B4080)" }}
          >
            <Volume2 className="w-4 h-4" />
            Enable Audio
          </div>
        </div>
      )}
    </div>
  );
});