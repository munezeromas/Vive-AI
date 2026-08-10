import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Calendar, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/parent/attendance")({
  head: () => ({ meta: [{ title: "Attendance Tracking — Vive AI" }] }),
  component: ParentAttendance,
});

const MOCK_PARENT_ID = "parent-demo-123";

function ParentAttendance() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const isDark = theme === "dark";

  const parentId = session?.user?.id || MOCK_PARENT_ID;

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch(`/api/parent/students?parentId=${parentId}`);
        if (res.ok) {
          const data = await res.json();
          setChildren(data);
          if (data.length > 0) {
            setSelectedChildId(data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChildren();
  }, [parentId]);

  useEffect(() => {
    if (selectedChildId) {
      const fetchAttendance = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/parent/student/${selectedChildId}/progress`);
          if (res.ok) {
            const data = await res.json();
            setAttendanceRecords(data.attendance || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAttendance();
    }
  }, [selectedChildId]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  // Statistics calculation
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === "present").length;
  const absentDays = attendanceRecords.filter(r => r.status === "absent").length;
  const tardyDays = attendanceRecords.filter(r => r.status === "tardy").length;

  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const textPrimary = isDark ? "#F3F4F6" : "#065F46";
  const textMuted = isDark ? "#9CA3AF" : "#4B5563";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const cardBorder = isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #D1FAE5";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div
        className="rounded-[24px] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: textPrimary }}>
            <Calendar className="w-6 h-6 text-emerald-500" />
            Attendance Tracking
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: textMuted }}>
            Verify your child's daily class attendance and view attendance analytics.
          </p>
        </div>

        {children.length > 0 && (
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-2 text-sm font-bold rounded-xl border bg-transparent"
            style={{ color: textPrimary, borderColor: isDark ? "rgba(16,185,129,0.3)" : "#D1FAE5" }}
          >
            {children.map(c => (
              <option key={c.id} value={c.id} style={{ background: cardBg }}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {children.length === 0 ? (
        <div className="rounded-[24px] p-12 text-center border" style={{ background: cardBg, borderColor: cardBorder }}>
          <p className="text-sm font-semibold" style={{ color: textMuted }}>Please link your child first to track attendance.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          {/* STATS PANEL */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 border text-center"
              style={{ background: cardBg, borderColor: cardBorder }}
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
              <h2 className="text-4xl font-black mt-2 text-emerald-600">{attendanceRate}%</h2>
              <div className="mt-4 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>

            <div
              className="rounded-2xl p-4 border space-y-3"
              style={{ background: cardBg, borderColor: cardBorder }}
            >
              <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: textPrimary }}>Breakdown</h4>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: textMuted }}>
                  <CheckCircle className="w-4 h-4 text-green-500" /> Present
                </span>
                <span className="font-black" style={{ color: textPrimary }}>{presentDays} days</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: textMuted }}>
                  <XCircle className="w-4 h-4 text-red-500" /> Absent
                </span>
                <span className="font-black" style={{ color: textPrimary }}>{absentDays} days</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: textMuted }}>
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Tardy
                </span>
                <span className="font-black" style={{ color: textPrimary }}>{tardyDays} days</span>
              </div>
            </div>
          </div>

          {/* RECORDS LIST */}
          <div
            className="rounded-[24px] p-5 border"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <h3 className="text-sm font-black mb-4" style={{ color: textPrimary }}>Attendance History</h3>
            {loading ? (
              <p className="text-xs py-10 text-center" style={{ color: textMuted }}>Loading attendance records...</p>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-xs">No attendance entries recorded yet for {selectedChild?.name}.</p>
                <p className="text-[10px] mt-1">Attendance will appear here once entered by teachers.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ borderBottom: isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #D1FAE5" }}>
                      <th className="pb-2 font-black" style={{ color: textPrimary }}>Date</th>
                      <th className="pb-2 font-black" style={{ color: textPrimary }}>Class ID</th>
                      <th className="pb-2 font-black" style={{ color: textPrimary }}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/10">
                    {attendanceRecords.map((rec: any) => {
                      let badgeStyle = "bg-green-50 text-green-700 border-green-150";
                      if (rec.status === "absent") badgeStyle = "bg-red-50 text-red-700 border-red-150";
                      if (rec.status === "tardy") badgeStyle = "bg-amber-50 text-amber-700 border-amber-150";
                      
                      return (
                        <tr key={rec.id} className="hover:bg-slate-500/5">
                          <td className="py-3 font-semibold" style={{ color: textPrimary }}>
                            {new Date(rec.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 font-semibold" style={{ color: textMuted }}>
                            {rec.classId.substring(0, 8)}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${badgeStyle}`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
