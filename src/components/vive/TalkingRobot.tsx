import { useEffect, useState } from "react";

export function TalkingRobot({ speaking = false, size = 200 }: { speaking?: boolean; size?: number }) {
  const [isSpeaking, setIsSpeaking] = useState(speaking);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const interval = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking || speaking);
    }, 100);
    return () => clearInterval(interval);
  }, [speaking]);

  return (
    <svg viewBox="0 0 200 220" width={size} height={size}>
      {/* Antennas */}
      <line x1="75" y1="30" x2="70" y2="10" stroke="hsl(215 80% 35%)" strokeWidth="3" strokeLinecap="round" />
      <line x1="125" y1="30" x2="130" y2="10" stroke="hsl(215 80% 35%)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="70" cy="8" r="4" fill="hsl(215 80% 35%)" />
      <circle cx="130" cy="8" r="4" fill="hsl(215 80% 35%)" />
      {/* Head */}
      <rect x="50" y="30" width="100" height="80" rx="20" fill="white" stroke="hsl(215 80% 35%)" strokeWidth="4" />
      {/* Eyes */}
      <g className="animate-blink" style={{ transformOrigin: "100px 65px" }}>
        <circle cx="80" cy="65" r="6" fill="hsl(215 80% 30%)" />
        <circle cx="120" cy="65" r="6" fill="hsl(215 80% 30%)" />
      </g>
      {/* Mouth */}
      {isSpeaking ? (
        <ellipse cx="100" cy="90" rx="14" ry="7" fill="hsl(215 80% 30%)" className="animate-talk" style={{ transformOrigin: "100px 90px" }} />
      ) : (
        <path d="M 85 90 Q 100 100 115 90" stroke="hsl(215 80% 30%)" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {/* Book */}
      <path d="M 40 130 L 100 120 L 160 130 L 160 200 L 100 195 L 40 200 Z" fill="hsl(215 75% 45%)" stroke="hsl(215 80% 30%)" strokeWidth="3" />
      <line x1="100" y1="120" x2="100" y2="195" stroke="white" strokeWidth="2" />
      {/* Hands */}
      <circle cx="38" cy="155" r="10" fill="white" stroke="hsl(215 80% 35%)" strokeWidth="3" />
      <circle cx="162" cy="155" r="10" fill="white" stroke="hsl(215 80% 35%)" strokeWidth="3" />
    </svg>
  );
}