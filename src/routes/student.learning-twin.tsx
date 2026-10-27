import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme-context";
import {
  Brain, Sparkles, TrendingUp, Target, Award, Compass,
  BookOpen, Clock, Activity, CheckCircle, ArrowRight, Zap
} from "lucide-react";

export const Route = createFileRoute("/student/learning-twin")({
  head: () => ({ meta: [{ title: "AI Learning Twin — Vive AI" }] }),
  component: LearningTwinPage,
});

const COGNITIVE_TRAITS = [
  { name: "Visual Processing", score: 88, desc: "Learns best with diagrams & visual demonstrations" },
  { name: "Step-by-Step Logic", score: 92, desc: "Strong sequential reasoning & structure breakdown" },
  { name: "Concept Retention", score: 85, desc: "High 14-day memory curve on practiced concepts" },
  { name: "Curiosity Factor", score: 95, desc: "Actively explores related subjects beyond curriculum" },
];

const SKILL_MAP = [
  { subject: "Mathematics", level: "P6 Advanced", mastery: 84, focus: "Fractions & Decimals", status: "Mastering" },
  { subject: "English Language", level: "P6 Proficient", mastery: 89, focus: "Creative Writing & Syntax", status: "Excelling" },
  { subject: "General Science", level: "P6 Developing", mastery: 72, focus: "Ecosystems & Photosynthesis", status: "Support Recommended" },
  { subject: "Social Studies", level: "P6 Proficient", mastery: 81, focus: "East Africa Geography", status: "On Track" },
];

function LearningTwinPage() {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const displayName = user?.name || "Student";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#EEF4FF" : "#0A1628";
  const textMuted = isDark ? "#7A9AC0" : "#536B8A";

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in main-content-padding">
      {/* ── HERO BANNER ── */}
      <div
        className="rich-gradient-hero rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 rounded-full bg-white/10 filter blur-[60px] animate-pulse-glow" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black backdrop-blur-md">
              <Brain className="w-4 h-4 text-[#93C5FD]" />
              <span>Adaptive Intelligence Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              {displayName}&apos;s <span className="text-[#93C5FD]">AI Learning Twin</span>
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Your Learning Twin models how your brain grasps concepts, tracks your mastery curve, and dynamically tailors lessons to match your ideal pace.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-4 shrink-0">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#D4952A]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Twin Sync Level</p>
              <p className="text-2xl font-black">94% Active</p>
              <p className="text-[11px] text-[#93C5FD]">1,420 cognitive points mapped</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TWIN ADAPTATION INSIGHTS ── */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="pro-card glass-panel hover-glow p-6 space-y-3" style={{ borderTop: "3px solid #4A8FE7" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,143,231,0.12)" }}>
              <Clock className="w-5 h-5 text-[#4A8FE7]" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: textMuted }}>Optimal Focus Window</p>
              <h4 className="text-lg font-black" style={{ color: textPrimary }}>9:00 AM – 11:30 AM</h4>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
            Retention is 32% higher for difficult math problems during morning hours.
          </p>
        </div>

        <div className="pro-card glass-panel hover-glow p-6 space-y-3" style={{ borderTop: "3px solid #0E9F6E" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(14,159,110,0.12)" }}>
              <TrendingUp className="w-5 h-5 text-[#0E9F6E]" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: textMuted }}>Mastery Velocity</p>
              <h4 className="text-lg font-black" style={{ color: textPrimary }}>+1.4x Standard Pace</h4>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
            Rapid concept absorption in English Grammar and Sentence Construction.
          </p>
        </div>

        <div className="pro-card glass-panel hover-glow p-6 space-y-3" style={{ borderTop: "3px solid #D4952A" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,149,42,0.12)" }}>
              <Target className="w-5 h-5 text-[#D4952A]" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: textMuted }}>Adaptive Target</p>
              <h4 className="text-lg font-black" style={{ color: textPrimary }}>Science Review</h4>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
            Reinforcing plant biology with interactive flashcards this afternoon.
          </p>
        </div>
      </div>

      {/* ── COGNITIVE TRAITS & MASTERY MAP ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cognitive Profile */}
        <div className="pro-card glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-[#4A8FE7]" />
              <h3 className="text-lg font-black" style={{ color: textPrimary }}>Cognitive Profile</h3>
            </div>
            <span className="text-xs font-bold text-[#4A8FE7]">Updated today</span>
          </div>

          <div className="space-y-4">
            {COGNITIVE_TRAITS.map((trait) => (
              <div key={trait.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span style={{ color: textPrimary }}>{trait.name}</span>
                  <span className="text-[#4A8FE7]">{trait.score}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${trait.score}%`,
                      background: "linear-gradient(90deg, #4A8FE7, #93C5FD)"
                    }}
                  />
                </div>
                <p className="text-[11px]" style={{ color: textMuted }}>{trait.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Subject Mastery */}
        <div className="pro-card glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#0E9F6E]" />
              <h3 className="text-lg font-black" style={{ color: textPrimary }}>Subject Skill Engine</h3>
            </div>
            <span className="text-xs font-bold text-[#0E9F6E]">AI Calibrated</span>
          </div>

          <div className="space-y-3">
            {SKILL_MAP.map((skill) => (
              <div
                key={skill.subject}
                className="p-3.5 rounded-2xl border transition-all"
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                  borderColor: isDark ? "rgba(74,143,231,0.12)" : "#E2E8F0"
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: textPrimary }}>{skill.subject}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/10 text-[#4A8FE7]">
                      {skill.level}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#0E9F6E]">{skill.mastery}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px]" style={{ color: textMuted }}>
                  <span>Focus: {skill.focus}</span>
                  <span className="font-bold">{skill.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI TWIN RECOMMENDATION CALLOUT ── */}
      <div className="insight-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4952A]" />
            <h3 className="text-xl font-black text-white">Recommended Next Step</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Your Twin recommends a 10-minute session on Fractions with Vive AI to bridge your mastery gap to 90%.
          </p>
        </div>

        <Link
          to="/student/tutor"
          className="px-6 py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 shrink-0"
          style={{ background: "linear-gradient(135deg, #D4952A, #F0B429)", textDecoration: "none" }}
        >
          <span>Launch AI Practice</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
