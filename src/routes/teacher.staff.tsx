import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { STAFF_MEMBERS } from "@/lib/mock-data";
import {
  Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Mail, Phone, Calendar
} from "lucide-react";

export const Route = createFileRoute("/teacher/staff")({
  head: () => ({ meta: [{ title: "Staff Management — Vive AI" }] }),
  component: StaffManagement,
});

type StaffMember = typeof STAFF_MEMBERS[0];

function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_MEMBERS);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", role: "", email: "", phone: "", subjects: "", active: true
  });

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.role.toLowerCase().includes(q.toLowerCase())
  );

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;
    const newStaff: StaffMember = {
      id: staff.length + 1,
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      subjects: formData.subjects ? formData.subjects.split(",").map(s => s.trim()) : [],
      active: formData.active,
      joinDate: new Date().toISOString().split("T")[0],
    };
    setStaff([...staff, newStaff]);
    setFormData({ name: "", role: "", email: "", phone: "", subjects: "", active: true });
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleToggleActive = (id: number) => {
    setStaff(staff.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          👥 Staff Management
        </h1>
        <p className="text-muted-foreground mt-1">Manage teachers, assistants, and school staff</p>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Total Staff</p>
          <p className="text-3xl font-bold">{staff.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">{staff.filter(s => s.active).length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Inactive</p>
          <p className="text-3xl font-bold text-red-600">{staff.filter(s => !s.active).length}</p>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or role..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* ── ADD FORM ── */}
      {showForm && (
        <form onSubmit={handleAddStaff} className="rounded-xl border bg-card p-6 space-y-4 animate-fade-in">
          <h3 className="font-bold text-lg">Add New Staff Member</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
              required
            />
            <input
              placeholder="Role (e.g., Class Teacher)"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
            />
            <input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2"
            />
            <input
              placeholder="Subjects (comma-separated)"
              value={formData.subjects}
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2 md:col-span-2"
            />
            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Active</span>
            </label>
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
              Add Staff
            </button>
          </div>
        </form>
      )}

      {/* ── STAFF LIST ── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No staff members found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Role</th>
                  <th className="p-3 text-left font-semibold">Subjects</th>
                  <th className="p-3 text-left font-semibold">Contact</th>
                  <th className="p-3 text-left font-semibold">Join Date</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className="p-3 text-sm">{m.role}</td>
                    <td className="p-3 text-sm">{m.subjects.join(", ") || "—"}</td>
                    <td className="p-3 text-xs space-y-0.5">
                      {m.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" /> {m.email}
                        </div>
                      )}
                      {m.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" /> {m.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" /> {m.joinDate}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleActive(m.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors"
                        style={{
                          background: m.active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                          color: m.active ? "rgb(34,197,94)" : "rgb(239,68,68)"
                        }}
                      >
                        {m.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {m.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
