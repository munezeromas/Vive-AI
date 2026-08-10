import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  TrendingUp, Calendar, BookOpen, AlertCircle, Plus, Users, CheckCircle, Award
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/parent/")({
  head: () => ({ meta: [{ title: "Parent Dashboard — Vive AI" }] }),
  component: ParentDashboard,
});

const MOCK_PARENT_ID = "parent-demo-123";

function ParentDashboard() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const isDark = theme === "dark";

  const parentId = session?.user?.id || MOCK_PARENT_ID;

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childProgress, setChildProgress] = useState<any>(null);
  
  // Link student form
  const [studentIdInput, setStudentIdInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [linking, setLinking] = useState(false);

  const fetchChildren = async () => {
    try {
      const res = await fetch(`/api/parent/students?parentId=${parentId}`);
      if (res.ok) {
        const data = await res.json();
        setChildren(data);
        if (data.length > 0 && !selectedChildId) {
          setSelectedChildId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch children", err);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [parentId]);

  useEffect(() => {
    if (selectedChildId) {
      const fetchChildProgress = async () => {
        try {
          const res = await fetch(`/api/parent/student/${selectedChildId}/progress`);
          if (res.ok) {
            const data = await res.json();
            setChildProgress(data);
          }
        } catch (err) {
          console.error("Failed to fetch child progress", err);
        }
      };
      fetchChildProgress();
    } else {
      setChildProgress(null);
    }
  }, [selectedChildId]);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError("");
    setLinkSuccess("");
    setLinking(true);

    try {
      const res = await fetch("/api/parent/link-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId,
          studentIdentifier: studentIdInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLinkSuccess(`Successfully linked to ${data.student.name}!`);
        setStudentIdInput("");
        fetchChildren();
      } else {
        setLinkError(data.error || "Failed to link student. Make sure the ID or email is correct.");
      }
    } catch (err) {
      setLinkError("Server error linking student.");
    } finally {
      setLinking(false);
    }
  };

  const selectedChild = children.find(c => c.id === selectedChildId);

  const textPrimary = isDark ? "#F3F4F6" : "#065F46";
  const textMuted = isDark ? "#9CA3AF" : "#4B5563";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const cardBorder = isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #D1FAE5";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER CARD */}
      <div
        className="rounded-[24px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div>
          <h1 className="text-2xl font-black" style={{ color: textPrimary }}>Parent Portal</h1>
          <p className="text-sm font-medium mt-1" style={{ color: textMuted }}>
            Monitor your children's learning activities, homework, grades, and strengths.
          </p>
        </div>

        {/* Child selection dropdown */}
        {children.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: textMuted }}>Viewing:</span>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-3 py-2 text-sm font-bold rounded-xl outline-none border bg-transparent"
              style={{ color: textPrimary, borderColor: isDark ? "rgba(16,185,129,0.3)" : "#D1FAE5" }}
            >
              {children.map(c => (
                <option key={c.id} value={c.id} style={{ background: cardBg }}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* LEFT PANEL: CHILD ANALYTICS */}
        <div className="space-y-6">
          {children.length === 0 ? (
            <div
              className="rounded-[24px] p-12 text-center border"
              style={{ background: cardBg, borderColor: cardBorder }}
            >
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-lg font-black" style={{ color: textPrimary }}>No students linked yet</h3>
              <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: textMuted }}>
                Link your child's student account to view their academic dashboard and direct reports.
              </p>
            </div>
          ) : selectedChild ? (
            <>
              {/* CHILD SUMMARY CARDS */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="rounded-2xl p-4 border text-center"
                  style={{ background: cardBg, borderColor: cardBorder }}
                >
                  <BookOpen className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs font-bold text-slate-400">Submissions</p>
                  <p className="text-lg font-black" style={{ color: textPrimary }}>
                    {childProgress?.submissions?.length || 0}
                  </p>
                </div>
                <div
                  className="rounded-2xl p-4 border text-center"
                  style={{ background: cardBg, borderColor: cardBorder }}
                >
                  <Award className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs font-bold text-slate-400">Quizzes Taken</p>
                  <p className="text-lg font-black" style={{ color: textPrimary }}>
                    {childProgress?.quizzes?.length || 0}
                  </p>
                </div>
                <div
                  className="rounded-2xl p-4 border text-center"
                  style={{ background: cardBg, borderColor: cardBorder }}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs font-bold text-slate-400">Level / XP</p>
                  <p className="text-lg font-black" style={{ color: textPrimary }}>
                    {selectedChild.level || 1} / {selectedChild.xp || 0}
                  </p>
                </div>
              </div>

              {/* RECENT SUBMISSIONS TABLE */}
              <div
                className="rounded-[24px] p-5 border"
                style={{ background: cardBg, borderColor: cardBorder }}
              >
                <h3 className="text-sm font-black flex items-center gap-2 mb-3" style={{ color: textPrimary }}>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Homework Submissions
                </h3>
                {childProgress?.submissions?.length === 0 ? (
                  <p className="text-xs py-6 text-center" style={{ color: textMuted }}>No homework submitted yet.</p>
                ) : (
                  <div className="divide-y divide-emerald-100/10">
                    {childProgress?.submissions?.map((sub: any) => (
                      <div key={sub.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-black" style={{ color: textPrimary }}>Assignment ID: {sub.assignmentId.substring(0, 8)}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                            Score: {sub.markReceived !== null ? `${sub.markReceived} pts` : "Grading..."}
                          </span>
                          {sub.feedback && (
                            <p className="text-[10px] mt-1 italic max-w-xs truncate" style={{ color: textMuted }}>
                              Feedback: {sub.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT QUIZZES */}
              <div
                className="rounded-[24px] p-5 border"
                style={{ background: cardBg, borderColor: cardBorder }}
              >
                <h3 className="text-sm font-black flex items-center gap-2 mb-3" style={{ color: textPrimary }}>
                  <Award className="w-4 h-4 text-emerald-500" />
                  Quiz Results
                </h3>
                {childProgress?.quizzes?.length === 0 ? (
                  <p className="text-xs py-6 text-center" style={{ color: textMuted }}>No quizzes taken yet.</p>
                ) : (
                  <div className="divide-y divide-emerald-100/10">
                    {childProgress?.quizzes?.map((res: any) => (
                      <div key={res.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-black" style={{ color: textPrimary }}>Quiz Completed</p>
                          <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                            Date: {new Date(res.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                          Score: {res.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* RIGHT PANEL: LINKING STUDENTS & ACTION PANEL */}
        <div className="space-y-6">
          {/* LINK STUDENT FORM */}
          <div
            className="rounded-[24px] p-5 border"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <h3 className="text-sm font-black flex items-center gap-2 mb-3" style={{ color: textPrimary }}>
              <Plus className="w-4 h-4 text-emerald-500" />
              Link a Student
            </h3>
            <p className="text-xs mb-4" style={{ color: textMuted }}>
              Enter your child's email or VIVE ID (e.g. VIVE-1234-5678) to view their reports.
            </p>

            <form onSubmit={handleLinkStudent} className="space-y-3">
              {linkError && (
                <div className="flex gap-1.5 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-150">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="font-bold">{linkError}</span>
                </div>
              )}
              {linkSuccess && (
                <div className="flex gap-1.5 p-2.5 rounded-xl bg-green-50 text-green-700 text-xs border border-green-150">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="font-bold">{linkSuccess}</span>
                </div>
              )}

              <input
                type="text"
                placeholder="VIVE-XXXX-YYYYY or email"
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-transparent"
                style={{ borderColor: isDark ? "rgba(16,185,129,0.3)" : "#D1FAE5", color: textPrimary }}
                value={studentIdInput}
                onChange={e => setStudentIdInput(e.target.value)}
              />

              <button
                type="submit"
                disabled={linking || !studentIdInput.trim()}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all active:scale-[0.98]"
              >
                {linking ? "Linking..." : "Link Student"}
              </button>
            </form>
          </div>

          {/* ACTIVE STUDENTS LIST */}
          <div
            className="rounded-[24px] p-5 border"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <h3 className="text-sm font-black flex items-center gap-2 mb-3" style={{ color: textPrimary }}>
              <Users className="w-4 h-4 text-emerald-500" />
              Your Children
            </h3>
            {children.length === 0 ? (
              <p className="text-xs text-center py-4 text-slate-400">No linked students</p>
            ) : (
              <div className="space-y-2">
                {children.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChildId(c.id)}
                    className="p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors"
                    style={{
                      borderColor: selectedChildId === c.id ? "#10B981" : "transparent",
                      background: selectedChildId === c.id ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.02)"
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-xs">
                      {c.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-none truncate" style={{ color: textPrimary }}>{c.name}</p>
                      <p className="text-[9px] mt-1 text-slate-400">{c.grade || 'P6'} Student</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
