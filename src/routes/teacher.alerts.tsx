import { createFileRoute } from "@tanstack/react-router";
import { CLASS_STUDENTS } from "@/lib/mock-data";
import { AlertTriangle, ShieldAlert, MessageCircle, Brain, CheckCircle2, Clock, TrendingDown, Zap } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";

export const Route = createFileRoute("/teacher/alerts")({
  head: () => ({ meta: [{ title: "Alerts — Vive AI" }] }),
  component: Alerts,
});

const AI_SUGGESTIONS: Record<string, string> = {
  high: "Schedule a 1:1 reading session and send a parent notification today.",
  medium: "Assign extra practice exercises and check in at the start of next class.",
  low: "Monitor for one more week before taking action.",
};

const INTERVENTION_PLANS: Record<string, string[]> = {
  high: ["1:1 tutoring session", "Parent notification", "Dyslexia-friendly notes", "Daily check-in"],
  medium: ["Extra practice pack", "Peer study buddy", "Weekly progress review"],
  low: ["Monitor progress", "Encourage participation"],
};

function RiskBadge({ risk }: { risk: string }) {
  const config = {
    high: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", label: "High Risk", icon: ShieldAlert },
    medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Medium Risk", icon: AlertTriangle },
    low: { color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "On Track", icon: CheckCircle2 },
  }[risk] ?? { color: "#94A3B8", bg: "rgba(148,163,184,0.12)", label: risk, icon: CheckCircle2 };
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
}

function Alerts() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0";

  const atRisk = CLASS_STUDENTS.filter(s => s.risk !== "low");
  const high = atRisk.filter(s => s.risk === "high");
  const medium = atRisk.filter(s => s.risk === "medium");

  const [expanded, setExpanded] = useState<number | null>(null);
  const [messaged, setMessaged] = useState<Set<number>>(new Set());

  const handleMessage = (id: number) => {
    setMessaged(prev => new Set([...prev, id]));
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in main-content-padding">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 shadow-xl hover-glow"
        style={{ background: "linear-gradient(135deg, #DC2626, #EF4444, #F87171)", minHeight: "200px" }}>
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full filter blur-[80px] animate-pulse-glow" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full filter blur-[40px]" />

        <div className="relative z-10 flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black backdrop-blur-md">
            <ShieldAlert className="w-4 h-4" /> Learner Alerts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Struggling Learner <br /><span className="text-yellow-300">Alerts</span>
          </h1>
          <p className="text-white/80 font-medium text-sm max-w-md">
            {atRisk.length} students need your attention. AI-powered recommendations are ready for each learner.
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0 flex gap-6 shrink-0">
          {[{ label: "High Risk", val: high.length, color: "#FCA5A5" }, { label: "Medium Risk", val: medium.length, color: "#FCD34D" }].map(s => (
            <div key={s.label} className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-white/70 text-xs font-black uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total At-Risk", value: atRisk.length, icon: AlertTriangle, color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
          { label: "Avg Mastery", value: `${Math.round(atRisk.reduce((s, x) => s + x.mastery, 0) / (atRisk.length || 1))}%`, icon: TrendingDown, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
          { label: "Need Immediate Help", value: high.length, icon: Zap, color: "#DC2626", bg: "rgba(220,38,38,0.12)" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="pro-card glass-panel hover-glow p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <Icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: textMuted }}>{s.label}</p>
                  <p className="text-3xl font-black" style={{ color: textPrimary }}>{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ALERT CARDS ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-black" style={{ color: textPrimary }}>Students Needing Support</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20">
            {atRisk.length} alerts
          </span>
        </div>

        {atRisk.map((s) => (
          <div
            key={s.id}
            className="pro-card glass-panel hover-glow relative overflow-hidden transition-all duration-300"
            style={{ borderLeft: `4px solid ${s.risk === "high" ? "#EF4444" : "#F59E0B"}` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[40px] opacity-20"
              style={{ background: s.risk === "high" ? "#EF4444" : "#F59E0B" }} />

            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left: student info */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shrink-0 shadow-md"
                    style={{ background: s.risk === "high" ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#F59E0B,#D97706)" }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-base" style={{ color: textPrimary }}>{s.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <RiskBadge risk={s.risk} />
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                        <Clock className="w-3 h-3" /> Last active: {s.lastActive}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleMessage(s.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: messaged.has(s.id) ? "rgba(16,185,129,0.15)" : "rgba(37,99,235,0.1)",
                      color: messaged.has(s.id) ? "#10B981" : "#5BA0E3",
                      border: `1px solid ${messaged.has(s.id) ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`,
                    }}
                  >
                    {messaged.has(s.id) ? <CheckCircle2 className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                    {messaged.has(s.id) ? "Messaged" : "Reach Out"}
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95"
                    style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.3)" }}
                  >
                    <Brain className="w-4 h-4" />
                    {expanded === s.id ? "Hide Plan" : "AI Plan"}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: textMuted }}>Mastery</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.mastery}%`,
                      background: s.mastery < 50 ? "linear-gradient(90deg,#EF4444,#F87171)" : "linear-gradient(90deg,#F59E0B,#FCD34D)"
                    }}
                  />
                </div>
                <span className="text-sm font-black shrink-0" style={{ color: s.mastery < 50 ? "#EF4444" : "#F59E0B" }}>{s.mastery}%</span>
              </div>

              {/* AI Suggestion */}
              <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: isDark ? "rgba(139,92,246,0.06)" : "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <Brain className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#8B5CF6" }} />
                <p className="text-xs font-semibold leading-relaxed" style={{ color: textMuted }}>
                  <span className="font-black" style={{ color: "#8B5CF6" }}>Vive AI: </span>
                  {s.dyslexia ? "Enable dyslexia-friendly notes + 1:1 reading support." : AI_SUGGESTIONS[s.risk] ?? "Monitor progress closely."}
                </p>
              </div>

              {/* Expanded intervention plan */}
              {expanded === s.id && (
                <div className="mt-4 p-4 rounded-2xl animate-fade-in"
                  style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${cardBorder}` }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>
                    🎯 Intervention Plan
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {INTERVENTION_PLANS[s.risk]?.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold" style={{ color: textMuted }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                          style={{ background: "#8B5CF6" }}>{i + 1}</div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {atRisk.length === 0 && (
          <div className="pro-card glass-panel p-16 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-black mb-2" style={{ color: textPrimary }}>All students are on track!</h3>
            <p className="text-sm font-medium" style={{ color: textMuted }}>No alerts at this time. Keep up the great teaching!</p>
          </div>
        )}
      </div>
    </div>
  );
}

