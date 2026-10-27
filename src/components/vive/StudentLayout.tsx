import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AccessibilityBar, AvatarMuteProvider } from "./AccessibilityBar";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LogOut, Menu, Home, Bot, Sparkles, Pencil, ClipboardList,
  Zap, Video, MessageCircle, Gamepad2, Library, Calendar, TrendingUp,
  Bell, Search, ChevronRight, ChevronLeft,
  Sun, Moon, X, MapPin, School, Brain, Briefcase, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
};

const NAV_MAIN: NavItem[] = [
  { to: "/student",            label: "Dashboard",   exact: true, icon: Home          },
  { to: "/student/tutor",      label: "Vive AI",                  icon: Bot           },
  { to: "/student/missions",   label: "Missions",                 icon: MapPin        },
  { to: "/student/classes",    label: "My Classes",               icon: School        },
  { to: "/student/ai-quizzes", label: "AI Quizzes",               icon: Sparkles      },
  { to: "/student/speak",      label: "Languages",                icon: MessageCircle },
];

const NAV_TOOLS: NavItem[] = [
  { to: "/student/videos",         label: "Lectures",      icon: Video         },
  { to: "/student/games",          label: "Practice",      icon: Gamepad2      },
  { to: "/student/simplify",       label: "Simplify",      icon: Pencil        },
  { to: "/student/homework",       label: "Homework",      icon: ClipboardList },
  { to: "/student/quizzes",        label: "Tests",         icon: Zap           },
  { to: "/student/library",        label: "Library",       icon: Library       },
  { to: "/student/planner",        label: "Schedule",      icon: Calendar      },
  { to: "/student/progress",       label: "Analytics",     icon: TrendingUp    },
  { to: "/student/learning-twin",  label: "Learning Twin", icon: Brain         },
  { to: "/student/messages",       label: "Messages",      icon: MessageCircle },
];

const ALL_NAV: NavItem[] = [...NAV_MAIN, ...NAV_TOOLS];

const XP_MAX = 2000;

export function StudentLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: sessionData } = useSession();
  const user = sessionData?.user as any;
  if (!user) return null;

  const displayName = user.name || "Student";
  const displayGrade = user.schoolId || user.email;
  const displayXP = typeof user.xp === 'number' ? user.xp : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_sidebar_collapsed") === "true";
    }
    return false;
  });
  const [fabOpen, setFabOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("student_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Auto-collapse sidebar when on tutor page or when selecting a nav item to maximize space
  const handleNavClick = () => {
    if (window.innerWidth < 1400) {
      setIsCollapsed(true);
      localStorage.setItem("student_sidebar_collapsed", "true");
    }
  };

  useEffect(() => {
    // When navigating to any other page, immediately cancel all active speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    window.dispatchEvent(new CustomEvent("vive-stop-speech"));
  }, [path]);

  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  const navBg = isDark
    ? "linear-gradient(180deg, #060E1C 0%, #0A1628 50%, #060E1C 100%)"
    : "linear-gradient(180deg, #0F2447 0%, #132D5E 50%, #0F2447 100%)";

  const mainBg = isDark ? "#060E1C" : "#F7F9FD";
  const headerBg = isDark ? "rgba(6,14,28,0.94)" : "rgba(247,249,253,0.94)";
  const headerBorder = isDark ? "1px solid rgba(74,143,231,0.12)" : "1px solid #D6E2F5";
  const searchBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.98)";
  const searchBorder = isDark ? "1px solid rgba(74,143,231,0.15)" : "1px solid #D6E2F5";
  const textPrimary = isDark ? "#EEF4FF" : "#0A1628";
  const textMuted = isDark ? "#7A9AC0" : "#536B8A";
  const drawerBg = isDark ? "#0D1B35" : "#FFFFFF";

  const ASK_VIVE_ACTIONS = [
    { label: "Explain this topic", icon: Sparkles },
    { label: "Help with homework", icon: ClipboardList },
    { label: "Read this page aloud", icon: MessageCircle },
    { label: "Quiz me now", icon: Zap },
  ];

  return (
    <AvatarMuteProvider>
      <div
        className={`h-screen w-full flex overflow-hidden ${!mounted ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        style={{ background: mainBg }}
      >
        {/* ════ SIDEBAR (DESKTOP) ════ */}
        <aside className={`hidden lg:flex flex-col h-full shrink-0 relative z-20 transition-all duration-300 ${isCollapsed ? "w-[76px]" : "w-[240px]"}`}>
          <div className="absolute inset-0" style={{ background: navBg }} />
          {/* Glow orbs */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-15 blur-[60px]" style={{ background: "#4A8FE7" }} />
          <div className="absolute bottom-28 -left-8 w-32 h-32 rounded-full opacity-10 blur-[50px]" style={{ background: "#93C5FD" }} />
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

          {/* Logo & Top Toggle */}
          <div className="relative z-10 h-[68px] px-3 flex items-center justify-between shrink-0 border-b border-white/10">
            {!isCollapsed ? (
              <>
                <Logo size={28} lightBg={false} />
                <button
                  onClick={toggleCollapse}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleCollapse}
                className="w-full flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-[#93C5FD]" />
              </button>
            )}
          </div>

          {/* Student card */}
          {!isCollapsed ? (
            <div className="relative z-10 mx-3 mt-4 mb-3 rounded-2xl p-3.5 flex items-center gap-3 transition-all duration-300"
              style={{ background: "rgba(74,143,231,0.12)", border: "1px solid rgba(74,143,231,0.25)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg"
                style={{ background: "linear-gradient(135deg, #4A8FE7, #0F2447)" }}
              >
                {displayName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-black leading-tight truncate">{displayName}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{displayGrade} · {displayXP.toLocaleString()} XP</p>
                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(displayXP / XP_MAX) * 100}%`, background: "linear-gradient(90deg, #4A8FE7, #93C5FD)" }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 mx-auto mt-4 mb-3 flex items-center justify-center transition-all duration-300">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg cursor-pointer"
                style={{ background: "linear-gradient(135deg, #4A8FE7, #0F2447)" }}
                onClick={toggleCollapse}
                title={`${displayName} (${displayGrade})`}
              >
                {displayName[0]?.toUpperCase()}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={`relative z-10 flex-1 overflow-y-auto py-1 space-y-0.5 ${isCollapsed ? "px-1.5" : "px-2.5"}`}>
            {!isCollapsed ? (
              <p className="px-3 mb-2 mt-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>Main</p>
            ) : (
              <div className="h-px my-2 mx-2 bg-white/10" />
            )}
            {NAV_MAIN.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={handleNavClick}
                  title={isCollapsed ? n.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-bold transition-all duration-200 relative ${isCollapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"}`}
                  style={{
                    background: active ? "rgba(74,143,231,0.22)" : "transparent",
                    color: active ? "#93C5FD" : "rgba(255,255,255,0.65)",
                    border: active ? "1px solid rgba(74,143,231,0.35)" : "1px solid transparent",
                    textDecoration: "none",
                    boxShadow: active ? "0 2px 12px rgba(74,143,231,0.15)" : "none",
                  }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#4A8FE7" }} />}
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{n.label}</span>}
                  {active && !isCollapsed && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}

            {!isCollapsed ? (
              <p className="px-3 mb-2 mt-4 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>Study Tools</p>
            ) : (
              <div className="h-px my-3 mx-2 bg-white/10" />
            )}
            {NAV_TOOLS.map((n) => {
              const active = path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={handleNavClick}
                  title={isCollapsed ? n.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-bold transition-all duration-200 relative ${isCollapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"}`}
                  style={{
                    background: active ? "rgba(74,143,231,0.22)" : "transparent",
                    color: active ? "#93C5FD" : "rgba(255,255,255,0.65)",
                    border: active ? "1px solid rgba(74,143,231,0.35)" : "1px solid transparent",
                    textDecoration: "none",
                    boxShadow: active ? "0 2px 12px rgba(74,143,231,0.15)" : "none",
                  }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#4A8FE7" }} />}
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{n.label}</span>}
                  {active && !isCollapsed && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="relative z-10 p-3 border-t border-white/10">
            <button
              onClick={handleSignOut}
              title={isCollapsed ? "Sign Out" : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-bold transition-all ${isCollapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"} cursor-pointer border-none bg-transparent text-white/50 hover:text-red-400 hover:bg-red-500/10`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
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
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#4A8FE7]" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>

              <div className="lg:hidden">
                <Logo size={26} lightBg={!isDark} />
              </div>
              {/* Search */}
              <div
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1 max-w-sm"
                style={{ background: searchBg, border: searchBorder, boxShadow: isDark ? "none" : "0 2px 8px rgba(74,143,231,0.08)" }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8" }} />
                <input
                  type="text" placeholder="Search lessons, topics..."
                  className="bg-transparent border-none outline-none text-sm flex-1"
                  style={{ color: textPrimary, fontFamily: "inherit" }}
                />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#EEF3FB", color: "#94A3B8" }}>Ctrl+K</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: isDark ? "rgba(74,143,231,0.08)" : "rgba(255,255,255,0.9)", border: isDark ? "1px solid rgba(74,143,231,0.15)" : "1px solid #D6E2F5" }}
              >
                <Bell className="w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#536B8A" }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                  style={{ background: "#E02424", borderColor: isDark ? "#060E1C" : "#F7F9FD" }} />
              </button>

              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                style={{ background: isDark ? "rgba(74,143,231,0.08)" : "rgba(255,255,255,0.9)", border: isDark ? "1px solid rgba(74,143,231,0.15)" : "1px solid #D6E2F5" }}
                title="Toggle theme"
              >
                {isDark ? <Moon className="w-4 h-4 text-[#93C5FD]" /> : <Sun className="w-4 h-4 text-[#D4952A]" />}
              </button>

              <div className="w-px h-6 mx-1" style={{ background: isDark ? "rgba(74,143,231,0.2)" : "#D6E2F5" }} />

              <button className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black leading-none" style={{ color: textPrimary }}>{displayName}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>{displayGrade}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md"
                  style={{ background: "linear-gradient(135deg, #4A8FE7, #0F2447)" }}
                >
                  {displayName[0]?.toUpperCase()}
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
            background: isDark ? "rgba(6,14,28,0.97)" : "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: isDark ? "1px solid rgba(74,143,231,0.12)" : "1px solid #D6E2F5",
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
                    style={{ background: active ? "rgba(74,143,231,0.15)" : "transparent" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: active ? "#4A8FE7" : (isDark ? "rgba(255,255,255,0.35)" : "#94A3B8") }} />
                  </div>
                  <span className="text-[9px] font-black" style={{ color: active ? "#4A8FE7" : (isDark ? "rgba(255,255,255,0.35)" : "#94A3B8") }}>
                    {n.label}
                  </span>
                </Link>
              );
            })}

            {/* More Drawer */}
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl cursor-pointer" style={{ minWidth: 56 }}>
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
                    <div className="mx-auto w-10 h-1 rounded-full mb-5" style={{ background: isDark ? "rgba(74,143,231,0.3)" : "#D6E2F5" }} />
                    <Drawer.Title className="font-black text-lg mb-4" style={{ color: isDark ? "#EEF4FF" : "#0A1628" }}>All Features</Drawer.Title>
                    <div className="grid grid-cols-4 gap-3 pb-6">
                      {ALL_NAV.slice(4).map((n) => {
                        const Icon = n.icon;
                        return (
                          <Drawer.Close asChild key={n.to}>
                            <Link to={n.to} className="flex flex-col items-center gap-2 group" style={{ textDecoration: "none" }}>
                              <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                                style={{ background: isDark ? "rgba(74,143,231,0.1)" : "#EEF3FB", border: isDark ? "1px solid rgba(74,143,231,0.2)" : "1px solid #D6E2F5" }}
                              >
                                <Icon className="w-6 h-6" style={{ color: "#4A8FE7" }} />
                              </div>
                              <span className="text-[10px] font-black text-center leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#536B8A" }}>
                                {n.label}
                              </span>
                            </Link>
                          </Drawer.Close>
                        );
                      })}
                      <Drawer.Close asChild>
                        <button onClick={handleSignOut} className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer" style={{ textDecoration: "none" }}>
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(224,36,36,0.08)", border: "1px solid rgba(224,36,36,0.15)" }}>
                            <LogOut className="w-6 h-6" style={{ color: "#E02424" }} />
                          </div>
                          <span className="text-[10px] font-black" style={{ color: "#E02424" }}>Sign Out</span>
                        </button>
                      </Drawer.Close>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>

        {/* ════ ASK VIVE FLOATING BUTTON (Hidden on Tutor page) ════ */}
        {!path.startsWith("/student/tutor") && (
          <>
            {fabOpen && (
              <div
                className="fixed z-[60] rounded-2xl p-4 shadow-2xl border border-white/10 backdrop-blur-md lg:bottom-24 lg:right-8 bottom-28 right-4"
                style={{ background: isDark ? "rgba(13,27,53,0.95)" : "rgba(15,36,71,0.95)", width: 260 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-black text-sm flex items-center gap-2"><Bot className="w-4 h-4 text-[#93C5FD]" /> Ask Vive</h4>
                  <button onClick={() => setFabOpen(false)} className="text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {ASK_VIVE_ACTIONS.map((action) => {
                    const AIcon = action.icon;
                    return (
                      <Link
                        key={action.label}
                        to="/student/tutor"
                        onClick={() => setFabOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold text-white/80 hover:text-white hover:bg-white/10"
                        style={{ textDecoration: "none" }}
                      >
                        <AIcon className="w-4 h-4 text-[#93C5FD]" />
                        {action.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className={`vive-fab hidden lg:flex ${fabOpen ? "rotate-45" : ""}`}
              style={{ transition: "all 0.3s ease", position: "fixed", bottom: "2rem", right: "2rem", zIndex: 55 }}
              title="Ask Vive AI"
            >
              {fabOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className={`vive-fab lg:hidden ${fabOpen ? "rotate-45" : ""}`}
              style={{ transition: "all 0.3s ease", position: "fixed", bottom: "5.5rem", right: "1rem", zIndex: 55 }}
              title="Ask Vive AI"
            >
              {fabOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </button>
          </>
        )}

        <AccessibilityBar />
      </div>
    </AvatarMuteProvider>
  );
}
