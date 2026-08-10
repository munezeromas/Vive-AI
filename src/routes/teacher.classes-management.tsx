import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CLASSES } from "@/lib/mock-data";
import {
  Plus, Search, Edit2, Trash2, Users, Clock, MapPin
} from "lucide-react";

export const Route = createFileRoute("/teacher/classes-management")({
  head: () => ({ meta: [{ title: "Classes — Vive AI" }] }),
  component: ClassesManagement,
});

type Class = typeof CLASSES[0];

function ClassesManagement() {
  const [classes, setClasses] = useState<Class[]>(CLASSES);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", grade: "", students: 0, room: "", schedule: ""
  });

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.grade.toLowerCase().includes(q.toLowerCase())
  );

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.grade) return;
    const newClass: Class = {
      id: classes.length + 1,
      name: formData.name,
      grade: formData.grade,
      students: formData.students || 25,
      teacher: "Mrs. Mukamana",
      room: formData.room || "Room TBA",
      schedule: formData.schedule || "08:00 - 15:30",
      activeToday: Math.floor((formData.students || 25) * 0.85),
    };
    setClasses([...classes, newClass]);
    setFormData({ name: "", grade: "", students: 0, room: "", schedule: "" });
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🏫 Classes & Sections
        </h1>
        <p className="text-muted-foreground mt-1">Manage class sections, schedules, and enrollment</p>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Total Classes</p>
          <p className="text-3xl font-bold">{classes.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Total Students</p>
          <p className="text-3xl font-bold">{classes.reduce((s, c) => s + c.students, 0)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Active Today</p>
          <p className="text-3xl font-bold text-green-600">{classes.reduce((s, c) => s + c.activeToday, 0)}</p>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {/* ── ADD FORM ── */}
      {showForm && (
        <form onSubmit={handleAddClass} className="rounded-xl border bg-card p-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-lg">Create New Class</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Class Name (e.g., P6 - Class A)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2 md:col-span-2"
              required
            />
            <input
              placeholder="Grade (e.g., P6)"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
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
            <input
              placeholder="Room Number (e.g., Room 201)"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
            />
            <input
              placeholder="Schedule (e.g., 08:00 - 15:30)"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
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
              Create Class
            </button>
          </div>
        </form>
      )}

      {/* ── CLASSES GRID ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground rounded-xl border">
            No classes found
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">Teacher: {c.teacher}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{c.students} students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{c.room}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{c.schedule}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Today's Attendance</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(c.activeToday / c.students) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold">{c.activeToday}/{c.students}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
