import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AccessibilityBar, AvatarMuteProvider } from "./AccessibilityBar";
import {
  LogOut, Menu, Home, MessageSquare, Calendar, Bell, Search, ChevronRight, User, ChevronLeft
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { signOut, useSession } from "@/lib/auth-client";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  emoji: string;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/parent",            label: "Dashboard",  exact: true, icon: Home,          emoji: "🏠" },
  { to: "/parent/messages",   label: "Messages",   icon: MessageSquare,              emoji: "💬" },
  { to: "/parent/attendance",  label: "Attendance", icon: Calendar,                   emoji: "📅" },
];

export function ParentLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
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

  useEffect(() => {
    setMounted(true);
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotificationsList(data);
        }
      } catch (err) {
        console.warn("Failed to fetch parent notifications", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [parentUser.id]);

  const unreadCount = notificationsList.filter(n => !n.isRead).length;

  const handleClearNotif = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const isDark = mounted && theme === "dark";

  const navBg = isDark
    ? "linear-gradient(180deg, #111827 0%, #1f2937 50%, #111827 100%)"
    : "linear-gradient(180deg, #065F46 0%, #047857 50%, #065F46 100%)";

  const mainBg = isDark ? "#0B1329" : "#F0FDF4";
  const headerBg = isDark ? "rgba(11,19,41,0.9)" : "rgba(240,253,244,0.92)";
  const headerBorder = isDark ? "1px solid rgba(16,185,129,0.12)" : "1px solid rgba(16,185,129,0.15)";
  const searchBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)";
  const searchBorder = isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #D1FAE5";
  const textPrimary = isDark ? "#F3F4F6" : "#065F46";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const drawerBg = isDark ? "#1F2937" : "#FFFFFF";

  return (
    <AvatarMuteProvider>
      <div
        className={`h-screen w-full flex overflow-hidden ${!mounted ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        style={{ background: mainBg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* ════ SIDEBAR (DESKTOP) ════ */}
        <aside className={`hidden lg:flex flex-col h-full shrink-0 relative z-20 transition-all duration-300 ${isCollapsed ? "w-[72px]" : "w-[235px]"}`}>
          <div className="absolute inset-0" style={{ background: navBg }} />
          {/* Glow Orbs */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-15 blur-[60px]" style={{ background: "#10B981" }} />
          <div className="absolute bottom-28 -left-8 w-32 h-32 rounded-full opacity-10 blur-[50px]" style={{ background: "#34D399" }} />

          {/* Collapse/Expand Floating Button */}
          <button
            onClick={toggleCollapse}
            className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center z-30 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Logo */}
          <div className="relative z-10 h-[68px] px-4 flex items-center shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
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
            <div className="relative z-10 mx-3 mt-4 mb-3 rounded-2xl p-3.5 flex items-center gap-3 transition-all duration-300"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg"
                style={{ background: "linear-gradient(135deg, #10B981, #065F46)" }}
              >
                {parentUser.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-black leading-tight truncate">{parentUser.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Parent Account</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 mx-auto mt-4 mb-3 flex items-center justify-center transition-all duration-300">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg"
                style={{ background: "linear-gradient(135deg, #10B981, #065F46)" }}
                title={`${parentUser.name} (Parent)`}
              >
                {parentUser.name[0]}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={`relative z-10 flex-1 overflow-y-auto py-1 space-y-0.5 ${isCollapsed ? "px-1.5" : "px-2.5"}`}>
            {!isCollapsed ? (
              <p className="px-3 mb-2 mt-1 text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>Parent Tools</p>
            ) : (
              <div className="h-px my-3 mx-2 bg-white/10" />
            )}
            {NAV_ITEMS.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to} to={n.to}
                  title={isCollapsed ? n.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-bold transition-all duration-200 relative ${isCollapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"}`}
                  style={{
                    background: active ? "rgba(16,185,129,0.22)" : "transparent",
                    color: active ? "#A7F3D0" : "rgba(255,255,255,0.55)",
                    border: active ? "1px solid rgba(16,185,129,0.35)" : "1px solid transparent",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#10B981" }} />}
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{n.label}</span>}
                  {active && !isCollapsed && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="relative z-10 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              onClick={handleSignOut}
              title={isCollapsed ? "Sign Out" : undefined}
              className={`flex items-center rounded-xl text-sm font-bold transition-all ${isCollapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"}`}
              style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "#FCA5A5"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
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
              <div className="lg:hidden">
                <Logo size={26} lightBg={!isDark} />
              </div>
              <div
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1 max-w-sm"
                style={{ background: searchBg, border: searchBorder }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#6B7280" }} />
                <input
                  type="text" placeholder="Search children, messages..."
                  className="bg-transparent border-none outline-none text-sm flex-1"
                  style={{ color: textPrimary, fontFamily: "inherit" }}
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0 relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white hover:bg-emerald-50 border border-emerald-100"
                style={{
                  background: isDark ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.9)",
                  border: isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #D1FAE5"
                }}
              >
                <Bell className="w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#047857" }} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                    style={{ background: "#EF4444", borderColor: isDark ? "#0B1329" : "#F0FDF4" }} />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotif && (
                <div
                  className="absolute right-0 top-12 w-80 rounded-2xl p-4 shadow-2xl z-50 border max-h-96 overflow-y-auto"
                  style={{
                    background: isDark ? "#1F2937" : "#FFFFFF",
                    borderColor: isDark ? "rgba(16,185,129,0.2)" : "#D1FAE5"
                  }}
                >
                  <h4 className="font-black text-sm mb-3" style={{ color: textPrimary }}>Notifications</h4>
                  {notificationsList.length === 0 ? (
                    <p className="text-xs text-center py-6" style={{ color: textMuted }}>No notifications yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {notificationsList.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleClearNotif(n.id)}
                          className="p-2.5 rounded-xl text-xs cursor-pointer border hover:bg-emerald-50/10 transition-colors"
                          style={{
                            borderColor: n.isRead ? "transparent" : "rgba(16,185,129,0.3)",
                            background: n.isRead ? "transparent" : "rgba(16,185,129,0.05)"
                          }}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold" style={{ color: textPrimary }}>{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                          </div>
                          <p className="font-medium" style={{ color: textMuted }}>{n.message}</p>
                          <p className="text-[10px] mt-1 text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-lg"
                style={{
                  background: isDark ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.9)",
                  border: isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #D1FAE5"
                }}
                title="Toggle theme"
              >
                {isDark ? "🌙" : "☀️"}
              </button>

              <div className="w-px h-6 mx-1" style={{ background: isDark ? "rgba(16,185,129,0.2)" : "#D1FAE5" }} />

              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black leading-none" style={{ color: textPrimary }}>{parentUser.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>Guardian Account</p>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 shadow-md"
                  style={{ background: "linear-gradient(135deg, #10B981, #065F46)" }}
                >
                  {parentUser.name[0]}
                </div>
              </div>
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
            background: isDark ? "rgba(17,24,39,0.97)" : "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: isDark ? "1px solid rgba(16,185,129,0.12)" : "1px solid #D1FAE5",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex items-center justify-around px-2 py-1.5">
            {NAV_ITEMS.map((n) => {
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
                    style={{ background: active ? "rgba(16,185,129,0.15)" : "transparent" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: active ? "#10B981" : (isDark ? "rgba(255,255,255,0.35)" : "#9CA3AF") }} />
                  </div>
                  <span className="text-[9px] font-black" style={{ color: active ? "#10B981" : (isDark ? "rgba(255,255,255,0.35)" : "#9CA3AF") }}>
                    {n.label}
                  </span>
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all"
              style={{ textDecoration: "none", minWidth: 56 }}
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                <LogOut className="w-5 h-5" style={{ color: "#EF4444" }} />
              </div>
              <span className="text-[9px] font-black text-red-500">Sign Out</span>
            </button>
          </div>
        </div>

        <AccessibilityBar />
      </div>
    </AvatarMuteProvider>
  );
}
