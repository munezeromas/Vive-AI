import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/lib/theme-context";
import { Activity, Users, BookOpen, Target, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";

export const Route = createFileRoute("/teacher/reports")({
  head: () => ({ meta: [{ title: "Analytics & Reports — Vive AI" }] }),
  component: TeacherReports,
});

function TeacherReports() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
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

  const { overview = {}, recentSubmissions = [] } = analytics || {};

  return (
    <div className="space-y-8 max-w-7xl animate-fade-in main-content-padding pb-20">
      
      {/* ── HERO HEADER ── */}
      <div className="pro-card glass-panel hover-glow p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-amber-500/10 rounded-full filter blur-[80px]" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-400/5 border border-white/5">
            <Activity className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: textPrimary }}>Analytics & Reports</h1>
            <p className="text-sm font-bold opacity-70" style={{ color: textMuted }}>Track student performance, completion rates, and class health.</p>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS ── */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="pro-card glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><BookOpen className="w-5 h-5"/></div>
            <h3 className="font-bold opacity-70">Total Assignments</h3>
          </div>
          <p className="text-4xl font-black">{overview.totalAssignments || 0}</p>
        </div>

        <div className="pro-card glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Users className="w-5 h-5"/></div>
            <h3 className="font-bold opacity-70">Total Submissions</h3>
          </div>
          <p className="text-4xl font-black">{overview.totalSubmissions || 0}</p>
        </div>

        <div className="pro-card glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Target className="w-5 h-5"/></div>
            <h3 className="font-bold opacity-70">Class Average</h3>
          </div>
          <p className="text-4xl font-black">{overview.averageScore || 0}%</p>
        </div>

        <div className="pro-card glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><TrendingUp className="w-5 h-5"/></div>
            <h3 className="font-bold opacity-70">Learning Trend</h3>
          </div>
          <p className="text-xl font-bold text-purple-500">+4% this week</p>
        </div>
      </div>

      {/* ── AI INSIGHTS & RECENT ACTIVITY ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black flex items-center gap-2"><Activity className="w-5 h-5 text-amber-500"/> Recent Submissions</h2>
          <div className="pro-card glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="p-4 font-bold opacity-70">Student ID</th>
                  <th className="p-4 font-bold opacity-70">Assignment</th>
                  <th className="p-4 font-bold opacity-70">Score</th>
                  <th className="p-4 font-bold opacity-70">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.length > 0 ? recentSubmissions.map((sub: any) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{sub.studentId}</td>
                    <td className="p-4 opacity-80">{sub.assignmentId}</td>
                    <td className="p-4 font-bold text-amber-500">{sub.markReceived ?? "Pending"}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold">Graded</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-8 text-center opacity-50">No submissions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500"/> Class AI Insights</h2>
          <div className="pro-card glass-panel p-6 space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h4 className="font-bold text-red-500 mb-1">Struggling Concept</h4>
              <p className="text-sm opacity-80">Students are scoring 15% below average on "Photosynthesis". Consider reviewing this topic.</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="font-bold text-emerald-500 mb-1">Top Performance</h4>
              <p className="text-sm opacity-80">High completion rate on the recent "Algebra Intro" quiz. Good job!</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-bold text-blue-500 mb-1">Intervention Suggested</h4>
              <p className="text-sm opacity-80">3 students missed their last 2 assignments. Consider sending a reminder.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
