import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CLASS_STUDENTS } from "@/lib/mock-data";
import { useTheme } from "@/lib/theme-context";
import {
  Search, Users, ShieldAlert, TrendingUp, MessageCircle,
  ChevronUp, ChevronDown, Eye, Flag
} from "lucide-react";

export const Route = createFileRoute("/teacher/students")({
  head: () => ({ meta: [{ title: "Students — Vive AI" }] }),
  component: Students,
});

type SortKey = "name" | "mastery" | "lastActive" | "risk";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

const RISK_CONFIG = {
  high: { label: "High", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  medium: { label: "Medium", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  low: { label: "On Track", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
};

function Students() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0";

  const [q, setQ] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [sortKey, setSortKey] = useState<SortKey>("mastery");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [messaged, setMessaged] = useState<Set<string>>(new Set());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const list = CLASS_STUDENTS
    .filter(s =>
      (riskFilter === "all" || s.risk === riskFilter) &&
      s.name.toLowerCase().includes(q.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "mastery") cmp = a.mastery - b.mastery;
      else if (sortKey === "risk") cmp = RISK_ORDER[a.risk] - RISK_ORDER[b.risk];
      else if (sortKey === "lastActive") cmp = a.lastActive.localeCompare(b.lastActive);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)
      : null;

  const thClass = "px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest cursor-pointer select-none hover:opacity-100 transition-opacity";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in main-content-padding">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 shadow-xl hover-glow"
        style={{ background: "linear-gradient(135deg, #0369A1, #0EA5E9, #38BDF8)", minHeight: "200px" }}>
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full filter blur-[80px] animate-pulse-glow" />

        <div className="relative z-10 flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black backdrop-blur-md">
            <Users className="w-4 h-4" /> Class List
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Student <span className="text-yellow-300">Overview</span>
          </h1>
          <p className="text-white/80 font-medium text-sm max-w-md">
            Monitor individual progress, risk levels, and learning activity for all {CLASS_STUDENTS.length} enrolled students.
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0 flex gap-5 shrink-0">
          {[
            { label: "Total", val: CLASS_STUDENTS.length, color: "#BAE6FD" },
            { label: "At-Risk", val: CLASS_STUDENTS.filter(s => s.risk !== "low").length, color: "#FCA5A5" },
            { label: "Avg Mastery", val: `${Math.round(CLASS_STUDENTS.reduce((s, x) => s + x.mastery, 0) / CLASS_STUDENTS.length)}%`, color: "#86EFAC" },
          ].map(s => (
            <div key={s.label} className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4">
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search students by name..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-all"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", border: `1px solid ${cardBorder}`, color: textPrimary }}
          />
        </div>

        {/* Risk filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "high", "medium", "low"] as const).map(f => {
            const cfg = f === "all" ? { color: "#6366F1", bg: "rgba(99,102,241,0.12)" } : RISK_CONFIG[f];
            return (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: riskFilter === f ? cfg.color : (isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC"),
                  color: riskFilter === f ? "#fff" : textMuted,
                  border: `1px solid ${riskFilter === f ? "transparent" : cardBorder}`,
                  boxShadow: riskFilter === f ? `0 4px 12px ${cfg.color}40` : "none",
                }}
              >
                {f === "all" ? "All" : RISK_CONFIG[f].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="pro-card glass-panel hover-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${cardBorder}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <th className={thClass} style={{ color: textMuted }} onClick={() => handleSort("name")}>
                  Student <SortIcon k="name" />
                </th>
                <th className={thClass} style={{ color: textMuted }} onClick={() => handleSort("mastery")}>
                  Mastery <SortIcon k="mastery" />
                </th>
                <th className={thClass} style={{ color: textMuted }}>Dyslexia</th>
                <th className={thClass} style={{ color: textMuted }} onClick={() => handleSort("lastActive")}>
                  Last Active <SortIcon k="lastActive" />
                </th>
                <th className={thClass} style={{ color: textMuted }} onClick={() => handleSort("risk")}>
                  Risk <SortIcon k="risk" />
                </th>
                <th className={thClass} style={{ color: textMuted }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => {
                const risk = RISK_CONFIG[s.risk as keyof typeof RISK_CONFIG];
                const initials = s.name.split(" ").map(n => n[0]).join("").slice(0, 2);
                const avatarColor = ["#5BA0E3", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"][i % 6];

                return (
                  <tr
                    key={s.id}
                    className="group transition-all duration-200"
                    style={{
                      borderBottom: `1px solid ${cardBorder}`,
                      background: "transparent",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Student */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 shadow-sm"
                          style={{ background: `linear-gradient(135deg,${avatarColor},${avatarColor}88)` }}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-black text-sm" style={{ color: textPrimary }}>{s.name}</p>
                          <p className="text-[10px] font-bold opacity-60" style={{ color: textMuted }}>ID #{s.id.toString().padStart(4, "0")}</p>
                        </div>
                        {flagged.has(String(s.id)) && (
                          <Flag className="w-3 h-3 text-red-400 shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Mastery */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${s.mastery}%`,
                              background: s.mastery >= 75 ? "linear-gradient(90deg,#10B981,#34D399)" : s.mastery >= 50 ? "linear-gradient(90deg,#F59E0B,#FCD34D)" : "linear-gradient(90deg,#EF4444,#F87171)"
                            }} />
                        </div>
                        <span className="text-sm font-black shrink-0 w-10 text-right"
                          style={{ color: s.mastery >= 75 ? "#10B981" : s.mastery >= 50 ? "#F59E0B" : "#EF4444" }}>
                          {s.mastery}%
                        </span>
                      </div>
                    </td>

                    {/* Dyslexia */}
                    <td className="px-4 py-3.5">
                      {s.dyslexia ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-sky-400/10 text-sky-400 border border-sky-400/20">
                          Enabled
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold opacity-40" style={{ color: textMuted }}>—</span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold" style={{ color: textMuted }}>{s.lastActive}</span>
                    </td>

                    {/* Risk */}
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                        style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.color}30` }}>
                        {risk.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Message student"
                          onClick={() => setMessaged(prev => new Set([...prev, String(s.id)]))}
                          className="p-1.5 rounded-lg transition-colors hover:scale-110"
                          style={{ background: messaged.has(String(s.id)) ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)", color: messaged.has(String(s.id)) ? "#10B981" : "#5BA0E3" }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          title="View progress"
                          className="p-1.5 rounded-lg transition-colors hover:scale-110"
                          style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Flag for review"
                          onClick={() => setFlagged(prev => {
                            const n = new Set(prev);
                            n.has(String(s.id)) ? n.delete(String(s.id)) : n.add(String(s.id));
                            return n;
                          })}
                          className="p-1.5 rounded-lg transition-colors hover:scale-110"
                          style={{ background: flagged.has(String(s.id)) ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.06)", color: "#EF4444" }}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        <button
                          title="View performance"
                          className="p-1.5 rounded-lg transition-colors hover:scale-110"
                          style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="font-black text-sm" style={{ color: textPrimary }}>No students found</p>
                    <p className="text-xs font-medium mt-1" style={{ color: textMuted }}>Try adjusting your search or filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${cardBorder}` }}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: textMuted }}>
            Showing {list.length} of {CLASS_STUDENTS.length} students
          </p>
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#EF4444" }}>
              {CLASS_STUDENTS.filter(s => s.risk === "high").length} need immediate attention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

