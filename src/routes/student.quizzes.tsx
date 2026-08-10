import { createFileRoute } from "@tanstack/react-router";
import { Zap, Trophy, Star, TrendingUp, BarChart3, Award, Target } from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/student/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — Vive AI" }] }),
  component: Quizzes,
});

const QUIZ_STATS = [
  { label: "Quizzes Taken", val: "24", icon: Star, color: "#6366F1", bg: "rgba(99,102,241,0.15)" },
  { label: "Avg. Score", val: "88%", icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  { label: "Badges", val: "12", icon: Award, color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
];

const AVAILABLE_QUIZZES: any[] = [];

const MASTERY_SKILLS = [
  { label: "Logic", val: 92, color: "#6366F1" },
  { label: "Memory", val: 78, color: "#8B5CF6" },
  { label: "Speed", val: 84, color: "#F59E0B" },
  { label: "Accuracy", val: 96, color: "#10B981" },
];

function Quizzes() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in main-content-padding">

      {/* ── HEADER CARD ── */}
      <div className="pro-card glass-panel p-6 flex flex-col md:flex-row items-start md:items-center gap-5 relative overflow-hidden hover-glow">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-[60px] animate-pulse-glow" />
        <div className="w-16 h-16 shrink-0 relative z-10">
          <RiveAnimation src="/riv-animations/12132-34408-introvert-rock-star.riv" className="w-full h-full" />
        </div>
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Assessment Hub</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: textPrimary }}>Challenge Zone</h1>
          <p className="text-sm font-medium mt-0.5" style={{ color: textMuted }}>Test your knowledge and climb the leaderboard!</p>
        </div>

        {/* Stat chips */}
        <div className="flex items-center gap-3 relative z-10">
          {QUIZ_STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center p-3 rounded-2xl min-w-[72px]"
              style={{ background: s.bg, border: `1px solid ${s.color}30` }}
            >
              <s.icon className="w-4 h-4 mb-1.5" style={{ color: s.color }} />
              <span className="text-lg font-black" style={{ color: textPrimary }}>{s.val}</span>
              <span className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: textMuted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO CHALLENGE CARD ── */}
      <div className="pro-card glass-panel p-8 relative overflow-hidden hover-glow">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <RiveAnimation src="/riv-animations/4731-9566-star-game-beta.riv" className="w-full h-full" />
        </div>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-[60px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-36 h-36 shrink-0">
            <RiveAnimation src="/riv-animations/27237-51432-click-to-level-up.riv" className="w-full h-full" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-black"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "2px solid rgba(16,185,129,0.3)" }}
            >
              🏆 Next Milestone
            </div>
            <h2 className="text-2xl font-black" style={{ color: textPrimary }}>Weekly Champion Challenge</h2>
            <p className="text-sm font-semibold leading-relaxed max-w-xl" style={{ color: textMuted }}>
              Compete with students across the country in this week's Biology & Tech fusion quiz.
              Top 10 finishers receive the <span className="font-black" style={{ color: "#F59E0B" }}>Neon Spark</span> exclusive badge!
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                className="pro-btn pro-btn-primary px-8 py-3 text-sm font-black flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, var(--primary), #6366F1)", boxShadow: "0 4px 20px rgba(79,70,229,0.4)" }}
              >
                Begin Challenge <Zap className="w-4 h-4" />
              </button>
              <button
                className="px-6 py-3 text-sm font-black rounded-xl transition-all"
                style={{ background: "var(--muted)", color: textPrimary, border: "1px solid var(--border)" }}
              >
                View Rules
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* ── QUIZ LIST ── */}
        <div className="space-y-4">
          <h3 className="text-base font-black flex items-center gap-2" style={{ color: textPrimary }}>
            <Zap className="w-4 h-4" style={{ color: "var(--primary)" }} />
            Available Assessments
          </h3>

          {AVAILABLE_QUIZZES.length > 0 ? AVAILABLE_QUIZZES.map((q) => (
            <div key={q.id} className="pro-card pro-card-hover glass-panel p-5">
              <p className="font-black" style={{ color: textPrimary }}>{q.title}</p>
            </div>
          )) : (
            <div className="pro-card glass-panel p-10 text-center">
              <div className="w-44 h-36 mx-auto">
                <RiveAnimation src="/riv-animations/27328-51630-loading-books.riv" className="w-full h-full" />
              </div>
              <h3 className="text-base font-black mt-2" style={{ color: textPrimary }}>No quizzes assigned yet</h3>
              <p className="text-sm font-medium max-w-xs mx-auto mt-1" style={{ color: textMuted }}>
                Your teacher will assign quizzes when they're ready. Keep studying!
              </p>
            </div>
          )}
        </div>

        {/* ── MASTERY SIDEBAR ── */}
        <div className="space-y-4">
          <div className="pro-card glass-panel p-6 space-y-4 hover-glow relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-[30px]" />
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-base font-black flex items-center gap-2" style={{ color: textPrimary }}>
                <Target className="w-4 h-4" style={{ color: "var(--primary)" }} />
                Your Mastery
              </h3>
              <BarChart3 className="w-4 h-4 opacity-40" style={{ color: "var(--primary)" }} />
            </div>
            <div className="space-y-4 relative z-10">
              {MASTERY_SKILLS.map((m) => (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black">
                    <span style={{ color: textPrimary }}>{m.label}</span>
                    <span style={{ color: m.color }}>{m.val}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${m.val}%`,
                        background: `linear-gradient(90deg, ${m.color}, ${m.color}AA)`,
                        boxShadow: `0 0 8px ${m.color}66`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 relative z-10" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs font-bold text-center" style={{ color: textMuted }}>
                You're in the <span className="font-black" style={{ color: "var(--primary)" }}>Top 5%</span> in Rwanda this month! 🎉
              </p>
            </div>
          </div>

          {/* Next milestone */}
          <div className="pro-card glass-panel p-5 relative overflow-hidden hover-glow" style={{ background: "rgba(16,185,129,0.05)" }}>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10">
              <RiveAnimation src="/riv-animations/22180-41567-level-up-badges-animation.riv" className="w-full h-full" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10B981" }} />
              <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: "#10B981" }}>Next Milestone</h4>
            </div>
            <p className="text-sm font-bold mb-3" style={{ color: textPrimary }}>
              Unlock "Grand Master" by completing 3 hard science quizzes.
            </p>
            <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: textMuted }}>
              <span>Progress</span>
              <span style={{ color: "#10B981" }}>2/3 complete</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: "66%", background: "linear-gradient(90deg, #10B981, #059669)", boxShadow: "0 0 8px rgba(16,185,129,0.4)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
