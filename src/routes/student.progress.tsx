import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/lib/theme-context";
import { Loader2, Zap, Target, Award, BrainCircuit, ArrowRight } from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";

export const Route = createFileRoute("/student/progress")({
  head: () => ({ meta: [{ title: "My Progress — Vive AI" }] }),
  component: StudentProgress,
});

function StudentProgress() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: insights, isLoading } = useQuery({
    queryKey: ["student-insights", "student-123"],
    queryFn: async () => {
      const res = await fetch("/api/student/insights?studentId=student-123");
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    }
  });

  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted   = isDark ? "#94A3B8" : "#64748B";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  const { strengths = [], weaknesses = [], recommendations = [] } = insights || {};

  return (
    <div className="space-y-8 max-w-7xl animate-fade-in main-content-padding pb-20">
      
      {/* ── HERO HEADER ── */}
      <div className="pro-card glass-panel hover-glow p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-amber-500/20 rounded-full filter blur-[80px]" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-400/5 border border-white/5">
            <RiveAnimation src="/riv-animations/21441-40283-students-tools-notebook-pencil.riv" className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: textPrimary }}>Learning Insights</h1>
            <p className="text-sm font-bold opacity-70" style={{ color: textMuted }}>AI-powered analysis of your strengths and areas for growth.</p>
          </div>
        </div>

        <div className="flex flex-col items-end relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Rank</span>
          <span className="text-2xl font-black text-amber-500 flex items-center gap-2"><Award className="w-6 h-6"/> Gold Tier</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Strengths */}
        <div className="pro-card glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-500 mb-4">
            <Zap className="w-6 h-6" />
            <h2 className="text-xl font-black">Your Strengths</h2>
          </div>
          {strengths.length > 0 ? strengths.map((s: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-sm font-medium">{s}</p>
            </div>
          )) : (
            <p className="text-sm opacity-60 italic">Complete more assignments to see your strengths.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="pro-card glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <Target className="w-6 h-6" />
            <h2 className="text-xl font-black">Focus Areas</h2>
          </div>
          {weaknesses.length > 0 ? weaknesses.map((w: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="text-sm font-medium">{w}</p>
            </div>
          )) : (
            <p className="text-sm opacity-60 italic">No major weak areas detected right now!</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="pro-card glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-500 mb-4">
            <BrainCircuit className="w-6 h-6" />
            <h2 className="text-xl font-black">AI Study Plan</h2>
          </div>
          {recommendations.length > 0 ? recommendations.map((r: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
              <p className="text-sm font-medium">{r}</p>
            </div>
          )) : (
             <p className="text-sm opacity-60 italic">Keep up the good work! We'll recommend next steps here.</p>
          )}
        </div>
      </div>

    </div>
  );
}
