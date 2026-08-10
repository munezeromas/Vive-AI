import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ASSIGNMENTS, CLASSES } from "@/lib/mock-data";
import { useTheme } from "@/lib/theme-context";
import {
  Plus, FileText, Clock, Users, CheckCircle2, AlertCircle,
  BookOpen, Beaker, Globe, Calculator, X, Calendar, Star
} from "lucide-react";

export const Route = createFileRoute("/teacher/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Vive AI" }] }),
  component: Assignments,
});

const SUBJECT_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Math: { color: "#5BA0E3", bg: "rgba(59,130,246,0.12)", icon: Calculator },
  English: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", icon: BookOpen },
  Science: { color: "#10B981", bg: "rgba(16,185,129,0.12)", icon: Beaker },
  Geography: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Globe },
  default: { color: "#6366F1", bg: "rgba(99,102,241,0.12)", icon: FileText },
};

const getSubjectConfig = (subject: string) =>
  SUBJECT_CONFIG[subject] ?? SUBJECT_CONFIG.default;

type AssignmentItem = {
  id: number;
  title: string;
  subject: string;
  due: string;
  count: number;
  status: "active" | "grading" | "completed";
  description: string;
  points: number;
};

const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  { id: 1, title: "Fractions Practice", subject: "Math", due: "Fri", count: 28, status: "active", description: "Complete all exercises on page 45 about adding and subtracting fractions.", points: 20 },
  { id: 2, title: "Reading Log", subject: "English", due: "Sun", count: 28, status: "active", description: "Read a chapter of your assigned book and write a 5-sentence summary.", points: 15 },
  { id: 3, title: "Plant Quiz", subject: "Science", due: "Wed", count: 14, status: "grading", description: "10-question quiz on photosynthesis and plant cell structure.", points: 30 },
  { id: 4, title: "Map of Rwanda", subject: "Geography", due: "Mon", count: 28, status: "completed", description: "Label all provinces, major cities, and national parks on the map.", points: 25 },
];

const STATUS_CONFIG = {
  active: { label: "Active", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  grading: { label: "Grading", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  completed: { label: "Completed", color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
};

function Assignments() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0";

  const [items, setItems] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [filter, setFilter] = useState<"all" | "active" | "grading" | "completed">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "Math", due: "", description: "", points: "20" });

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const newItem: AssignmentItem = {
      id: Date.now(),
      title: form.title,
      subject: form.subject,
      due: form.due || "TBD",
      count: 28,
      status: "active",
      description: form.description,
      points: parseInt(form.points) || 20,
    };
    setItems([newItem, ...items]);
    setForm({ title: "", subject: "Math", due: "", description: "", points: "20" });
    setShowForm(false);
  };

  const handleDelete = (id: number) => setItems(items.filter(i => i.id !== id));

  const counts = { all: items.length, active: items.filter(i => i.status === "active").length, grading: items.filter(i => i.status === "grading").length, completed: items.filter(i => i.status === "completed").length };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in main-content-padding">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 shadow-xl hover-glow"
        style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1, #818CF8)", minHeight: "200px" }}>
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full filter blur-[80px] animate-pulse-glow" />

        <div className="relative z-10 flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black backdrop-blur-md">
            <FileText className="w-4 h-4" /> Assignments
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Class <span className="text-yellow-300">Assignments</span>
          </h1>
          <p className="text-white/80 font-medium text-sm max-w-md">
            Create and manage assignments for {CLASSES.length} active classes and {items.filter(i => i.status === "active").length} open tasks.
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0 flex flex-col items-end gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Assignment
          </button>
          <div className="flex gap-4">
            {[{ label: "Active", val: counts.active, color: "#86EFAC" }, { label: "Grading", val: counts.grading, color: "#FCD34D" }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CREATE FORM ── */}
      {showForm && (
        <div className="pro-card glass-panel p-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg,transparent,#6366F1,transparent)" }} />
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-lg flex items-center gap-2" style={{ color: textPrimary }}>
              <Plus className="w-5 h-5 text-indigo-500" /> Create New Assignment
            </h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
            <input
              required placeholder="Assignment title..."
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all md:col-span-2"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", border: `1px solid ${cardBorder}`, color: textPrimary }}
            />
            <select
              value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", border: `1px solid ${cardBorder}`, color: textPrimary }}
            >
              {Object.keys(SUBJECT_CONFIG).filter(k => k !== "default").map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              placeholder="Due (e.g. Mon, Fri, Dec 10)"
              value={form.due} onChange={e => setForm({ ...form, due: e.target.value })}
              className="rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", border: `1px solid ${cardBorder}`, color: textPrimary }}
            />
            <input
              type="number" placeholder="Points (e.g. 20)"
              value={form.points} onChange={e => setForm({ ...form, points: e.target.value })}
              className="rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", border: `1px solid ${cardBorder}`, color: textPrimary }}
            />
            <textarea
              rows={2} placeholder="Description (optional)..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all md:col-span-2 resize-none"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", border: `1px solid ${cardBorder}`, color: textPrimary }}
            />
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                style={{ border: `1px solid ${cardBorder}`, color: textMuted }}>
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                Create Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── FILTER TABS ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "active", "grading", "completed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200"
            style={{
              background: filter === f ? "linear-gradient(135deg,#4F46E5,#6366F1)" : (isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC"),
              color: filter === f ? "#fff" : textMuted,
              border: `1px solid ${filter === f ? "transparent" : cardBorder}`,
              boxShadow: filter === f ? "0 4px 12px rgba(79,70,229,0.3)" : "none",
            }}
          >
            {f} <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* ── ASSIGNMENT CARDS ── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(a => {
          const subj = getSubjectConfig(a.subject);
          const SubjIcon = subj.icon;
          const status = STATUS_CONFIG[a.status];
          const progress = a.status === "completed" ? 100 : a.status === "grading" ? 70 : 30;

          return (
            <div key={a.id} className="pro-card pro-card-hover glass-panel hover-glow p-5 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg,transparent,${subj.color},transparent)` }} />
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full filter blur-[25px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: subj.color }} />

              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: subj.bg, border: `1px solid ${subj.color}25` }}>
                    <SubjIcon className="w-5 h-5" style={{ color: subj.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: subj.color }}>{a.subject}</p>
                    <h3 className="font-black text-sm leading-snug" style={{ color: textPrimary }}>{a.title}</h3>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-all text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              {a.description && (
                <p className="text-xs font-medium leading-relaxed opacity-70" style={{ color: textMuted }}>{a.description}</p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                  <Clock className="w-3 h-3" /> Due {a.due}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                  <Users className="w-3 h-3" /> {a.count} students
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                  <Star className="w-3 h-3" /> {a.points} pts
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Completion</span>
                  <span className="text-[10px] font-black" style={{ color: subj.color }}>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg,${subj.color},${subj.color}88)` }} />
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ background: status.bg, color: status.color, border: `1px solid ${status.color}30` }}>
                  {a.status === "active" ? <CheckCircle2 className="inline w-3 h-3 mr-1" /> : <AlertCircle className="inline w-3 h-3 mr-1" />}
                  {status.label}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black" style={{ color: textMuted }}>
                  <Calendar className="w-3 h-3" /> Due {a.due}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full pro-card glass-panel p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-black mb-2" style={{ color: textPrimary }}>No assignments found</h3>
            <p className="text-sm font-medium" style={{ color: textMuted }}>Create an assignment to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

