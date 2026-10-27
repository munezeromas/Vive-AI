import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AccessibilityBar, AvatarMuteProvider } from "./AccessibilityBar";
import {
  LogOut, Menu, Home, MessageSquare, Calendar, Bell, Search, ChevronRight, User, ChevronLeft,
  Sun, Moon
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { signOut, useSession } from "@/lib/auth-client";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/parent",            label: "Dashboard",  exact: true, icon: Home },
  { to: "/parent/messages",   label: "Messages",                icon: MessageSquare },
  { to: "/parent/attendance",  label: "Attendance",              icon: Calendar },
];

export function ParentLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("parent_sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("parent_sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => { setMounted(true); }, []);

  if (!session?.user) return null;

  const parentUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const isDark = mounted && theme === "dark";

  const navBg = isDark
    ? "linear-gradient(180deg, #060E1C 0%, #0A1628 50%, #060E1C 100%)"
    : "linear-gradient(180deg, #0F2447 0%, #132D5E 50%, #0F2447 100%)";

  const mainBg = isDark ? "#060E1C" : "#F7F9FD";
  const headerBg = isDark ? "rgba(6,14,28,0.94)" : "rgba(247,249,253,0.94)";
  const headerBorder = isDark ? "1px solid rgba(74,143,231,0.12)" : "1px solid #D6E2F5";

  return (
    <AvatarMuteProvider>
      <div
        className={`h-screen w-full flex overflow-hidden ${!mounted ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        style={{ background: mainBg }}
      >
        {/* ── SIDEBAR (DESKTOP) ── */}
        <aside className={`hidden lg:flex flex-col h-full shrink-0 relative z-20 transition-all duration-300 ${isCollapsed ? "w-[72px]" : "w-[235px]"}`}>
          <div className="absolute inset-0" style={{ background: navBg }} />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-15 blur-[60px] bg-[#4A8FE7]" />

          {/* Collapse/Expand Floating Button */}
          <button
            onClick={toggleCollapse}
            className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center z-30 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Logo */}
          <div className="relative z-10 h-[68px] px-4 flex items-center shrink-0 border-b border-white/10">
            {!isCollapsed ? (
              <Logo size={28} lightBg={false} />
            ) : (
              <div className="w-full flex justify-center">
                <Logo size={14} lightBg={false} />
              </div>
            )}
          </div>

          {/* Parent card */}
          {!isCollapsed ? (
            <div className="relative z-10 mx-3 mt-4 mb-3 rounded-2xl p-3.5 flex items-center gap-3 bg-white/10 border border-white/15">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg bg-linear-to-br from-[#4A8FE7] to-[#0F2447]">
                {parentUser.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-black leading-tight truncate">{parentUser.name}</p>
                <p className="text-[10px] text-white/60 truncate mt-0.5">{parentUser.email}</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 mx-auto mt-4 mb-3 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-base shrink-0 bg-linear-to-br from-[#4A8FE7] to-[#0F2447]">
                {parentUser.name[0]?.toUpperCase()}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={`relative z-10 flex-1 overflow-y-auto py-2 space-y-1 ${isCollapsed ? "px-1.5" : "px-3"}`}>
            {NAV_ITEMS.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  title={isCollapsed ? n.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-bold transition-all relative ${
                    isCollapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"
                  }`}
                  style={{
                    background: active ? "rgba(74,143,231,0.22)" : "transparent",
                    color: active ? "#93C5FD" : "rgba(255,255,255,0.65)",
                    border: active ? "1px solid rgba(74,143,231,0.35)" : "1px solid transparent",
                    textDecoration: "none",
                  }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#4A8FE7]" />}
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{n.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="relative z-10 p-3 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center rounded-xl text-sm font-bold text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all ${
                isCollapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"
              } cursor-pointer border-none bg-transparent`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          <header
            className="h-[68px] shrink-0 flex items-center justify-between px-6 z-10"
            style={{ background: headerBg, backdropFilter: "blur(16px)", borderBottom: headerBorder }}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="lg:hidden">
                <Logo size={26} lightBg={!isDark} />
              </div>
              <span className="hidden sm:inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-[#4A8FE7]">
                Parent Portal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                style={{ background: isDark ? "rgba(74,143,231,0.08)" : "#FFFFFF", border: isDark ? "1px solid rgba(74,143,231,0.15)" : "1px solid #D6E2F5" }}
                title="Toggle theme"
              >
                {isDark ? <Moon className="w-4 h-4 text-[#93C5FD]" /> : <Sun className="w-4 h-4 text-[#D4952A]" />}
              </button>

              <div className="w-px h-6 mx-1" style={{ background: isDark ? "rgba(74,143,231,0.2)" : "#D6E2F5" }} />

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm bg-linear-to-br from-[#4A8FE7] to-[#0F2447]">
                  {parentUser.name[0]?.toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 pb-24 lg:pb-10">
            <Outlet />
          </main>
        </div>

        <AccessibilityBar />
      </div>
    </AvatarMuteProvider>
  );
}
