import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users, TrendingUp, AlertTriangle, BookOpen, Sparkles,
  Award, CheckCircle, Plus, Calendar, Bell, ChevronRight,
  Trophy, ArrowUpRight, BarChart2, Lightbulb
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export const Route = createFileRoute("/teacher/")({
  head: () => ({ meta: [{ title: "Teacher Dashboard — Vive AI" }] }),
  component: TeacherDashboard,
});

const STATS = [
  { label: "Total Students", value: "45", icon: Users, color: "#4A8FE7", bg: "rgba(74,143,231,0.12)" },
  { label: "Active Today", value: "39", icon: CheckCircle, color: "#0E9F6E", bg: "rgba(14,159,110,0.12)" },
  { label: "Class Average", value: "81%", icon: TrendingUp, color: "#D4952A", bg: "rgba(212,149,42,0.12)" },
  { label: "At Risk", value: "6", icon: AlertTriangle, color: "#E02424", bg: "rgba(224,36,36,0.12)" },
];

const MASTERY_DATA = [
  { subject: "Numbers", value: 92 },
  { subject: "Addition", value: 88 },
  { subject: "Subtraction", value: 85 },
  { subject: "Fractions", value: 62 },
  { subject: "Geometry", value: 78 },
  { subject: "Word Problems", value: 71 },
];

const RECENT_ACTIVITY = [
  { id: 1, text: "Amani completed Fractions Level 2", time: "10 mins ago", icon: BookOpen, color: "#4A8FE7" },
  { id: 2, text: "Keza achieved 100% on Math Quest", time: "25 mins ago", icon: Trophy, color: "#D4952A" },
  { id: 3, text: "Eric requested help with Division", time: "1 hour ago", icon: AlertTriangle, color: "#E02424" },
  { id: 4, text: "P6 Science Assignment submitted (38/45)", time: "2 hours ago", icon: CheckCircle, color: "#0E9F6E" },
];

const TOP_STUDENTS = [
  { name: "Keza M.", score: "96%", rank: 1, color: "linear-gradient(135deg, #4A8FE7, #1E5BBE)" },
  { name: "Eric N.", score: "94%", rank: 2, color: "linear-gradient(135deg, #D4952A, #B8791E)" },
  { name: "Aline U.", score: "91%", rank: 3, color: "linear-gradient(135deg, #0E9F6E, #057A52)" },
];

function TeacherDashboard() {
  const [packAssigned, setPackAssigned] = useState(false);

  const handleAssignPack = () => {
    setPackAssigned(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in main-content-padding">
      {/* ── HERO BANNER ── */}
      <div className="rich-gradient-hero rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-[-40%] right-[-10%] w-80 h-80 bg-white/10 rounded-full filter blur-[60px] animate-pulse-glow" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#D4952A]" />
              <span>Primary 6 Teacher Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              Welcome back, <span className="text-[#93C5FD]">Mrs. Mukamana</span>
            </h1>
            <p className="text-white/80 text-sm">
              Overview for P6 Mathematics & Science classes · Kigali Academy
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAssignPack}
              className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #D4952A, #F0B429)" }}
            >
              <Plus className="w-4 h-4" />
              <span>{packAssigned ? "Pack Assigned ✓" : "Quick Assign Pack"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── AI INSIGHTS STAR PANEL ── */}
      <div className="insight-card p-6 md:p-8 space-y-4" style={{ borderLeft: "4px solid #D4952A" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#D4952A]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">AI Class Diagnostics & Insights</h3>
              <p className="text-xs text-white/70">Real-time learning pattern analysis from student mission logs</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/10 text-[#D4952A] border border-white/15">
            Active Prediction
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Most students struggle with Fractions (62% mastery)</p>
              <p className="text-xs text-white/70 mt-1">18 students made repeated errors in denominator conversions.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Class excels in Numbers & Operations (92% mastery)</p>
              <p className="text-xs text-white/70 mt-1">Ready for advanced algebra-readiness modules.</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-white/80">
            Recommended Action: <strong className="text-white">Assign Fraction Practice Pack to P6</strong>
          </p>
          <button
            onClick={handleAssignPack}
            disabled={packAssigned}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-105 cursor-pointer disabled:opacity-60"
            style={{ background: packAssigned ? "#0E9F6E" : "#4A8FE7" }}
          >
            {packAssigned ? "Practice Pack Sent to 45 Students" : "1-Click Assign Practice Pack"}
          </button>
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
              <h3 className="text-3xl font-black">{s.value}</h3>
            </div>
          );
        })}
      </div>

      {/* ── MASTERY CHART & RECENT ACTIVITY ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mastery Chart */}
        <div className="lg:col-span-2 pro-card glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#4A8FE7]" />
              <h3 className="font-black text-base">Concept Mastery Distribution (%)</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">P6 Mathematics</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MASTERY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,36,71,0.95)",
                    border: "1px solid rgba(74,143,231,0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                />
                <Bar dataKey="value" fill="#4A8FE7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Students Podium */}
        <div className="pro-card glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4952A]" />
            <h3 className="font-black text-base">Top Performing Students</h3>
          </div>

          <div className="space-y-3">
            {TOP_STUDENTS.map((st) => (
              <div
                key={st.name}
                className="p-3.5 rounded-2xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm"
                    style={{ background: st.color }}
                  >
                    {st.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{st.name}</h4>
                    <p className="text-[11px] text-slate-500">P6 Mathematics</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0E9F6E]">{st.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT CLASS ACTIVITY ── */}
      <div className="pro-card glass-panel p-6 space-y-4">
        <h3 className="font-black text-base">Recent Class Activity</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {RECENT_ACTIVITY.map((act) => {
            const AIcon = act.icon;
            return (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${act.color}15` }}>
                  <AIcon className="w-4 h-4" style={{ color: act.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{act.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
