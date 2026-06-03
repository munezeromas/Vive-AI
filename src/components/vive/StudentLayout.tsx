/**
 * StudentLayout.tsx — Sky-Blue Premium Sidebar Layout
 */
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AccessibilityBar, AvatarMuteProvider } from "./AccessibilityBar";
import {
  LogOut, Menu, Home, Bot, Sparkles, Pencil, ClipboardList,
  Zap, Video, MessageCircle, Gamepad2, Library, Calendar, TrendingUp,
  Bell, Search, ChevronRight, Star,
} from "lucide-react";
import { STUDENT } from "@/lib/mock-data";
import { useTheme } from "@/lib/theme-context";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  emoji: string;
  exact?: boolean;
};

const NAV_MAIN: NavItem[] = [
  { to: "/student",            label: "Dashboard",  exact: true, icon: Home,          emoji: "🏠" },
  { to: "/student/tutor",      label: "Vive AI",    icon: Bot,                        emoji: "🤖" },
  { to: "/student/ai-quizzes", label: "AI Quizzes", icon: Sparkles,                   emoji: "✨" },
  { to: "/student/speak",      label: "Languages",  icon: MessageCircle,              emoji: "🗣️" },
  { to: "/student/videos",     label: "Lectures",   icon: Video,                      emoji: "🎬" },
  { to: "/student/games",      label: "Practice",   icon: Gamepad2,                   emoji: "🎮" },
];

const NAV_TOOLS: NavItem[] = [
  { to: "/student/simplify",   label: "Simplify",   icon: Pencil,                     emoji: "✏️" },
  { to: "/student/homework",   label: "Homework",   icon: ClipboardList,              emoji: "📋" },
  { to: "/student/quizzes",    label: "Tests",      icon: Zap,                        emoji: "⚡" },
  { to: "/student/library",    label: "Library",    icon: Library,                    emoji: "📚" },
  { to: "/student/planner",    label: "Schedule",   icon: Calendar,                   emoji: "📅" },
  { to: "/student/progress",   label: "Analytics",  icon: TrendingUp,                 emoji: "📈" },
];

const ALL_NAV: NavItem[] = [...NAV_MAIN, ...NAV_TOOLS];

const XP_LEVEL = 1340;
const XP_MAX   = 2000;

export function StudentLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  const navBg = isDark
    ? "linear-gradient(180deg, #091525 0%, #0d1f3a 50%, #091525 100%)"
    : "linear-gradient(180deg, #1A3A5C 0%, #1e4a7a 50%, #1A3A5C 100%)";

  const mainBg = isDark ? "#0A1628" : "#F0F6FF";
  const headerBg = isDark ? "rgba(10,22,40,0.9)" : "rgba(240,246,255,0.92)";
  const headerBorder = isDark ? "1px solid rgba(74,144,217,0.12)" : "1px solid rgba(74,144,217,0.15)";
  const searchBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)";
  const searchBorder = isDark ? "1px solid rgba(74,144,217,0.15)" : "1px solid #DDE8F5";
  const textPrimary = isDark ? "#F0F6FF" : "#0F172A";
  const textMuted = isDark ? "#8BAAC8" : "#64748B";
  const drawerBg = isDark ? "#0F2040" : "#FFFFFF";

  return (
    <AvatarMuteProvider>
      <div
        className={`h-screen w-full flex overflow-hidden ${!mounted ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        style={{ background: mainBg }}
      >
        {/* ════ SIDEBAR (DESKTOP) ════ */}
        <aside className="hidden lg:flex flex-col w-[235px] h-full shrink-0 relative z-20 overflow-hidden">
          <div className="absolute inset-0" style={{ background: navBg }} />
          {/* Glow orbs */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-15 blur-[60px]" style={{ background: "#4A90D9" }} />
          <div className="absolute bottom-28 -left-8 w-32 h-32 rounded-full opacity-10 blur-[50px]" style={{ background: "#87CEEB" }} />
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

          {/* Logo */}
          <div className="relative z-10 h-[68px] px-4 flex items-center shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <Logo size={28} lightBg={false} />
          </div>

          {/* Student card */}
          <div className="relative z-10 mx-3 mt-4 mb-3 rounded-2xl p-3.5 flex items-center gap-3"
            style={{ background: "rgba(74,144,217,0.12)", border: "1px solid rgba(74,144,217,0.25)" }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg"
              style={{ background: "linear-gradient(135deg, #4A90D9, #1A3A5C)" }}
            >
              {STUDENT.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-black leading-tight truncate">{STUDENT.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{STUDENT.grade} · {XP_LEVEL.toLocaleString()} XP</p>
              <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(XP_LEVEL / XP_MAX) * 100}%`, background: "linear-gradient(90deg, #4A90D9, #87CEEB)" }}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex-1 overflow-y-auto px-2.5 py-1 space-y-0.5">
            <p className="px-3 mb-2 mt-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>Main</p>
            {NAV_MAIN.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to} to={n.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative"
                  style={{
                    background: active ? "rgba(74,144,217,0.22)" : "transparent",
                    color: active ? "#BFDBFE" : "rgba(255,255,255,0.55)",
                    border: active ? "1px solid rgba(74,144,217,0.35)" : "1px solid transparent",
                    textDecoration: "none",
                    boxShadow: active ? "0 2px 12px rgba(74,144,217,0.15)" : "none",
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#4A90D9" }} />}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{n.label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}

            <p className="px-3 mb-2 mt-4 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>Study Tools</p>
            {NAV_TOOLS.map((n) => {
              const active = path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to} to={n.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative"
                  style={{
                    background: active ? "rgba(74,144,217,0.22)" : "transparent",
                    color: active ? "#BFDBFE" : "rgba(255,255,255,0.55)",
                    border: active ? "1px solid rgba(74,144,217,0.35)" : "1px solid transparent",
                    textDecoration: "none",
                    boxShadow: active ? "0 2px 12px rgba(74,144,217,0.15)" : "none",
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#4A90D9" }} />}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{n.label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="relative z-10 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "#FCA5A5"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </Link>
          </div>
        </aside>

        {/* ════ MAIN CONTENT ════ */}
        <div className="flex-1 flex flex-col h-full min-w-0" style={{ background: mainBg }}>
          {/* TOP HEADER */}
          <header
            className="h-[68px] shrink-0 flex items-center justify-between px-6 z-10"
            style={{ background: headerBg, backdropFilter: "blur(16px)", borderBottom: headerBorder }}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="lg:hidden">
                <Logo size={26} lightBg={!isDark} />
              </div>
              {/* Search */}
              <div
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1 max-w-sm"
                style={{ background: searchBg, border: searchBorder, boxShadow: isDark ? "none" : "0 2px 8px rgba(74,144,217,0.08)" }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8" }} />
                <input
                  type="text" placeholder="Search lessons, topics..."
                  className="bg-transparent border-none outline-none text-sm flex-1"
                  style={{ color: textPrimary, fontFamily: "inherit" }}
                />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#EFF6FF", color: "#94A3B8" }}>⌘K</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: isDark ? "rgba(74,144,217,0.08)" : "rgba(255,255,255,0.9)", border: isDark ? "1px solid rgba(74,144,217,0.15)" : "1px solid #DDE8F5" }}
              >
                <Bell className="w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#64748B" }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                  style={{ background: "#EF4444", borderColor: isDark ? "#0A1628" : "#F0F6FF" }} />
              </button>

              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-lg"
                style={{ background: isDark ? "rgba(74,144,217,0.08)" : "rgba(255,255,255,0.9)", border: isDark ? "1px solid rgba(74,144,217,0.15)" : "1px solid #DDE8F5" }}
                title="Toggle theme"
              >
                {isDark ? "🌙" : "☀️"}
              </button>

              <div className="w-px h-6 mx-1" style={{ background: isDark ? "rgba(74,144,217,0.2)" : "#DDE8F5" }} />

              <button className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black leading-none" style={{ color: textPrimary }}>{STUDENT.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>{STUDENT.grade} Student</p>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md"
                  style={{ background: "linear-gradient(135deg, #4A90D9, #1A3A5C)" }}
                >
                  {STUDENT.name[0]}
                </div>
              </button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 pb-28 lg:pb-10">
            <Outlet />
          </main>
        </div>

        {/* ════ MOBILE BOTTOM NAV ════ */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: isDark ? "rgba(9,21,37,0.97)" : "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: isDark ? "1px solid rgba(74,144,217,0.12)" : "1px solid #DDE8F5",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex items-center justify-around px-2 py-1.5">
            {ALL_NAV.slice(0, 4).map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to} to={n.to}
                  className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all"
                  style={{ textDecoration: "none", minWidth: 56 }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                    style={{ background: active ? "rgba(74,144,217,0.15)" : "transparent" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: active ? "#4A90D9" : (isDark ? "rgba(255,255,255,0.35)" : "#94A3B8") }} />
                  </div>
                  <span className="text-[9px] font-black" style={{ color: active ? "#4A90D9" : (isDark ? "rgba(255,255,255,0.35)" : "#94A3B8") }}>
                    {n.label}
                  </span>
                </Link>
              );
            })}

            {/* More Drawer */}
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl" style={{ minWidth: 56 }}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                    <Menu className="w-5 h-5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94A3B8" }} />
                  </div>
                  <span className="text-[9px] font-black" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#94A3B8" }}>More</span>
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
                <Drawer.Content
                  className="fixed bottom-0 left-0 right-0 z-[101] max-h-[80vh] flex flex-col rounded-t-3xl outline-none"
                  style={{ background: drawerBg }}
                >
                  <div className="p-5 flex-1 overflow-y-auto">
                    <div className="mx-auto w-10 h-1 rounded-full mb-5" style={{ background: isDark ? "rgba(74,144,217,0.3)" : "#DDE8F5" }} />
                    <Drawer.Title className="font-black text-lg mb-4" style={{ color: isDark ? "#F0F6FF" : "#0F172A" }}>All Features</Drawer.Title>
                    <div className="grid grid-cols-4 gap-3 pb-6">
                      {ALL_NAV.slice(4).map((n) => {
                        const Icon = n.icon;
                        return (
                          <Drawer.Close asChild key={n.to}>
                            <Link to={n.to} className="flex flex-col items-center gap-2 group" style={{ textDecoration: "none" }}>
                              <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                                style={{ background: isDark ? "rgba(74,144,217,0.1)" : "#EFF6FF", border: isDark ? "1px solid rgba(74,144,217,0.2)" : "1px solid #DDE8F5" }}
                              >
                                <Icon className="w-6 h-6" style={{ color: isDark ? "#4A90D9" : "#4A90D9" }} />
                              </div>
                              <span className="text-[10px] font-black text-center leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#64748B" }}>
                                {n.label}
                              </span>
                            </Link>
                          </Drawer.Close>
                        );
                      })}
                      <Drawer.Close asChild>
                        <Link to="/login" className="flex flex-col items-center gap-2 group" style={{ textDecoration: "none" }}>
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                            <LogOut className="w-6 h-6" style={{ color: "#EF4444" }} />
                          </div>
                          <span className="text-[10px] font-black" style={{ color: "#EF4444" }}>Sign Out</span>
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
    </AvatarMuteProvider>
  );
}
