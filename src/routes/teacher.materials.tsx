import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import {
  Upload, FileText, Trash2, Download, Search, Filter,
  BookOpen, File, X, Loader2, CheckCircle, AlertCircle
} from "lucide-react";

export const Route = createFileRoute("/teacher/materials")({
  head: () => ({ meta: [{ title: "Teaching Materials — Vive AI" }] }),
  component: TeacherMaterials,
});

interface Material {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "PPT" | "IMAGE" | "VIDEO";
  size: string;
  uploadDate: string;
  grade: string;
  subject: string;
  url?: string;
  status: "uploaded" | "processing" | "error";
}

const SAMPLE_MATERIALS: Material[] = [
  { id: "1", name: "P6 Math - Fractions Lesson", type: "PDF", size: "2.3 MB", uploadDate: "2024-06-13", grade: "P6", subject: "Math", status: "uploaded" },
  { id: "2", name: "English Grammar Guide", type: "DOCX", size: "1.8 MB", uploadDate: "2024-06-12", grade: "P6", subject: "English", status: "uploaded" },
  { id: "3", name: "Science Lab Experiments", type: "PPT", size: "5.2 MB", uploadDate: "2024-06-11", grade: "P5", subject: "Science", status: "uploaded" },
];

function TeacherMaterials() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0";

  const [materials, setMaterials] = useState<Material[]>(SAMPLE_MATERIALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    file: null as File | null,
    grade: "P6",
    subject: "Math",
  });

  const filtered = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === "All" || m.grade === filterGrade;
    const matchesSubject = filterSubject === "All" || m.subject === filterSubject;
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);

      const simulateProgress = setInterval(() => {
        setUploadProgress(p => Math.min(p + Math.random() * 20, 85));
      }, 300);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      clearInterval(simulateProgress);
      setUploadProgress(100);

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Upload failed");
      }

      const payload = await res.json();
      const newMaterial: Material = {
        id: Date.now().toString(),
        name: formData.file.name,
        type: formData.file.name.split(".").pop()?.toUpperCase() as any || "FILE",
        size: `${(formData.file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split("T")[0],
        grade: formData.grade,
        subject: formData.subject,
        url: payload.url,
        status: "uploaded",
      };

      setMaterials([newMaterial, ...materials]);
      setFormData({ file: null, grade: "P6", subject: "Math" });
      setShowUploadForm(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      PDF: { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
      DOCX: { bg: "rgba(59,130,246,0.1)", text: "#3B82F6" },
      PPT: { bg: "rgba(168,85,247,0.1)", text: "#A855F7" },
      IMAGE: { bg: "rgba(34,197,94,0.1)", text: "#22C55E" },
      VIDEO: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B" },
    };
    return colors[type] || colors.PDF;
  };

  const grades = ["All", "P1", "P2", "P3", "P4", "P5", "P6"];
  const subjects = ["All", "Math", "English", "Science", "Kinyarwanda", "Social"];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in main-content-padding">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: textPrimary }}>
          📚 Teaching Materials
        </h1>
        <p style={{ color: textMuted }} className="mt-1">Upload, manage, and share lesson resources with your classes</p>
      </div>

      {/* ── UPLOAD SECTION ── */}
      {!showUploadForm ? (
        <button
          onClick={() => setShowUploadForm(true)}
          className="w-full rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:border-solid hover:shadow-md"
          style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="font-bold mb-1" style={{ color: textPrimary }}>Click to upload or drag files here</p>
          <p style={{ color: textMuted }} className="text-sm">Supports PDF, DOCX, PPT, images, and videos</p>
        </button>
      ) : (
        <div className="rounded-2xl p-6 border" style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: textPrimary }}>
              <Upload className="w-5 h-5" /> Upload Material
            </h2>
            <button onClick={() => setShowUploadForm(false)} className="p-1 hover:bg-red-500/10 rounded text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer" style={{ borderColor: cardBorder }}>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={isUploading}
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p style={{ color: textPrimary }} className="font-bold">{formData.file?.name || "Select file"}</p>
                <p style={{ color: textMuted }} className="text-sm mt-1">or drag and drop</p>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: textMuted }}>Grade</label>
                <select
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: textPrimary }}
                >
                  {grades.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: textMuted }}>Subject</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: textPrimary }}
                >
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {isUploading && uploadProgress > 0 && (
              <div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${uploadProgress}%`,
                      background: "linear-gradient(to right, #60a5fa, #06b6d4)",
                    }}
                  />
                </div>
                <p className="text-xs text-center mt-2" style={{ color: textMuted }}>{uploadProgress}%</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="px-5 py-2 rounded-lg border font-semibold transition-colors"
                style={{ borderColor: cardBorder, color: textMuted }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.file || isUploading}
                className="px-5 py-2 rounded-lg text-white font-bold transition-all"
                style={{
                  background: isUploading || !formData.file ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #4F46E5, #6366F1)",
                  cursor: isUploading || !formData.file ? "not-allowed" : "pointer"
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  "Upload Material"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SEARCH & FILTER ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-60 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border"
              style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: textPrimary }}
            />
          </div>
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="px-4 py-2 rounded-lg border"
            style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: textPrimary }}
          >
            {grades.map(g => <option key={g}>{g}</option>)}
          </select>
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="px-4 py-2 rounded-lg border"
            style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: textPrimary }}
          >
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── MATERIALS LIST ── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-xl border" style={{ borderColor: cardBorder, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
            <BookOpen className="w-12 h-12 mx-auto opacity-30 mb-3" />
            <p style={{ color: textMuted }}>No materials found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map(material => {
            const typeColor = getTypeColor(material.type);
            return (
              <div key={material.id} className="rounded-xl border p-4 hover:shadow-md transition-all flex items-center justify-between" style={{ borderColor: cardBorder }}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: typeColor.bg }}>
                    <FileText className="w-6 h-6" style={{ color: typeColor.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate" style={{ color: textPrimary }}>{material.name}</h3>
                    <div className="flex gap-2 flex-wrap mt-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>{material.grade}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }}>{material.subject}</span>
                      <span className="text-xs" style={{ color: textMuted }}>{material.size}</span>
                      <span className="text-xs" style={{ color: textMuted }}>Uploaded {material.uploadDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {material.status === "uploaded" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {material.status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                  <button className="p-2 hover:bg-blue-500/10 rounded text-blue-500 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-2 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
