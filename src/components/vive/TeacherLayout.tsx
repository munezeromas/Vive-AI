import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AccessibilityBar } from "./AccessibilityBar";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Home, Users, AlertTriangle, ClipboardList, BarChart3,
  LogOut, Menu, Bell, ChevronDown, ChevronRight, Settings, MessageSquare, BookOpen,
  Sun, Moon
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { Drawer } from "vaul";

const NAV = [
  { to: "/teacher",             label: "Overview",     icon: Home,          exact: true },
  { to: "/teacher/students",    label: "Students",     icon: Users },
  { to: "/teacher/alerts",      label: "Alerts",       icon: AlertTriangle },
  { to: "/teacher/assignments", label: "Assignments",  icon: ClipboardList },
  { to: "/teacher/materials",   label: "Materials",    icon: BookOpen },
  { to: "/teacher/reports",     label: "Reports",      icon: BarChart3 },
  { to: "/teacher/messages",    label: "Messages",     icon: MessageSquare },
];

export function TeacherLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: sessionData } = useSession();
  const user = sessionData?.user as any;
  if (!user) return null;

  const displayName = user.name || "Teacher";
  const displayGrade = user.schoolId || user.email;

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const mainBg = isDark ? "#060E1C" : "#F7F9FD";
  const headerBg = isDark ? "rgba(6,14,28,0.94)" : "rgba(247,249,253,0.94)";
  const headerBorder = isDark ? "1px solid rgba(74,143,231,0.12)" : "1px solid #D6E2F5";
  const sidebarBg = isDark
    ? "linear-gradient(180deg, #060E1C 0%, #0A1628 100%)"
    : "linear-gradient(180deg, #0F2447 0%, #132D5E 100%)";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: mainBg,
        color: isDark ? "#EEF4FF" : "#0A1628",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-[72px] shrink-0"
        style={{
          background: headerBg,
          borderBottom: headerBorder,
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Logo size={28} lightBg={!isDark} />
          </Link>
          <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l" style={{ borderColor: isDark ? "rgba(74,143,231,0.15)" : "#D6E2F5" }}>
            <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-emerald-500/15 text-[#0E9F6E]">
              Teacher Portal
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Alert badge */}
          <span
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
            style={{ background: "rgba(224,36,36,0.12)", color: "#E02424", border: "1px solid rgba(224,36,36,0.25)" }}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> 3 Alerts
          </span>

          {/* Notifications */}
          <button
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: isDark ? "rgba(74,143,231,0.08)" : "#FFFFFF", border: isDark ? "1px solid rgba(74,143,231,0.15)" : "1px solid #D6E2F5" }}
          >
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E02424]" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            style={{ background: isDark ? "rgba(74,143,231,0.08)" : "#FFFFFF", border: isDark ? "1px solid rgba(74,143,231,0.15)" : "1px solid #D6E2F5" }}
            title="Toggle theme"
          >
            {isDark ? <Moon className="w-4 h-4 text-[#93C5FD]" /> : <Sun className="w-4 h-4 text-[#D4952A]" />}
          </button>

          <div className="w-px h-6 mx-1" style={{ background: isDark ? "rgba(74,143,231,0.2)" : "#D6E2F5" }} />

          {/* Avatar */}
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-2xl cursor-pointer">
            <div className="hidden sm:block text-right mr-1">
              <p className="text-sm font-black leading-none">{displayName}</p>
              <p className="text-[10px] mt-0.5 font-bold opacity-70 text-slate-400">{displayGrade}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md"
              style={{ background: "linear-gradient(135deg, #4A8FE7, #0F2447)" }}
            >
              {initials}
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
            background: sidebarBg,
            borderRight: isDark ? "1px solid rgba(74,143,231,0.12)" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/40">Dashboard Menu</p>
            {NAV.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all relative"
                  style={{
                    background: active ? "rgba(74,143,231,0.22)" : "transparent",
                    color: active ? "#93C5FD" : "rgba(255,255,255,0.65)",
                    border: active ? "1px solid rgba(74,143,231,0.35)" : "1px solid transparent",
                    textDecoration: "none",
                  }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#4A8FE7]" />}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{n.label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer signout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <AccessibilityBar />
    </div>
  );
}
