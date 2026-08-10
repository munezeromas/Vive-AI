import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { SUBJECTS } from "@/lib/mock-data";
import { VIDEOS } from "@/lib/updated-videos";
import { Play, X, Star, Search, Filter, ExternalLink, AlertTriangle } from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/student/videos")({
  head: () => ({ meta: [{ title: "Videos — Vive AI" }] }),
  component: Videos,
});

const LEVELS = ["All", "P1", "P2", "P3", "P4", "P5", "P6"];

type VideoEntry = {
  id: string;
  title: string;
  subject: string;
  level?: string;
  duration?: string;
  teacherRecommended?: boolean;
  /** unique index within the full VIDEOS array, used as React key */
  _idx: number;
};

const isValidYouTubeId = (id: string) => /^[A-Za-z0-9_-]{11}$/.test(id);

function Videos() {
  const [filter, setFilter] = useState<string>("All");
  const [level, setLevel] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<VideoEntry | null>(null);
  const [embedError, setEmbedError] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted   = isDark ? "#94A3B8" : "#64748B";

  // Tag every video with its original index for a stable unique key
  const indexedVideos: VideoEntry[] = VIDEOS
    .filter((v) => isValidYouTubeId((v as any).id))
    .map((v, i) => ({ ...(v as any), _idx: i }));

  const list = indexedVideos.filter((v) => {
    const subjectMatch = filter === "All" || v.subject === filter;
    const levelMatch   = level === "All" || v.level === level;
    const searchMatch  = !search ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.subject.toLowerCase().includes(search.toLowerCase());
    return subjectMatch && levelMatch && searchMatch;
  });

  const openVideo = useCallback((v: VideoEntry) => {
    setEmbedError(false);
    setOpen(v);
  }, []);

  const closeVideo = useCallback(() => {
    setOpen(null);
    setEmbedError(false);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl pb-20 animate-fade-in main-content-padding">

      {/* ── HERO HEADER ── */}
      <div className="pro-card glass-panel hover-glow p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-sky-400/20 rounded-full filter blur-[80px] animate-pulse-glow" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(96,165,250,0.1))", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
            <RiveAnimation src="/riv-animations/24657-46067-medura-an-interactive-anatomy-experience.riv" className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: textPrimary }}>Video Library</h1>
            <p className="text-sm font-bold opacity-70" style={{ color: textMuted }}>Curated educational video lessons just for you</p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="pro-card glass-panel p-4 flex flex-col xl:flex-row gap-4 relative z-10">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" style={{ color: textMuted }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for lessons, topics..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-bold outline-none transition-all"
            style={{
              background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
              color: textPrimary,
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
            }}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
          {/* Subject filters */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl shrink-0" style={{ background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)", border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)" }}>
            {["All", ...SUBJECTS].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                style={{
                  background: filter === s ? "#5BA0E3" : "transparent",
                  color: filter === s ? "#FFF" : textMuted,
                  boxShadow: filter === s ? "0 4px 12px rgba(59,130,246,0.4)" : "none",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="w-px h-8 shrink-0 mx-1" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

          {/* Level filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest px-2" style={{ color: textMuted }}><Filter className="w-3 h-3 inline-block -mt-0.5 mr-1" /> Grade:</span>
            <div className="flex gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300"
                  style={{
                    background: level === l ? "rgba(59,130,246,0.15)" : (isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"),
                    color: level === l ? "#60A5FA" : textMuted,
                    border: level === l ? "1px solid rgba(59,130,246,0.3)" : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── VIDEO GRID ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {list.map((v) => (
          <button
            key={v._idx}
            onClick={() => openVideo(v)}
            className="text-left rounded-[24px] overflow-hidden group transition-all duration-500 hover:-translate-y-2 relative flex flex-col"
            style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
              boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.03)",
              animationDelay: `${v._idx * 0.02}s`
            }}
          >
            <div className="relative aspect-video bg-slate-800 overflow-hidden w-full shrink-0">
              <img
                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                alt={v.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback thumbnail if the YouTube ID is invalid
                  (e.currentTarget as HTMLImageElement).src =
                    `https://i.ytimg.com/vi/${v.id}/default.jpg`;
                }}
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="h-14 w-14 rounded-full flex items-center justify-center scale-90 group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm border border-white/30" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <Play className="h-6 w-6 text-white fill-white ml-1 drop-shadow-md" />
                </div>
              </div>

              {/* Subject tag */}
              <div className="absolute top-3 left-3">
                <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-white border border-white/10 shadow-sm">
                  {v.subject}
                </div>
              </div>

              {/* Duration */}
              {v.duration && (
                <div className="absolute bottom-3 right-3">
                  <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white tracking-widest">
                    {v.duration}
                  </div>
                </div>
              )}

              {/* Teacher Recommended Badge */}
              {v.teacherRecommended && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/90 backdrop-blur-md shadow-lg border border-amber-400/50">
                    <Star className="h-3 w-3 text-white fill-white" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Pick</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                {v.level && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                    style={{ background: isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.1)", color: "#60A5FA" }}
                  >
                    {v.level}
                  </span>
                )}
              </div>
              <div className="font-black text-base leading-tight mb-auto transition-colors group-hover:text-blue-400" style={{ color: textPrimary }}>
                {v.title}
              </div>
              <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: textMuted }}>
                  {v.subject}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                  Watch Now →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── VIDEO MODAL ── */}
      {open && typeof document !== "undefined" && createPortal(
        <>
          {/* Solid dark backdrop */}
          <div
            className="fixed inset-0 z-[200] bg-black/95 animate-fade-in"
            onClick={closeVideo}
            style={{ isolation: "isolate" }}
          />

          {/* Glassmorphic Top Control Bar — ALWAYS visible, completely outside the flex layout */}
          <div className="fixed top-0 left-0 right-0 h-20 z-[210] flex items-center justify-between px-6 bg-black/60 border-b border-white/10 backdrop-blur-md shadow-2xl animate-fade-in pointer-events-auto">
            {/* Title / Context Info */}
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-0.5">
                {open.subject}{open.level ? ` · Grade ${open.level}` : ""}
              </p>
              <h2 className="text-white font-black text-base truncate leading-tight">
                {open.title}
              </h2>
            </div>
            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Go Back / Close Button */}
              <button
                onClick={closeVideo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-red-600 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 cursor-pointer shadow-lg"
                aria-label="Go back"
              >
                <X className="h-3.5 w-3.5" />
                Go Back
              </button>
            </div>
          </div>

          {/* Modal content layer — centered massive player */}
          <div
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pt-24 pointer-events-none animate-fade-in"
          >
            {/* Inner player container */}
            <div className="w-full max-w-[94vw] h-[82vh] max-h-[82vh] rounded-[2rem] overflow-hidden bg-black shadow-[0_0_80px_rgba(59,130,246,0.3)] pointer-events-auto border border-white/10">
              {embedError ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-5 text-center p-8 bg-slate-950">
                  <AlertTriangle className="h-12 w-12 text-amber-400 opacity-80" />
                  <div>
                    <p className="text-white font-black text-xl mb-2">Embedding Disabled</p>
                    <p className="text-white/50 text-sm max-w-sm">
                      This video can't be played here. Watch it directly on YouTube.
                    </p>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${open.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg,#FF0000,#CC0000)" }}
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Watch on YouTube
                  </a>
                </div>
              ) : (
                <iframe
                  key={`video-${open._idx}`}
                  src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={open.title}
                  className="w-full h-full block"
                  style={{ border: "none", display: "block" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onError={() => setEmbedError(true)}
                />
              )}
            </div>
          </div>
        </>
        , document.body
      )}
    </div>
  );
}

