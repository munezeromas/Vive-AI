import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, PlayCircle, Trophy, Users, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { useTheme } from "@/lib/theme-context";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/student/homework")({
  head: () => ({ meta: [{ title: "Homework — Vive AI" }] }),
  component: Homework,
});

function Homework() {
  const [filter, setFilter] = useState("all");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: async () => {
      const res = await fetch("/api/student/assignments");
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    }
  });

  const filtered = assignments; // For now all are 'pending' visually

  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted   = isDark ? "#94A3B8" : "#64748B";

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in main-content-padding pb-20">
      
      {/* ── HERO HEADER ── */}
      <div className="pro-card glass-panel hover-glow p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-amber-500/20 rounded-full filter blur-[80px] animate-pulse-glow" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.1))", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
            <RiveAnimation src="/riv-animations/21441-40283-students-tools-notebook-pencil.riv" className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: textPrimary }}>Your Homework</h1>
            <p className="text-sm font-bold opacity-70" style={{ color: textMuted }}>Complete assignments to earn XP and unlock badges!</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl relative z-10 shrink-0" style={{ background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)", border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)" }}>
          {["all", "assigned", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
              style={{
                background: filter === f ? "#F59E0B" : "transparent",
                color: filter === f ? "white" : textMuted,
                boxShadow: filter === f ? "0 4px 12px rgba(245,158,11,0.4)" : "none",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── HOMEWORK LIST ── */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filtered.length > 0 ? filtered.map((h: any) => (
            <Link to="/student/homework/$assignmentId" params={{ assignmentId: h.id }} key={h.id} className="pro-card pro-card-hover glass-panel hover-glow p-6 flex flex-col gap-4 relative overflow-hidden group">
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg,transparent,#5BA0E3,transparent)` }} />
              {/* Background hover glow */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full filter blur-[25px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: "#5BA0E3" }} />

              {/* Subject + urgency badges */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ background: "rgba(59,130,246,0.12)", color: "#5BA0E3", border: `1px solid #5BA0E330` }}>
                  General Subject
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20`}>
                    Pending
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-black text-base leading-snug relative z-10" style={{ color: textPrimary }}>{h.title}</h3>

              {/* Description */}
              <p className="text-xs font-medium leading-relaxed opacity-70 relative z-10 line-clamp-2" style={{ color: textMuted }}>{h.description || "No description provided."}</p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto relative z-10 pt-2" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                  <Clock className="w-3 h-3" /> Due {h.dueDate ? new Date(h.dueDate).toLocaleDateString() : 'TBA'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                  <Trophy className="w-3 h-3" /> +{h.totalPoints} Pts
                </span>
              </div>
            </Link>
          )) : (
            /* Empty state */
            <div className="col-span-full py-16 text-center space-y-4 pro-card glass-panel flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-40 h-40">
                <RiveAnimation src="/riv-animations/3352-7042-bluey-idle-animation.riv" className="w-full h-full opacity-80" />
              </div>
              <h3 className="text-2xl font-black" style={{ color: textPrimary }}>All clear! 🎉</h3>
              <p className="text-sm font-bold max-w-sm mx-auto opacity-70 leading-relaxed" style={{ color: textMuted }}>
                You have no pending homework. When your teacher assigns work, it'll appear right here!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
