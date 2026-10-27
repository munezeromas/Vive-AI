import { createFileRoute, Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme-context";
import {
  BookOpen, FlaskConical, MessageSquare, Palette, Globe, Code2,
  ChevronRight, School, Bot, Sparkles, Users
} from "lucide-react";

export const Route = createFileRoute("/student/classes")({
  head: () => ({ meta: [{ title: "My Classes — Vive AI" }] }),
  component: ClassesPage,
});

const SCHOOL_CLASSES = [
  { id: "math", name: "P6 Mathematics", teacher: "Mr. Habimana", icon: BookOpen, color: "#4A8FE7", assignments: 3, average: "82%" },
  { id: "science", name: "P6 Science", teacher: "Ms. Uwase", icon: FlaskConical, color: "#0E9F6E", assignments: 2, average: "78%" },
  { id: "english", name: "P6 English", teacher: "Mr. Nzeyimana", icon: MessageSquare, color: "#D4952A", assignments: 1, average: "88%" },
];

const PERSONAL_SUBJECTS = [
  { id: "coding", name: "Coding Basics", icon: Code2, color: "#1B4080", progress: 40 },
  { id: "art", name: "Digital Art", icon: Palette, color: "#D4952A", progress: 25 },
  { id: "french", name: "French", icon: Globe, color: "#0E9F6E", progress: 15 },
];

function ClassesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#EEF4FF" : "#0A1628";
  const textMuted = isDark ? "#7A9AC0" : "#536B8A";
  const cardBorder = isDark ? "rgba(74,143,231,0.14)" : "#D6E2F5";

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in main-content-padding">
      {/* School Classes */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,143,231,0.12)" }}>
            <School className="w-5 h-5" style={{ color: "#4A8FE7" }} />
          </div>
          <div>
            <h2 className="text-xl font-black" style={{ color: textPrimary }}>School Classes</h2>
            <p className="text-xs font-bold" style={{ color: textMuted }}>Assigned by your teachers</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {SCHOOL_CLASSES.map((cls) => {
            const Icon = cls.icon;
            return (
              <div
                key={cls.id}
                className="pro-card glass-panel hover-glow p-5 group cursor-pointer"
                style={{ borderTop: `3px solid ${cls.color}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${cls.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: cls.color }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm" style={{ color: textPrimary }}>{cls.name}</h3>
                    <p className="text-[10px] font-bold" style={{ color: textMuted }}>{cls.teacher}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold" style={{ color: textMuted }}>{cls.assignments} pending</span>
                  <span className="text-xs font-black" style={{ color: cls.color }}>Avg: {cls.average}</span>
                </div>
                <Link
                  to="/student/homework"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all group-hover:-translate-y-0.5"
                  style={{ background: cls.color, textDecoration: "none" }}
                >
                  View Class <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Learning */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,149,42,0.12)" }}>
            <Bot className="w-5 h-5" style={{ color: "#D4952A" }} />
          </div>
          <div>
            <h2 className="text-xl font-black" style={{ color: textPrimary }}>Personal Learning</h2>
            <p className="text-xs font-bold" style={{ color: textMuted }}>AI-curated paths based on your interests</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PERSONAL_SUBJECTS.map((sub) => {
            const Icon = sub.icon;
            return (
              <div key={sub.id} className="pro-card glass-panel hover-glow p-5 group cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${sub.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: sub.color }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm" style={{ color: textPrimary }}>{sub.name}</h3>
                    <p className="text-[10px] font-bold" style={{ color: textMuted }}>{sub.progress}% complete</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${sub.progress}%`, background: sub.color }} />
                </div>
                <Link
                  to="/student/tutor"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all group-hover:-translate-y-0.5"
                  style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#EEF3FB", color: sub.color, textDecoration: "none", border: `1px solid ${sub.color}30` }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Continue
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore More */}
      <div className="insight-card">
        <div className="absolute top-[-30%] right-[-10%] w-60 h-60 bg-white/5 rounded-full filter blur-[50px]" />
        <div className="relative z-10">
          <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4952A]" /> Explore More Subjects
          </h3>
          <p className="text-white/60 text-sm mb-4">Discover new interests and let AI build a personalized path for you</p>
          <div className="flex flex-wrap gap-2">
            {["Robotics", "Entrepreneurship", "Public Speaking", "Music", "Drawing"].map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white/80 border border-white/10 hover:bg-white/20 cursor-pointer transition-all">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
