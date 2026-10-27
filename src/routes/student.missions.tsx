import { createFileRoute, Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme-context";
import {
  BookOpen, FlaskConical, MessageSquare, Code2,
  Lock, ChevronRight, Trophy, Star, Flame, Target
} from "lucide-react";

export const Route = createFileRoute("/student/missions")({
  head: () => ({ meta: [{ title: "Learning Missions — Vive AI" }] }),
  component: MissionsPage,
});

const MISSIONS = [
  {
    id: "math",
    title: "Math Adventure",
    icon: BookOpen,
    color: "#4A8FE7",
    bg: "rgba(74,143,231,0.12)",
    progress: 75,
    xp: 500,
    steps: [
      { name: "Numbers", done: true },
      { name: "Addition", done: true },
      { name: "Subtraction", done: true },
      { name: "Fractions", done: false },
    ],
  },
  {
    id: "science",
    title: "Science Explorer",
    icon: FlaskConical,
    color: "#0E9F6E",
    bg: "rgba(14,159,110,0.12)",
    progress: 45,
    xp: 350,
    steps: [
      { name: "Plants", done: true },
      { name: "Animals", done: true },
      { name: "Environment", done: false },
      { name: "Human Body", done: false },
    ],
  },
  {
    id: "language",
    title: "Language Master",
    icon: MessageSquare,
    color: "#D4952A",
    bg: "rgba(212,149,42,0.12)",
    progress: 60,
    xp: 400,
    steps: [
      { name: "Grammar", done: true },
      { name: "Reading", done: true },
      { name: "Spelling", done: false },
      { name: "Writing", done: false },
    ],
  },
  {
    id: "code",
    title: "Code Quest",
    icon: Code2,
    color: "#1B4080",
    bg: "rgba(27,64,128,0.12)",
    progress: 20,
    xp: 600,
    steps: [
      { name: "Basics", done: true },
      { name: "Variables", done: false },
      { name: "Loops", done: false },
      { name: "Functions", done: false },
    ],
  },
];

function MissionsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#EEF4FF" : "#0A1628";
  const textMuted = isDark ? "#7A9AC0" : "#536B8A";

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in main-content-padding">
      {/* Hero */}
      <div className="rich-gradient-hero rounded-[2rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-[-40%] right-[-10%] w-80 h-80 bg-white/10 rounded-full filter blur-[60px] animate-pulse-glow" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-[#D4952A]" />
            <span className="text-xs font-black uppercase tracking-widest text-white/60">Learning Missions</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight">
            Choose your <span className="text-[#93C5FD]">adventure</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-md">
            Complete missions to earn XP, unlock badges, and level up. Each mission has 4 steps — master them all!
          </p>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {MISSIONS.map((mission) => {
          const Icon = mission.icon;
          const completed = mission.steps.filter(s => s.done).length;
          const total = mission.steps.length;
          const circumference = 2 * Math.PI * 28;
          const offset = circumference - (mission.progress / 100) * circumference;

          return (
            <div key={mission.id} className="mission-card group">
              {/* Top color bar */}
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${mission.color}, transparent)` }} />

              <div className="flex items-start gap-5">
                {/* Progress Ring */}
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="4" />
                    <circle
                      cx="32" cy="32" r="28" fill="none" stroke={mission.color} strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-6 h-6" style={{ color: mission.color }} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black mb-1" style={{ color: textPrimary }}>{mission.title}</h3>
                  <p className="text-xs font-bold mb-3" style={{ color: textMuted }}>{completed} of {total} complete · {mission.xp} XP reward</p>

                  {/* Steps */}
                  <div className="space-y-2">
                    {mission.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: step.done ? mission.color : "transparent",
                            border: step.done ? "none" : `2px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
                          }}
                        >
                          {step.done ? (
                            <Star className="w-3 h-3 text-white" />
                          ) : (
                            <Lock className="w-2.5 h-2.5" style={{ color: textMuted, opacity: 0.5 }} />
                          )}
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: step.done ? textPrimary : textMuted, opacity: step.done ? 1 : 0.6 }}
                        >
                          Mission {i + 1}: {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5 flex items-center justify-between">
                <span className="gold-badge flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {mission.xp} XP
                </span>
                <Link
                  to="/student/tutor"
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: mission.color, textDecoration: "none" }}
                >
                  {completed === total ? "Review" : completed > 0 ? "Continue" : "Start"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
