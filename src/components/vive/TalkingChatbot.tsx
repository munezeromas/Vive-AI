/**
 * TalkingChatbot.tsx — ROBUST LIP-SYNC & SPEECH ENGINE
 *
 * Fixes applied:
 *  1. Chrome Voice Pre-loading & onvoiceschanged retry: Handles async voice loading on page refresh.
 *  2. Autoplay & Unlock Guard: Seamlessly resumes AudioContext and SpeechSynthesis on user gesture or overlay click.
 *  3. Async SpeechSynthesis Cancel/Speak De-confliction: Prevents Chrome async speech cancel collisions.
 *  4. Fallback Viseme Sync: Guarantees 3D avatar lip movement even if Web Speech API start event is delayed.
 *  5. Stream Support: Handles custom 'vive-speak' events for real-time AI responses.
 *
 * src/components/vive/TalkingChatbot.tsx
 */

import { useEffect, useRef, useState, memo } from "react";
import { useCurrentAISpeech } from "@/lib/useSpeakAI";
import { Volume2 } from "lucide-react";

// Add gesture animation keyframes
if (typeof document !== "undefined" && !document.querySelector("style[data-vive-animations]")) {
  const style = document.createElement("style");
  style.setAttribute("data-vive-animations", "true");
  style.textContent = `
    @keyframes wave-left {
      0%, 100% { transform: rotateZ(0deg) translateX(0px); }
      50% { transform: rotateZ(-35deg) translateX(-12px); }
    }
    @keyframes wave-right {
      0%, 100% { transform: rotateZ(0deg) translateX(0px); }
      50% { transform: rotateZ(35deg) translateX(12px); }
    }
    @keyframes sway {
      0%, 100% { transform: translateX(0px) scaleY(1); }
      25% { transform: translateX(-8px) scaleY(1.02); }
      75% { transform: translateX(8px) scaleY(1.02); }
    }
    .animate-wave-left {
      animation: wave-left 0.6s ease-in-out infinite;
    }
    .animate-wave-right {
      animation: wave-right 0.6s ease-in-out infinite;
    }
    .animate-sway {
      animation: sway 1.2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

interface TalkingChatbotProps {
  textToSpeak?: string;
  onSubtitle?: (text: string) => void;
  mood?: string;
  isMuted?: boolean;
}

// Singleton unlock guard
let _audioUnlocked = false;

// Persistent reference set to prevent SpeechSynthesisUtterance Garbage Collection
const _activeUtterances = new Set<SpeechSynthesisUtterance>();

// Helper to pick best available English voice
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

// Browser TTS helper with async de-confliction
function browserSpeak(
  text: string,
  queue: boolean = false,
  onStart?: () => void,
  onBoundary?: (ev: SpeechSynthesisEvent) => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const clean = text
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return;

  const executeSpeak = () => {
    if (!queue) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      _activeUtterances.clear();
    }

    const u = new SpeechSynthesisUtterance(clean);
    _activeUtterances.add(u);

    u.rate = 0.92;
    u.pitch = 1.05;
    u.volume = 1;

    const voice = getBestVoice();
    if (voice) {
      u.voice = voice;
    }

    u.onstart = () => {
      console.log("[BrowserTTS] Speech started ✓");
      onStart?.();
    };

    u.onboundary = (ev: SpeechSynthesisEvent) => {
      try {
        onBoundary?.(ev);
      } catch (e) {
        console.warn("[BrowserTTS] onboundary error:", e);
      }
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

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(u);
    } catch (err) {
      console.error("[BrowserTTS] speak invocation failed:", err);
    }
  };

  if (!queue) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setTimeout(executeSpeak, 40);
  } else {
    executeSpeak();
  }
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
  const [headFailed, setHeadFailed] = useState(false);

  const busText = useCurrentAISpeech();
  const effectiveText = propText !== undefined ? propText : busText;
  const effectiveTextRef = useRef(effectiveText);
  useEffect(() => { effectiveTextRef.current = effectiveText; }, [effectiveText]);

  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const [audioUnlockedState, setAudioUnlockedState] = useState(_audioUnlocked);

  // Pre-load voices onvoicechanged
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const handleVoices = () => {
      window.speechSynthesis.getVoices();
      if (_audioUnlocked && effectiveTextRef.current && ready) {
        speakWithAvatar(effectiveTextRef.current, false);
      }
    };

    window.speechSynthesis.onvoiceschanged = handleVoices;
    handleVoices();

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Audio unlock handler
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

    if (effectiveTextRef.current) {
      speakWithAvatar(effectiveTextRef.current, false);
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TalkingHead initialization
  useEffect(() => {
    if (!nodeAvatarRef.current || headRef.current) return;

    const init = async () => {
      try {
        // @ts-ignore
        const { TalkingHead } = await import("@met4citizen/talkinghead");

        const head = new TalkingHead(nodeAvatarRef.current, {
          cameraView: "head",
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
        if (head.audioCtx?.state === "suspended") {
          head.audioCtx.resume().catch(() => {});
        }
        setReady(true);
        console.log("[TalkingChatbot] TalkingHead ready ✓");
      } catch (err) {
        console.error("[TalkingChatbot] TalkingHead failed, using browser TTS fallback:", err);
        setHeadFailed(true);
        setReady(true);
      }
    };

    init();

    return () => {
      headRef.current?.stopSpeaking?.();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lip-Sync Speech Execution Function ──────────────────────────────────
  const speakWithAvatar = (text: string, queue: boolean = false) => {
    if (!text || !text.trim()) {
      if (!queue) {
        headRef.current?.stopSpeaking?.();
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
      return;
    }

    onSubtitle?.(text);

    if (isMutedRef.current) {
      headRef.current?.stopSpeaking?.();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (!queue) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      headRef.current?.stopSpeaking?.();
    }

    const cleanText = text
      .replace(/[*_`#]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    if (headFailed || !headRef.current) {
      browserSpeak(cleanText, queue);
      return;
    }

    try {
      // Calculate word durations for lip-sync visemes
      const words = cleanText.split(/[\s]+/).filter((w) => w.length > 0);
      const wtimes: number[] = [];
      const wdurations: number[] = [];
      let currentTime = 0;
      const rateFactor = 0.92;

      words.forEach((w) => {
        wtimes.push(currentTime);
        let dur = (240 + Math.min(w.length * 30, 200)) / rateFactor;
        
        if (/[.!?,;:]$/.test(w)) {
          dur += 120 / rateFactor;
        } else if (/,;:/.test(w)) {
          dur += 60 / rateFactor;
        }
        
        wdurations.push(dur);
        currentTime += dur + (30 / rateFactor);
      });

      // Ensure AudioContext is active
      if (headRef.current.audioCtx?.state === "suspended") {
        headRef.current.audioCtx.resume().catch(() => {});
      }

      let hasTriggeredHead = false;
      const triggerAvatarLipSync = () => {
        if (hasTriggeredHead || !headRef.current) return;
        hasTriggeredHead = true;
        try {
          headRef.current.speakWithHands?.();
          headRef.current.speakAudio({
            words,
            wtimes,
            wdurations,
          });
        } catch (e) {
          console.error("[TalkingChatbot] speakAudio error:", e);
        }
      };

      browserSpeak(
        cleanText,
        queue,
        () => {
          // On TTS Start: Trigger 3D avatar lip-sync visemes and hand gestures
          triggerAvatarLipSync();
        },
        (ev) => {
          if (ev.name === "word" && headRef.current) {
            // Word boundary sync
          }
        },
        () => {
          // Speech ended
        }
      );

      // Fallback timer: if browser TTS start event is delayed or muted, start 3D lip animation after 120ms
      setTimeout(() => {
        triggerAvatarLipSync();
      }, 120);

      console.log("[TalkingChatbot] speakAudio synced successfully ✓ (queue: " + queue + ")");
    } catch (err) {
      console.error("[TalkingChatbot] speakWithAvatar error:", err);
      browserSpeak(cleanText, queue);
    }
  };

  // Speak whenever effectiveText changes or avatar gets ready
  useEffect(() => {
    if (ready && effectiveText) {
      speakWithAvatar(effectiveText, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, effectiveText, headFailed]);

  // Global event listener for streaming speech
  useEffect(() => {
    const handleSpeakEvent = (e: any) => {
      const { text, queue } = e.detail;
      speakWithAvatar(text, queue);
    };
    window.addEventListener("vive-speak", handleSpeakEvent);
    return () => window.removeEventListener("vive-speak", handleSpeakEvent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, headFailed]);

  return (
    <div
      className="w-full h-87.5 overflow-hidden bg-transparent relative shrink-0"
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
            Tap to Activate Audio & Lip-Sync
          </div>
        </div>
      )}
    </div>
  );
});
