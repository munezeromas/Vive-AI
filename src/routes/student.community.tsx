import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { COMMUNITY_POSTS } from "@/lib/mock-data";
import { Heart, Send, Users, Sparkles, MessageSquare, TrendingUp } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/student/community")({
  head: () => ({ meta: [{ title: "Community — Vive AI" }] }),
  component: Community,
});

const AVATAR_COLORS = [
  "linear-gradient(135deg, #6366F1, #4F46E5)",
  "linear-gradient(135deg, #10B981, #059669)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #8B5CF6, #7C3AED)",
  "linear-gradient(135deg, #EF4444, #DC2626)",
];

const REACTION_EMOJIS = ["❤️", "🌟", "🔥", "👏", "🎉"];

const TRENDING_TOPICS = [
  { tag: "#MathTips", count: 42 },
  { tag: "#ScienceFun", count: 31 },
  { tag: "#StudyHack", count: 28 },
];

function Community() {
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [text, setText] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";

  const post = () => {
    if (!text.trim()) return;
    setPosts([{ user: "You", msg: text, likes: 0 }, ...posts]);
    setText("");
  };

  const like = (i: number) =>
    setPosts(posts.map((p, idx) => (idx === i ? { ...p, likes: p.likes + 1 } : p)));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in main-content-padding">

      {/* ── HEADER ── */}
      <div className="pro-card glass-panel p-6 flex flex-col md:flex-row items-start md:items-center gap-5 relative overflow-hidden hover-glow">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-[60px] animate-pulse-glow" />
        <div
          className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl relative z-10 shadow-lg"
          style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
        >
          👥
        </div>
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Student Hub</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: textPrimary }}>Motivation Wall</h1>
          <p className="text-sm font-medium mt-0.5" style={{ color: textMuted }}>
            Share encouragement with your classmates! 🌟
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm relative z-10"
          style={{ background: "rgba(99,102,241,0.12)", color: "var(--primary)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <Users className="w-4 h-4" />
          {posts.length} posts
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        {/* ── MAIN FEED ── */}
        <div className="space-y-4">

          {/* Compose box */}
          <div className="pro-card glass-panel p-5 hover-glow">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shadow-md shrink-0"
                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
              >
                Y
              </div>
              <span className="font-black text-sm" style={{ color: textPrimary }}>You</span>
            </div>
            <div className="flex gap-3 items-end">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    post();
                  }
                }}
                placeholder="Say something kind or motivating... 😊"
                rows={2}
                className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold resize-none outline-none transition-all"
                style={{
                  background: "var(--muted)",
                  color: textPrimary,
                  border: "2px solid var(--border)",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-glow)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                id="community-compose"
              />
              <button
                onClick={post}
                disabled={!text.trim()}
                className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, var(--primary), #6366F1)", color: "#fff", boxShadow: text.trim() ? "0 4px 16px rgba(79,70,229,0.4)" : "none" }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Posts feed */}
          {posts.length === 0 ? (
            <div className="pro-card glass-panel p-12 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-black mb-2" style={{ color: textPrimary }}>Be the first to post!</h3>
              <p className="text-sm font-medium" style={{ color: textMuted }}>Share something encouraging to start the wall!</p>
            </div>
          ) : (
            posts.map((p, i) => {
              const avatarGrad = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div
                  key={i}
                  className="pro-card glass-panel p-5 group animate-fade-in hover-glow"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base shadow-md shrink-0"
                      style={{ background: avatarGrad, border: "2px solid var(--card)" }}
                    >
                      {p.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-sm" style={{ color: textPrimary }}>{p.user}</span>
                        <span className="text-xs font-medium" style={{ color: textMuted }}>• just now</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: textMuted }}>{p.msg}</p>

                      {/* Reactions */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => like(i)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: p.likes > 0 ? "rgba(239,68,68,0.1)" : "var(--muted)",
                            color: p.likes > 0 ? "#EF4444" : textMuted,
                            border: `2px solid ${p.likes > 0 ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                          }}
                        >
                          <Heart className={`w-3.5 h-3.5 ${p.likes > 0 ? "fill-red-500" : ""}`} style={{ color: p.likes > 0 ? "#EF4444" : textMuted }} />
                          {p.likes > 0 ? p.likes : "Like"}
                        </button>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => like(i)}
                              className="text-base hover:scale-125 transition-transform active:scale-95"
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-4">
          {/* Trending topics */}
          <div className="pro-card glass-panel p-5 hover-glow">
            <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={{ color: textPrimary }}>
              <TrendingUp className="w-4 h-4" style={{ color: "var(--primary)" }} />
              Trending Topics
            </h3>
            <div className="space-y-2">
              {TRENDING_TOPICS.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl transition-all hover:bg-[var(--muted)] cursor-pointer">
                  <span className="text-sm font-black" style={{ color: "var(--primary)" }}>{t.tag}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: textMuted }}>{t.count} posts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kindness Challenge */}
          <div className="pro-card glass-panel p-5 relative overflow-hidden hover-glow" style={{ background: "rgba(245,158,11,0.04)" }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400/10 rounded-full filter blur-[20px]" />
            <div className="flex items-start gap-3 relative z-10">
              <span className="text-3xl">💡</span>
              <div>
                <p className="text-xs font-black mb-1" style={{ color: "#F59E0B" }}>Kindness Challenge</p>
                <p className="text-xs font-medium leading-relaxed" style={{ color: textMuted }}>
                  Post one encouraging message every day to keep your classmates motivated! Earn the{" "}
                  <span className="font-black" style={{ color: "#F59E0B" }}>⭐ Kindness Badge</span> after 7 days.
                </p>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: textMuted }}>
                <span>Your progress</span>
                <span style={{ color: "#F59E0B" }}>3/7 days</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                <div className="h-full rounded-full" style={{ width: "43%", background: "linear-gradient(90deg, #F59E0B, #D97706)", boxShadow: "0 0 8px rgba(245,158,11,0.4)" }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="pro-card glass-panel p-5 hover-glow">
            <h3 className="text-sm font-black mb-3" style={{ color: textPrimary }}>
              <MessageSquare className="w-4 h-4 inline mr-2" style={{ color: "var(--primary)" }} />
              Community Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Active Today", val: "128", color: "#10B981" },
                { label: "Posts Today", val: "47", color: "#6366F1" },
                { label: "Likes Given", val: "312", color: "#EF4444" },
                { label: "Top Streak", val: "21d", color: "#F59E0B" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-2xl text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                  <p className="text-lg font-black" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: textMuted }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
