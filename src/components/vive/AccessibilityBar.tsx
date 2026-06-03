/**
 * AccessibilityBar.tsx
 *
 * Updated version — the "AI Voice" toggle now controls whether the avatar
 * speaks (via the isMuted prop on TalkingChatbot), rather than running a
 * parallel browser speechSynthesis that would clash with TalkingHead audio.
 *
 * The page-announcement TTS (reads out the route name on navigation) still
 * uses the browser's speechSynthesis, but it cancels before speaking so it
 * never overlaps with the avatar.
 *
 * Place this file at:  src/components/AccessibilityBar.tsx
 *
 * IMPORTANT: The AccessibilityBar no longer controls avatar speech directly.
 * Instead it exposes a boolean via the AvatarMuteContext so TalkingChatbot
 * can read it. Wrap your StudentLayout (or App root) with
 * <AvatarMuteProvider> and pass isMuted={useAvatarMuted()} to TalkingChatbot.
 */

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Eye, Volume2, Moon, Sun } from "lucide-react";

// ── Avatar mute context ────────────────────────────────────────────────────
// This lets the AccessibilityBar's "AI Voice" toggle propagate to
// TalkingChatbot without prop-drilling through every layout level.

interface AvatarMuteContextValue {
  avatarMuted: boolean;
  setAvatarMuted: (v: boolean) => void;
}

const AvatarMuteContext = createContext<AvatarMuteContextValue>({
  avatarMuted: false,
  setAvatarMuted: () => {},
});

export function AvatarMuteProvider({ children }: { children: ReactNode }) {
  const [avatarMuted, setAvatarMuted] = useState(false);
  return (
    <AvatarMuteContext.Provider value={{ avatarMuted, setAvatarMuted }}>
      {children}
    </AvatarMuteContext.Provider>
  );
}

/** Use this hook in TalkingChatbot: const { avatarMuted } = useAvatarMuted() */
export function useAvatarMuted() {
  return useContext(AvatarMuteContext);
}

// ── AccessibilityBar component ─────────────────────────────────────────────

export function AccessibilityBar() {
  const [open, setOpen] = useState(false);
  const [dyslexic, setDyslexic] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  // "AI Voice" now means: should the avatar speak?
  // We read/write from the shared context so TalkingChatbot can observe it.
  const { avatarMuted, setAvatarMuted } = useAvatarMuted();
  const aiVoiceEnabled = !avatarMuted;

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("vive-theme") as "light" | "dark") || "dark";
    }
    return "dark";
  });

  const path = useRouterState({ select: (s) => s.location.pathname });

  // Apply DOM-level accessibility settings
  useEffect(() => {
    document.documentElement.classList.toggle("font-dyslexic", dyslexic);
    document.documentElement.classList.toggle("high-contrast", contrast);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.fontSize = `${fontScale * 16}px`;
    localStorage.setItem("vive-theme", theme);
  }, [dyslexic, contrast, fontScale, theme]);

  // Removed page announcements as requested

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div
          className="mb-3 rounded-3xl p-5 space-y-3 w-64 animate-pop-in"
          style={{
            background: "rgba(255,255,255,0.95)",
            border: "3px solid rgba(255,255,255,0.9)",
            boxShadow: "0 12px 40px rgba(74,144,217,0.25)",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          <h3 className="font-black text-sm flex items-center gap-2 text-[#1A3A5C]">
            <Eye className="h-4 w-4 text-[#4A90D9]" /> Accessibility
          </h3>

          {/* Dyslexic font */}
          <label className="flex items-center justify-between text-sm font-bold text-[#1A3A5C]">
            <span>Dyslexic font</span>
            <input
              type="checkbox"
              checked={dyslexic}
              onChange={(e) => setDyslexic(e.target.checked)}
            />
          </label>

          {/* AI Voice — now controls avatar mute, not browser TTS for answers */}
          <label className="flex items-center justify-between text-sm font-bold text-[#1A3A5C]">
            <span className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-[#4A90D9]" /> AI Voice
            </span>
            <input
              type="checkbox"
              checked={aiVoiceEnabled}
              onChange={(e) => setAvatarMuted(!e.target.checked)}
            />
          </label>

          {/* High contrast */}
          <label className="flex items-center justify-between text-sm font-bold text-[#1A3A5C]">
            <span>High contrast</span>
            <input
              type="checkbox"
              checked={contrast}
              onChange={(e) => setContrast(e.target.checked)}
            />
          </label>

          {/* Theme toggle */}
          <div className="flex items-center justify-between text-sm font-bold text-[#1A3A5C] pt-1">
            <span>Theme</span>
            <div className="flex rounded-xl p-1" style={{ background: "rgba(74,144,217,0.1)" }}>
              <button
                onClick={() => setTheme("light")}
                aria-label="Light mode"
                className={`p-1.5 rounded-lg transition-all ${
                  theme === "light" ? "bg-white shadow text-[#4A90D9]" : "text-[#4A6A8A]"
                }`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                aria-label="Dark mode"
                className={`p-1.5 rounded-lg transition-all ${
                  theme === "dark" ? "bg-white shadow text-[#4A90D9]" : "text-[#4A6A8A]"
                }`}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Font size */}
          <div>
            <div className="flex justify-between text-sm font-bold text-[#1A3A5C] mb-1">
              <span>Font size</span>
              <span className="text-[#4A90D9]">{Math.round(fontScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.4"
              step="0.05"
              value={fontScale}
              onChange={(e) => setFontScale(Number(e.target.value))}
              className="w-full accent-[#4A90D9]"
            />
          </div>
        </div>
      )}

      {/* FAB trigger */}
      <button
        onClick={() => setOpen(!open)}
        id="btn-accessibility"
        aria-label="Accessibility settings"
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #4A90D9, #2D6DB5)",
          boxShadow: "0 6px 0 #1A4E8A, 0 8px 20px rgba(74,144,217,0.4)",
          color: "white",
        }}
      >
        <Eye className="h-5 w-5" />
      </button>
    </div>
  );
}