import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";
import {
  ClipboardList, Users, Flame, Trophy,
  ChevronLeft, ChevronRight,
  Bot, Sparkles, BookOpen, Star, Target, School,
  ThumbsUp, Smile, Meh, Battery, AlertCircle, ArrowRight,
  CheckCircle, Play
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useState, useEffect } from "react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";

export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Dashboard — Vive AI" }] }),
  component: Dashboard,
});

// Dynamically generate calendar based on provided date and schedules
function generateCalendar(date: Date, schedules: any[] = []) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = 0; i < startingDay; i++) {
    days.unshift({ day: prevMonthLastDay - i, currentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    let event = null;
    if (isCurrentMonth && i === todayDate) event = "today";
    const currentDateString = new Date(year, month, i).toLocaleDateString("en-CA");
    const hasSchedule = schedules.some(s => new Date(s.date).toLocaleDateString("en-CA") === currentDateString);
    if (hasSchedule && event !== "today") event = "green-circle";

    days.push({ day: i, currentMonth: true, event });
  }

  // Next month leading days
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ day: i, currentMonth: false });
  }

  const monthName = date.toLocaleString("default", { month: "long" });
  return { days, monthName, year };
}

/* ── Empty state component ── */
function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3 opacity-60">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">{subtitle}</p>
    </div>
  );
}


// Fallback mission images mapped to subject (kids photos)
const MISSION_IMAGES: Record<string, string> = {
  math:    "/images/hero.png",
  science: "/images/student-hero.png",
  lang:    "/classroom.png.png",
  kinya:   "/kps.jpg",
};

const MOODS = [
  { label: "Great", icon: ThumbsUp, color: "#0E9F6E" },
  { label: "Good", icon: Smile, color: "#4A8FE7" },
  { label: "Okay", icon: Meh, color: "#D4952A" },
  { label: "Tired", icon: Battery, color: "#536B8A" },
  { label: "Need Help", icon: AlertCircle, color: "#E02424" },
];


function Dashboard() {
  const { data: sessionData } = useSession();
  const sessionUser = sessionData?.user as any;
  const studentId = sessionUser?.id;
  const displayName = sessionUser?.name || "Student";

  const [schedules, setSchedules] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [topScores, setTopScores] = useState<any[]>([]);
  const [assignmentCount, setAssignmentCount] = useState<number | null>(null);
  const [xp, setXp] = useState<number>(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);

  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setXp(sessionUser?.xp ?? 0);

    fetch("/api/student/dashboard/schedules", { credentials: "include" })
      .then(r => r.json())
      .then(data => setSchedules(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/student/dashboard/performance", { credentials: "include" })
      .then(r => r.json())
      .then(data => setPerformance(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/student/dashboard/notifications", { credentials: "include" })
      .then(r => r.json())
      .then(data => setNotificationsData(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/student/dashboard/top-scores", { credentials: "include" })
      .then(r => r.json())
      .then(data => setTopScores(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/student/assignments/count", { credentials: "include" })
      .then(r => r.json())
      .then(data => { setAssignmentCount(data.count ?? 0); setAssignmentsLoaded(true); })
      .catch(() => { setAssignmentCount(0); setAssignmentsLoaded(true); });

    fetch("/api/student/dashboard/missions", { credentials: "include" })
      .then(r => r.json())
      .then(data => setMissions(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/student/dashboard/classes", { credentials: "include" })
      .then(r => r.json())
      .then(data => setMyClasses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [studentId]);

  const STATS = [
    {
      id: "assignments",
      label: "Pending",
      value: assignmentsLoaded ? (assignmentCount ?? 0).toString() : "0",
      icon: ClipboardList,
      color: "#E02424",
      bg: "rgba(224,36,36,0.12)",
      to: "/student/homework",
    },
    {
      id: "xp",
      label: "Total XP",
      value: xp.toLocaleString(),
      icon: Users,
      color: "#4A8FE7",
      bg: "rgba(74,143,231,0.12)",
      to: "/student/progress",
    },
    {
      id: "streak",
      label: "Day Streak",
      value: "5",
      icon: Flame,
      color: "#D4952A",
      bg: "rgba(212,149,42,0.12)",
      to: "/student/games",
    },
    {
      id: "badges",
      label: "Badges",
      value: "4",
      icon: Trophy,
      color: "#0E9F6E",
      bg: "rgba(14,159,110,0.12)",
      to: "/student/progress",
    },
  ];

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#EEF4FF" : "#0A1628";
  const textMuted = isDark ? "#7A9AC0" : "#536B8A";

  const [currentDate, setCurrentDate] = useState(new Date());

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }
  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  const { days: calendarDays, monthName, year } = generateCalendar(currentDate, schedules);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in main-content-padding">
      {/* ── HERO BANNER ── */}
      <div
        className="rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 text-white relative shadow-xl hover-glow"
        style={{ minHeight: "220px" }}
      >
        {/* Kids using the app — background photo */}
        <img
          src="/images/student-hero.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2447]/92 via-[#0F2447]/75 to-[#0F2447]/30" />

        <div className="relative z-10 flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-black backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#D4952A]" />
            <span>Welcome back, {displayName.split(" ")[0]}!</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            Ready for your next <br /> <span className="text-[#93C5FD]">learning adventure?</span>
          </h1>
          <p className="text-white/80 font-medium text-sm max-w-md">
            {assignmentsLoaded && assignmentCount === 0
              ? "You're all caught up! Great work."
              : `You have ${assignmentCount ?? 0} assignments and 3 missions in progress.`}
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0 flex flex-col items-center md:items-end gap-3 shrink-0">
          <div className="w-48 h-48 -mb-4 pointer-events-none" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))" }}>
            <RiveAnimation src="/riv-animations/22673-42423-for-education-purpose.riv" className="w-full h-full" />
          </div>
          <Link
            to="/student/tutor"
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-white shadow-lg backdrop-blur-md hover:scale-105 transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #4A8FE7, #1E5BBE)", textDecoration: "none" }}
          >
            <Bot className="w-4 h-4 text-white" />
            <span className="text-base">Ask Vive AI</span>
          </Link>
        </div>
      </div>

      {/* ── LEARNING MISSIONS SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,143,231,0.12)" }}>
              <Target className="w-4 h-4 text-[#4A8FE7]" />
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: textPrimary }}>Learning Missions</h2>
              <p className="text-xs font-bold" style={{ color: textMuted }}>Game-style progression</p>
            </div>
          </div>
          <Link to="/student/missions" className="text-xs font-black text-[#4A8FE7] flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-5">
          {missions.map((m) => (
            <div key={m.id} className="mission-card group overflow-hidden p-0">
              {/* Kids photo banner */}
              <div className="relative h-36 overflow-hidden rounded-t-[calc(1.5rem-1px)]">
                <img
                  src={MISSION_IMAGES[m.id] || m.image}
                  alt={m.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay gradient + title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-black text-sm text-white leading-tight">{m.title}</h3>
                  <p className="text-[11px] font-bold text-white/80 mt-0.5">
                    {m.currentStep ? `Now: ${m.currentStep}` : "Start your journey"}
                  </p>
                </div>
                {/* Progress badge */}
                <div
                  className="absolute top-2 right-2 text-white text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: m.color }}
                >
                  {m.progress}%
                </div>
              </div>

              {/* Progress bar + button */}
              <div className="p-3">
                <div className="flex items-center justify-between text-[10px] font-bold mb-1.5" style={{ color: textMuted }}>
                  <span>{m.completedSteps ?? 0}/{m.totalSteps ?? 4} steps</span>
                  <span style={{ color: m.color }}>{m.hasRealData ? "Real progress" : "Not started"}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.progress}%`, background: m.color }} />
                </div>
                <Link
                  to="/student/missions"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-white transition-all group-hover:scale-[1.02]"
                  style={{ background: m.color, textDecoration: "none" }}
                >
                  <Play className="w-3 h-3" /> {m.progress > 0 ? "Continue" : "Start"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <Link
              key={s.id}
              to={s.to}
              className="pro-card pro-card-hover glass-panel relative overflow-hidden flex flex-col hover-glow group p-5"
              style={{ textDecoration: "none", borderTop: `3px solid ${s.color}` }}
            >
              <div className="flex items-center gap-4 mt-1">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: s.bg }}
                >
                  <Icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: textMuted }}>{s.label}</p>
                  <h3 className="text-2xl font-black" style={{ color: textPrimary }}>{s.value}</h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── MY CLASSES & WELLNESS ROW ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Classes */}
        <div className="lg:col-span-2 pro-card glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-[#4A8FE7]" />
              <h3 className="text-base font-black" style={{ color: textPrimary }}>My Classes</h3>
            </div>
            <Link to="/student/classes" className="text-xs font-black text-[#4A8FE7] hover:underline">
              Manage
            </Link>
          </div>

          {myClasses.length === 0 ? (
            <EmptyState icon={School} title="No classes yet" subtitle="Your teacher will enroll you in classes." />
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {myClasses.map((cls, i) => {
                const colors = ["#4A8FE7", "#0E9F6E", "#D4952A", "#E02424", "#7C3AED"];
                const clr = colors[i % colors.length];
                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-2xl border transition-all hover:shadow-md"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                      borderColor: isDark ? "rgba(74,143,231,0.12)" : "#E2E8F0",
                      borderLeft: `3px solid ${clr}`
                    }}
                  >
                    <h4 className="font-bold text-sm" style={{ color: textPrimary }}>{cls.name}</h4>
                    <p className="text-xs font-medium mt-0.5" style={{ color: textMuted }}>{cls.teacherName}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── VIVE WELLBEING HUB ── */}
        <div className="pro-card glass-panel overflow-hidden">
          {/* Header gradient */}
          <div
            className="px-5 pt-5 pb-3"
            style={{ background: isDark ? "rgba(74,143,231,0.06)" : "rgba(74,143,231,0.04)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black" style={{ color: textPrimary }}>Vive Wellbeing</h3>
              {/* Streak counter */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: "rgba(212,149,42,0.12)", color: "#D4952A" }}>
                <Flame className="w-3 h-3" />
                <span>{Math.max(1, (xp > 0 ? Math.floor(xp / 50) % 14 : 1))}d streak</span>
              </div>
            </div>
            <p className="text-[11px] font-bold" style={{ color: textMuted }}>How are you feeling right now?</p>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Mood buttons — bigger, more visual */}
            <div className="grid grid-cols-5 gap-1.5">
              {MOODS.map((mood) => {
                const MIcon = mood.icon;
                const isSelected = selectedMood === mood.label;
                return (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMood(mood.label)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all cursor-pointer relative"
                    style={{
                      background: isSelected ? mood.color : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      border: `1.5px solid ${isSelected ? mood.color : "transparent"}`,
                      transform: isSelected ? "scale(1.08)" : "scale(1)",
                    }}
                    title={mood.label}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: isSelected ? "rgba(255,255,255,0.25)" : `${mood.color}18` }}
                    >
                      <MIcon className="w-5 h-5" style={{ color: isSelected ? "#FFFFFF" : mood.color }} />
                    </div>
                    <span className="text-[9px] font-black leading-tight" style={{ color: isSelected ? "white" : textMuted }}>
                      {mood.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* AI-personalised tip from Vive */}
            {selectedMood && (() => {
              const tips: Record<string, { msg: string; action: string; to: string; emoji: string }> = {
                "Great":    { msg: "Amazing energy! Channel it into a challenge.", action: "Try a Hard Quiz",   to: "/student/ai-quizzes", emoji: "🚀" },
                "Good":     { msg: "Good vibes! Perfect time for deep learning.",  action: "Open AI Tutor",   to: "/student/tutor",     emoji: "✨" },
                "Okay":     { msg: "Take it steady. A short video can help focus.", action: "Watch a Lecture", to: "/student/videos",    emoji: "📺" },
                "Tired":    { msg: "Rest is part of learning. A game can refresh!", action: "Play a Game",     to: "/student/games",     emoji: "🎮" },
                "Need Help":{ msg: "Vive is here for you. Let's talk it through.",  action: "Talk to Vive",   to: "/student/tutor",     emoji: "💙" },
              };
              const tip = tips[selectedMood];
              const moodData = MOODS.find(m => m.label === selectedMood)!;
              return (
                <div
                  className="rounded-2xl p-3 flex flex-col gap-2"
                  style={{ background: `${moodData.color}12`, border: `1px solid ${moodData.color}30` }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none">{tip.emoji}</span>
                    <p className="text-[11px] font-bold leading-snug" style={{ color: textPrimary }}>
                      <span className="font-black" style={{ color: moodData.color }}>Vive says: </span>
                      {tip.msg}
                    </p>
                  </div>
                  <Link
                    to={tip.to}
                    className="w-full text-center py-1.5 rounded-xl text-[11px] font-black text-white transition-all hover:opacity-90"
                    style={{ background: moodData.color, textDecoration: "none" }}
                  >
                    {tip.action} →
                  </Link>
                </div>
              );
            })()}

            {/* Quick wellbeing actions */}
            {!selectedMood && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: textMuted }}>Quick Actions</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Deep Breath", icon: "🌬️", desc: "30s calm" },
                    { label: "Daily Tip",   icon: "💡", desc: "From Vive" },
                  ].map(a => (
                    <div key={a.label} className="flex items-center gap-2 p-2 rounded-xl cursor-pointer hover:scale-[1.02] transition-all"
                      style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(74,143,231,0.06)" }}
                    >
                      <span className="text-base">{a.icon}</span>
                      <div>
                        <p className="text-[10px] font-black" style={{ color: textPrimary }}>{a.label}</p>
                        <p className="text-[9px]" style={{ color: textMuted }}>{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CALENDAR & LEADERBOARD ROW ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 pro-card glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-base" style={{ color: textPrimary }}>
              {monthName} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <span key={d} className="text-[10px] font-black uppercase text-slate-400 py-1">{d}</span>
            ))}
            {calendarDays.map((c, i) => (
              <div
                key={i}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  c.event === "today"
                    ? "bg-[#4A8FE7] text-white shadow-md font-black"
                    : c.event === "green-circle"
                    ? "bg-emerald-500/15 text-[#0E9F6E]"
                    : c.currentMonth
                    ? "hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "opacity-30"
                }`}
              >
                {c.day}
              </div>
            ))}
          </div>
        </div>

        {/* Top Scores / Leaderboard — real backend data */}
        <div className="pro-card glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4952A]" />
            <h3 className="font-black text-base" style={{ color: textPrimary }}>Top Learners</h3>
          </div>

          {topScores.length === 0 ? (
            <EmptyState icon={Trophy} title="No scores yet" subtitle="Be the first to earn XP!" />
          ) : (
            <div className="space-y-2.5">
              {topScores.map((lead: any) => (
                <div key={lead.name + lead.rank} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: lead.color }}
                    >
                      {lead.rank}
                    </span>
                    <span className="font-bold text-sm" style={{ color: textPrimary }}>{lead.name}</span>
                  </div>
                  <span className="text-xs font-black text-[#4A8FE7]">{lead.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
