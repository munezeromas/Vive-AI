import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ASSIGNMENTS } from "@/lib/mock-data";
import {
  Plus, Search, Edit2, Trash2, CheckCircle, Clock, Users
} from "lucide-react";

export const Route = createFileRoute("/teacher/assignments-management")({
  head: () => ({ meta: [{ title: "Assignments — Vive AI" }] }),
  component: AssignmentsManagement,
});

type Assignment = typeof ASSIGNMENTS[0];

function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>(ASSIGNMENTS);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "", subject: "", grade: "", dueDate: "", students: 0
  });

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(q.toLowerCase()) ||
    a.subject.toLowerCase().includes(q.toLowerCase())
  );

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;
    const newAssignment: Assignment = {
      id: assignments.length + 1,
      title: formData.title,
      subject: formData.subject || "General",
      grade: formData.grade || "P6",
      dueDate: formData.dueDate,
      students: formData.students || 8,
      submitted: 0,
      status: "active",
    };
    setAssignments([...assignments, newAssignment]);
    setFormData({ title: "", subject: "", grade: "", dueDate: "", students: 0 });
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          📋 Assignments & Tasks
        </h1>
        <p className="text-muted-foreground mt-1">Create, manage, and track student assignments</p>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Total</p>
          <p className="text-3xl font-bold">{assignments.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Active</p>
          <p className="text-3xl font-bold text-sky-500">{assignments.filter(a => a.status === "active").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600">{assignments.filter(a => a.status === "pending_review").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">{assignments.filter(a => a.status === "completed").length}</p>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or subject..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      {/* ── ADD FORM ── */}
      {showForm && (
        <form onSubmit={handleAddAssignment} className="rounded-xl border bg-card p-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-lg">Create New Assignment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Assignment Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2 md:col-span-2"
              required
            />
            <input
              placeholder="Subject (e.g., Math)"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
            />
            <input
              placeholder="Grade (e.g., P6)"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
            />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Number of Students"
              value={formData.students || ""}
              onChange={(e) => setFormData({ ...formData, students: Number(e.target.value) })}
              className="rounded-lg border bg-background px-3 py-2"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold"
            >
              Create Assignment
            </button>
          </div>
        </form>
      )}

      {/* ── ASSIGNMENTS LIST ── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No assignments found
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {filtered.map(a => {
              const progressPct = a.students > 0 ? Math.round((a.submitted / a.students) * 100) : 0;
              const statusColors = {
                active: "bg-sky-400/10 text-sky-600 border border-blue-200",
                pending_review: "bg-yellow-500/10 text-yellow-700 border border-yellow-200",
                completed: "bg-green-500/10 text-green-700 border border-green-200"
              };
              return (
                <div key={a.id} className="rounded-lg border bg-muted/40 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-64">
                      <h3 className="font-bold text-lg">{a.title}</h3>
                      <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-semibold">{a.subject}</span>
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-semibold">{a.grade}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[a.status as keyof typeof statusColors]}`}>
                        {a.status === "active" ? "Active" : a.status === "pending_review" ? "Review" : "Done"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Submission Progress</p>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-500" style={{ width: `${progressPct}%` }} />
                      </div>
                      <p className="text-xs mt-1">{a.submitted} of {a.students} submitted ({progressPct}%)</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{a.students} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Due: {a.dueDate}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2 justify-end">
                    <button className="px-3 py-1 text-xs font-semibold rounded hover:bg-muted transition-colors">
                      <Edit2 className="w-4 h-4 inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-3 py-1 text-xs font-semibold rounded text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

