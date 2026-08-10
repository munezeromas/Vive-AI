import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Bell, CheckCircle, BookOpen, Award } from "lucide-react";

export const Route = createFileRoute("/student/planner")({
  head: () => ({ meta: [{ title: "Study Planner — Vive AI" }] }),
  component: Planner,
});

// ── Types ───────────────────────────────────────────────────────────────────
type EventColor = "green" | "blue" | "purple" | "orange" | "red" | "yellow";
interface CalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  color: EventColor;
  type: "task" | "assignment" | "exam" | "reminder";
  done: boolean;
  mark?: number | null; // marks if teacher collected
  dueNotified?: boolean;
}

const COLOR_MAP: Record<EventColor, { bg: string; text: string; border: string; dot: string }> = {
  green:  { bg: "rgba(0,195,107,0.12)",  text: "#00C36B", border: "rgba(0,195,107,0.2)",  dot: "#00C36B" },
  blue:   { bg: "rgba(99,102,241,0.12)", text: "#818CF8", border: "rgba(99,102,241,0.2)", dot: "#818CF8" },
  purple: { bg: "rgba(168,85,247,0.12)", text: "#C084FC", border: "rgba(168,85,247,0.2)", dot: "#C084FC" },
  orange: { bg: "rgba(249,115,22,0.12)", text: "#FB923C", border: "rgba(249,115,22,0.2)", dot: "#FB923C" },
  red:    { bg: "rgba(239,68,68,0.12)",  text: "#F87171", border: "rgba(239,68,68,0.2)",  dot: "#F87171" },
  yellow: { bg: "rgba(234,179,8,0.12)",  text: "#FACC15", border: "rgba(234,179,8,0.2)",  dot: "#FACC15" },
};


const TYPE_ICONS: Record<string, any> = {
  task: BookOpen,
  assignment: Award,
  exam: Award,
  reminder: Bell,
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function todayStr() {
  return new Date().toISOString().slice(0,10);
}
function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function usePersistEvents() {
  const [events, setEvents] = useState<CalEvent[]>(() => {
    try {
      const saved = localStorage.getItem("vive_cal_events");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem("vive_cal_events", JSON.stringify(events));
  }, [events]);
  return [events, setEvents] as const;
}

// ── Notification Toast ──────────────────────────────────────────────────────
function NotifToast({ events, onDismiss }: { events: CalEvent[]; onDismiss: (id: string) => void }) {
  const today = todayStr();
  const due = events.filter(e => !e.done && e.date === today);
  if (!due.length) return null;
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-xs">
      {due.map(e => {
        const c = COLOR_MAP[e.color];
        return (
          <div key={e.id} className="flex items-start gap-3 rounded-2xl p-4 shadow-2xl"
               style={{ background: "#0E1524", border: `1px solid ${c.border}` }}>
            <Bell className="h-4 w-4 shrink-0 mt-0.5" style={{ color: c.dot }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{e.title}</p>
              <p className="text-[10px]" style={{ color: "#7B8DB0" }}>Due today!</p>
            </div>
            <button onClick={() => onDismiss(e.id)} className="shrink-0 opacity-40 hover:opacity-100 transition-opacity">
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Add/Edit Modal ──────────────────────────────────────────────────────────
function EventModal({ initial, onSave, onClose }: {
  initial: Partial<CalEvent> & { date: string };
  onSave: (e: CalEvent) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [color, setColor] = useState<EventColor>(initial.color ?? "green");
  const [type, setType] = useState(initial.type ?? "task");
  const [date, setDate] = useState(initial.date);
  const [mark, setMark] = useState<string>(initial.mark != null ? String(initial.mark) : "");

  const save = () => {
    if (!title.trim()) return;
    onSave({
      id: initial.id ?? crypto.randomUUID(),
      title: title.trim(),
      date,
      color,
      type: type as any,
      done: initial.done ?? false,
      mark: mark !== "" ? Number(mark) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
         onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl p-6 space-y-5"
           style={{ background: "#0E1524", border: "1px solid rgba(255,255,255,0.08)" }}
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">{initial.id ? "Edit Event" : "Add Event"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition"><X className="h-4 w-4 text-white/60" /></button>
        </div>

        {/* Title */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Title</label>
          <input
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#00C36B]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            placeholder="e.g. Math assignment due"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Date</label>
          <input
            type="date"
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00C36B]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", colorScheme: "dark" }}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Type</label>
          <div className="flex gap-2 flex-wrap">
            {(["task","assignment","exam","reminder"] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all"
                style={{
                  background: type === t ? "rgba(0,195,107,0.2)" : "rgba(255,255,255,0.05)",
                  color: type === t ? "#00C36B" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${type === t ? "rgba(0,195,107,0.5)" : "transparent"}`
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Colour</label>
          <div className="flex gap-2">
            {(Object.keys(COLOR_MAP) as EventColor[]).map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full transition-all"
                style={{
                  background: COLOR_MAP[c].dot,
                  boxShadow: color === c ? `0 0 0 3px rgba(255,255,255,0.3), 0 0 12px ${COLOR_MAP[c].dot}` : "none",
                  transform: color === c ? "scale(1.2)" : "scale(1)"
                }} />
            ))}
          </div>
        </div>

        {/* Mark (optional) */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Mark (if collected by teacher)</label>
          <input
            type="number"
            min={0} max={100}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#00C36B]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            placeholder="e.g. 85"
            value={mark}
            onChange={e => setMark(e.target.value)}
          />
        </div>

        <button onClick={save}
          className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #00C36B, #00956E)", boxShadow: "0 0 20px rgba(0,195,107,0.3)" }}>
          {initial.id ? "Save Changes" : "Add to Calendar"}
        </button>
      </div>
    </div>
  );
}

// ── Main Calendar ────────────────────────────────────────────────────────────
function Planner() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = usePersistEvents();
  const [modal, setModal] = useState<null | (Partial<CalEvent> & { date: string })>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month+1, 0);
  // Monday-first: 0=Mon..6=Sun
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (d: number) => {
    const dateStr = ymd(year, month, d);
    return events.filter(e => e.date === dateStr);
  };

  const toggleDone = (id: string) => {
    setEvents(ev => ev.map(e => e.id === id ? { ...e, done: !e.done } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(ev => ev.filter(e => e.id !== id));
  };

  const saveEvent = (e: CalEvent) => {
    setEvents(ev => {
      const idx = ev.findIndex(x => x.id === e.id);
      if (idx >= 0) { const n = [...ev]; n[idx] = e; return n; }
      return [...ev, e];
    });
    setModal(null);
  };

  const dismissNotif = (id: string) => setDismissed(d => [...d, id]);
  const visibleNotifEvents = events.filter(e => !dismissed.includes(e.id));

  const today = todayStr();

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      <NotifToast events={visibleNotifEvents} onDismiss={dismissNotif} />
      {modal && <EventModal initial={modal} onSave={saveEvent} onClose={() => setModal(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Study <span style={{ color: "#00C36B" }}>Planner</span></h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: "#7B8DB0" }}>Colour-coded calendar · Marks tracker · Due alerts</p>
        </div>
        <button
          onClick={() => setModal({ date: today })}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #00C36B, #00956E)", boxShadow: "0 0 20px rgba(0,195,107,0.3)" }}>
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {/* Calendar card */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "#0E1524", border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 transition text-white/60 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-black text-white">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 transition text-white/60 hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest" style={{ color: "#7B8DB0" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dateStr = day ? ymd(year, month, day) : "";
            const dayEvents = day ? eventsForDay(day) : [];
            const isToday = dateStr === today;
            const hasDue = dayEvents.some(e => !e.done);

            return (
              <div
                key={idx}
                onClick={() => day && setModal({ date: dateStr })}
                className="min-h-[110px] p-2 cursor-pointer transition-all group relative"
                style={{
                  border: "1px solid rgba(255,255,255,0.04)",
                  background: isToday ? "rgba(0,195,107,0.05)" : day ? "transparent" : "rgba(0,0,0,0.15)"
                }}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm font-black w-7 h-7 flex items-center justify-center rounded-full transition-all group-hover:bg-white/10"
                        style={{
                          color: isToday ? "#00C36B" : "rgba(255,255,255,0.8)",
                          background: isToday ? "rgba(0,195,107,0.2)" : "transparent",
                          boxShadow: isToday ? "0 0 12px rgba(0,195,107,0.4)" : "none"
                        }}>
                        {day}
                      </span>
                      {hasDue && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F87171] shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(e => {
                        const c = COLOR_MAP[e.color];
                        const Icon = TYPE_ICONS[e.type];
                        return (
                          <div
                            key={e.id}
                            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold truncate"
                            style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, opacity: e.done ? 0.45 : 1 }}
                            onClick={ev => { ev.stopPropagation(); setModal({ ...e }); }}>
                            <Icon className="h-2.5 w-2.5 shrink-0" />
                            <span className={`truncate ${e.done ? "line-through" : ""}`}>{e.title}</span>
                            {e.mark != null && (
                              <span className="ml-auto shrink-0 font-black" style={{ color: c.dot }}>{e.mark}%</span>
                            )}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] font-black uppercase tracking-wide px-1" style={{ color: "#7B8DB0" }}>
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming / Due Soon panel */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Due soon */}
        <div className="rounded-3xl p-5 space-y-3" style={{ background: "#0E1524", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#7B8DB0" }}>⚡ Due Soon</h3>
          {events
            .filter(e => !e.done && e.date >= today)
            .sort((a,b) => a.date.localeCompare(b.date))
            .slice(0, 5)
            .map(e => {
              const c = COLOR_MAP[e.color];
              return (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{e.title}</p>
                    <p className="text-[10px] font-bold" style={{ color: "#7B8DB0" }}>{e.date}</p>
                  </div>
                  <button onClick={() => toggleDone(e.id)} title="Mark done" className="shrink-0 opacity-40 hover:opacity-100 transition">
                    <CheckCircle className="h-5 w-5 text-[#00C36B]" />
                  </button>
                  <button onClick={() => deleteEvent(e.id)} title="Delete" className="shrink-0 opacity-30 hover:opacity-100 transition">
                    <X className="h-4 w-4 text-[#F87171]" />
                  </button>
                </div>
              );
            })}
          {events.filter(e => !e.done && e.date >= today).length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "#7B8DB0" }}>No upcoming events 🎉</p>
          )}
        </div>

        {/* Marks */}
        <div className="rounded-3xl p-5 space-y-3" style={{ background: "#0E1524", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#7B8DB0" }}>🏅 Marks Received</h3>
          {events
            .filter(e => e.mark != null)
            .sort((a,b) => b.date.localeCompare(a.date))
            .slice(0, 5)
            .map(e => {
              const c = COLOR_MAP[e.color];
              const grade = e.mark! >= 80 ? "A" : e.mark! >= 65 ? "B" : e.mark! >= 50 ? "C" : "D";
              return (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: c.bg, color: c.text }}>
                    {grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{e.title}</p>
                    <p className="text-[10px] font-bold" style={{ color: "#7B8DB0" }}>{e.date}</p>
                  </div>
                  <span className="text-xl font-black" style={{ color: c.dot }}>{e.mark}%</span>
                </div>
              );
            })}
          {events.filter(e => e.mark != null).length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "#7B8DB0" }}>No marks entered yet</p>
          )}
        </div>
      </div>
    </div>
  );
}