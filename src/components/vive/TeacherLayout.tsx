import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AccessibilityBar } from "./AccessibilityBar";
import {
  Home, Users, AlertTriangle, ClipboardList, BarChart3,
  LogOut, Menu, Bell, ChevronDown, ChevronRight, Settings,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { Drawer } from "vaul";

const NAV = [
  { to: "/teacher",             label: "Overview",     icon: Home,          exact: true },
  { to: "/teacher/students",    label: "Students",     icon: Users },
  { to: "/teacher/alerts",      label: "Alerts",       icon: AlertTriangle },
  { to: "/teacher/assignments", label: "Assignments",  icon: ClipboardList },
  { to: "/teacher/reports",     label: "Reports",      icon: BarChart3 },
];

const TEACHER = {
  name: "Mrs. Mukamana",
  initials: "MM",
  grade: "P6",
  students: 28,
};

export function TeacherLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: isDark ? "#0A0B1E" : "#EEF0F8",
        color: isDark ? "#F8FAFC" : "#0F172A",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-[72px] shrink-0"
        style={{
          background: isDark ? "rgba(10,11,30,0.92)" : "rgba(255,255,255,0.95)",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Logo size={28} lightBg={!isDark} />
          </Link>
          <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
            <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
              Teacher Portal
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Alert badge */}
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer hover:bg-red-500/20"
                style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertTriangle className="w-3.5 h-3.5" /> 3 Alerts
          </span>

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}>
            <Bell className="w-4 h-4" style={{ color: isDark ? "#94A3B8" : "#64748B" }} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
              style={{ background: "#EF4444", borderColor: isDark ? "#0A0B1E" : "#FFFFFF" }}
            />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80 text-lg"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
          >
            {isDark ? "🌙" : "☀️"}
          </button>

          <div className="w-px h-6 mx-1" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

          {/* Avatar */}
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-2xl" style={{ background: isDark ? "transparent" : "transparent" }}>
            <div className="hidden sm:block text-right mr-1">
              <p className="text-sm font-black leading-none" style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}>
                {TEACHER.name}
              </p>
              <p className="text-[10px] mt-0.5 font-bold opacity-70" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
                {TEACHER.grade} · {TEACHER.students} students
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md"
              style={{ background: "linear-gradient(135deg, #22C55E, #134E34)", border: "2px solid rgba(34,197,94,0.3)" }}
            >
              {TEACHER.initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 hidden sm:block opacity-50" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* ── SIDEBAR (DESKTOP) ── */}
        <aside
          className="hidden lg:flex flex-col w-[260px] shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto"
          style={{
            background: isDark
              ? "linear-gradient(180deg, #052515 0%, #0a3320 50%, #052515 100%)"
              : "linear-gradient(180deg, #134E34 0%, #166534 50%, #134E34 100%)",
            borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >

          {/* Teacher card */}
          <div className="p-4 pt-5 pb-2">
            <div
              className="rounded-2xl p-4 flex items-center gap-3 border transition-all hover:shadow-lg"
              style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.12)", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.2)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #22C55E, #134E34)" }}
              >
                {TEACHER.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black leading-tight truncate" style={{ color: "#FFFFFF" }}>
                  {TEACHER.name}
                </p>
                <p className="text-[10px] mt-0.5 font-bold uppercase tracking-widest opacity-70" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Grade {TEACHER.grade}
                </p>
              </div>
            </div>

            {/* Alert count */}
            <Link to="/teacher/alerts" style={{ textDecoration: "none" }}>
              <div
                className="mt-3 rounded-xl p-3 flex items-center gap-2 hover:-translate-y-0.5 transition-transform"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer" }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#EF4444" }} />
                <span className="text-xs font-black" style={{ color: "#EF4444" }}>
                  3 students need attention
                </span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            <p className="px-3 mb-2 mt-2 text-[9px] font-black uppercase tracking-[0.18em] opacity-50" style={{ color: "#fff" }}>
              Navigation
            </p>
            {NAV.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all relative group"
                  style={{
                    background: active ? "rgba(74,222,128,0.18)" : "transparent",
                    color: active ? "#4ADE80" : "rgba(255,255,255,0.6)",
                    border: active ? "1px solid rgba(74,222,128,0.3)" : "1px solid transparent",
                    textDecoration: "none"
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; } }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full" style={{ background: "#22C55E" }} />}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{n.label}</span>
                  {n.label === "Alerts" && (
                    <span
                      className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-md"
                      style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}
                    >
                      3
                    </span>
                  )}
                  {active && n.label !== "Alerts" && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Settings & Footer */}
          <div className="p-4" style={{ borderTop: `1px solid rgba(255,255,255,0.1)` }}>
            <Link
              to="/teacher"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all mb-2"
              style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; (e.currentTarget as HTMLElement).style.color = "#FCA5A5"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Switch Role
            </Link>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 relative">
          {/* Subtle background glow for main content area */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: isDark ? "rgba(10,11,30,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV.slice(0, 4).map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all"
                style={{ textDecoration: "none", minWidth: 56 }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: active ? "rgba(74,222,128,0.18)" : "transparent" }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: active ? "#22C55E" : (isDark ? "rgba(255,255,255,0.35)" : "#94A3B8") }}
                  />
                </div>
                <span
                  className="text-[9px] font-black"
                  style={{ color: active ? "#22C55E" : (isDark ? "rgba(255,255,255,0.35)" : "#94A3B8") }}
                >
                  {n.label}
                </span>
              </Link>
            );
          })}

          {/* More drawer */}
          <Drawer.Root>
            <Drawer.Trigger asChild>
              <button className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl" style={{ minWidth: 56 }}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                  <Menu className="w-5 h-5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94A3B8" }} />
                </div>
                <span
                  className="text-[9px] font-black"
                  style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94A3B8" }}
                >
                  More
                </span>
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
              <Drawer.Content
                className="fixed bottom-0 left-0 right-0 z-[101] rounded-t-3xl outline-none"
                style={{ background: isDark ? "#0D0F2A" : "#FFFFFF", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "none" }}
              >
                <div className="p-5">
                  <div
                    className="mx-auto w-10 h-1 rounded-full mb-5"
                    style={{ background: isDark ? "rgba(255,255,255,0.15)" : "#E2E8F0" }}
                  />
                  <Drawer.Title
                    className="font-black text-lg mb-4"
                    style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}
                  >
                    More Options
                  </Drawer.Title>
                  <div className="grid grid-cols-4 gap-3 pb-6">
                    {NAV.slice(4).map((n) => {
                      const Icon = n.icon;
                      return (
                        <Drawer.Close asChild key={n.to}>
                          <Link to={n.to} className="flex flex-col items-center gap-2 group" style={{ textDecoration: "none" }}>
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                              style={{
                                background: isDark ? "rgba(74,222,128,0.1)" : "#F1F5F9",
                                border: isDark ? "1px solid rgba(74,222,128,0.2)" : "1px solid #E2E8F0",
                              }}
                            >
                              <Icon className="w-6 h-6" style={{ color: "#22C55E" }} />
                            </div>
                            <span
                              className="text-[10px] font-black text-center leading-tight"
                              style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#64748B" }}
                            >
                              {n.label}
                            </span>
                          </Link>
                        </Drawer.Close>
                      );
                    })}
                    <Drawer.Close asChild>
                      <Link to="/login" className="flex flex-col items-center gap-2 group" style={{ textDecoration: "none" }}>
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.15)",
                          }}
                        >
                          <LogOut className="w-6 h-6" style={{ color: "#EF4444" }} />
                        </div>
                        <span className="text-[10px] font-black" style={{ color: "#EF4444" }}>
                          Switch
                        </span>
                      </Link>
                    </Drawer.Close>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>

      <AccessibilityBar />
    </div>
  );
}