import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme-context";
import {
  Bot, Sparkles, Clock, CheckCircle, TrendingUp, Flame,
  AlertTriangle, BookOpen, Trophy, Award, FileText, UserPlus,
  ChevronRight, Brain, ArrowUpRight
} from "lucide-react";

export const Route = createFileRoute("/parent/")({
  head: () => ({ meta: [{ title: "Parent Portal — Vive AI" }] }),
  component: ParentDashboard,
});

const STATS = [
  { label: "Time Studied", value: "5.5 Hours", icon: Clock, color: "#D4952A", bg: "rgba(212,149,42,0.12)" },
  { label: "Assignments", value: "8 Completed", icon: CheckCircle, color: "#0E9F6E", bg: "rgba(14,159,110,0.12)" },
  { label: "Current Average", value: "84%", icon: TrendingUp, color: "#4A8FE7", bg: "rgba(74,143,231,0.12)" },
  { label: "Learning Streak", value: "12 Days", icon: Flame, color: "#E02424", bg: "rgba(224,36,36,0.12)" },
];

const SUBJECTS = [
  { name: "Reading & English", score: 89, color: "#0E9F6E", status: "Excelling" },
  { name: "Mathematics", score: 78, color: "#4A8FE7", status: "Good Progress" },
  { name: "Social Studies", score: 81, color: "#1B4080", status: "On Track" },
  { name: "General Science", score: 62, color: "#D4952A", status: "Needs Support" },
];

const ACTIVITIES = [
  { id: 1, text: "Completed Math Quiz with 92% score", time: "Today, 10:30 AM", icon: Trophy, color: "#D4952A" },
  { id: 2, text: "Finished Science Explorer Mission 2", time: "Yesterday", icon: BookOpen, color: "#0E9F6E" },
  { id: 3, text: "Earned 7-Day Consistency Badge", time: "2 days ago", icon: Award, color: "#4A8FE7" },
  { id: 4, text: "Submitted English Essay on Community", time: "3 days ago", icon: FileText, color: "#1B4080" },
];

function ParentDashboard() {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const displayName = user?.name || "Parent";

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#EEF4FF" : "#0A1628";
  const textMuted = isDark ? "#7A9AC0" : "#536B8A";

  const [studentCode, setStudentCode] = useState("");
  const [linkedSuccess, setLinkedSuccess] = useState(false);

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) return;
    setLinkedSuccess(true);
    setStudentCode("");
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in main-content-padding">
      {/* ── HERO BANNER ── */}
      <div className="rich-gradient-hero rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-[-40%] right-[-10%] w-80 h-80 bg-white/10 rounded-full filter blur-[60px] animate-pulse-glow" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black backdrop-blur-md">
              <Brain className="w-4 h-4 text-[#93C5FD]" />
              <span>Parent AI Assistant</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              Welcome back, <span className="text-[#93C5FD]">{displayName}</span>
            </h1>
            <p className="text-white/80 text-sm">
              Live learning telemetry for <strong>Keza M.</strong> (P6 Blue)
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md px-4 py-2 rounded-2xl">
            <span className="w-3 h-3 rounded-full bg-[#0E9F6E] animate-ping" />
            <span className="text-xs font-bold">Synchronized with Classroom</span>
          </div>
        </div>
      </div>

      {/* ── AI PARENT COACH PANEL ── */}
      <div className="insight-card p-6 md:p-8 space-y-4" style={{ borderLeft: "4px solid #D4952A" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#D4952A]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">AI Parent Coach</h3>
              <p className="text-xs text-white/70">Personalized weekly observations and encouragement suggestions</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/10 text-[#93C5FD] border border-white/15">
            Updated Today
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Your child is improving significantly in Reading</p>
              <p className="text-xs text-white/70 mt-1">Keza scored 89% in reading comprehension this week. Keep encouraging daily bedtime reading!</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Needs extra support in General Science</p>
              <p className="text-xs text-white/70 mt-1">Struggled with plant biology concepts. Doing a 10-minute quiz with Vive AI will help solidify the fundamentals.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="pro-card glass-panel hover-glow p-5 space-y-2"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
              </div>
              <h3 className="text-2xl font-black">{s.value}</h3>
            </div>
          );
        })}
      </div>

      {/* ── SUBJECT PROGRESS & RECENT ACTIVITY ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <div className="pro-card glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base" style={{ color: textPrimary }}>Subject Mastery Breakdown</h3>
            <span className="text-xs font-bold text-[#4A8FE7]">Term 2 Progress</span>
          </div>

          <div className="space-y-4">
            {SUBJECTS.map((sub) => (
              <div key={sub.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span style={{ color: textPrimary }}>{sub.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{sub.status}</span>
                    <span className="font-black" style={{ color: sub.color }}>{sub.score}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${sub.score}%`, background: sub.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Learning Activity */}
        <div className="pro-card glass-panel p-6 space-y-4">
          <h3 className="font-black text-base" style={{ color: textPrimary }}>Recent Learning Activity</h3>
          <div className="space-y-3">
            {ACTIVITIES.map((act) => {
              const AIcon = act.icon;
              return (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${act.color}15` }}>
                    <AIcon className="w-4 h-4" style={{ color: act.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: textPrimary }}>{act.text}</p>
                    <p className="text-[10px]" style={{ color: textMuted }}>{act.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── LINK ANOTHER STUDENT ── */}
      <div className="pro-card glass-panel p-6">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#4A8FE7]" />
            <h3 className="font-black text-base" style={{ color: textPrimary }}>Link Another Child</h3>
          </div>
          <p className="text-xs" style={{ color: textMuted }}>
            Enter your child&apos;s Student ID or school code to view their progress on your dashboard.
          </p>

          <form onSubmit={handleLink} className="flex gap-2 pt-1">
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="e.g. STU-2026-8924"
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#4A8FE7]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-105 cursor-pointer shadow-md"
              style={{ background: "linear-gradient(135deg, #4A8FE7, #1B4080)" }}
            >
              Link Student
            </button>
          </form>

          {linkedSuccess && (
            <p className="text-xs font-bold text-[#0E9F6E] flex items-center gap-1.5 pt-1">
              <CheckCircle className="w-4 h-4" /> Student linked successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
