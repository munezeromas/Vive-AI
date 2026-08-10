import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Loader2, Send, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTheme } from "@/lib/theme-context";
import { AIStudyAssistant } from "@/components/vive/AIStudyAssistant";

export const Route = createFileRoute("/student/homework/$assignmentId")({
  component: AssignmentView,
});

// Helper for shuffling arrays
const shuffle = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function AssignmentView() {
  const { assignmentId } = Route.useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      const res = await fetch(`/api/assignments/${assignmentId}`);
      if (!res.ok) throw new Error("Failed to fetch assignment");
      return res.json();
    }
  });

  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Anti-Cheating State
  const [warnings, setWarnings] = useState<string[]>([]);
  const [cheatLogs, setCheatLogs] = useState<{type: string, time: number}[]>([]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => [...prev, "Tab switched! This activity is monitored."]);
        setCheatLogs(prev => [...prev, { type: "tab_switch", time: Date.now() }]);
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      setWarnings(prev => [...prev, "Copying is restricted during assignments."]);
      setCheatLogs(prev => [...prev, { type: "copy", time: Date.now() }]);
      e.preventDefault();
    };

    const handlePaste = (e: ClipboardEvent) => {
      setWarnings(prev => [...prev, "Pasting is restricted during assignments."]);
      setCheatLogs(prev => [...prev, { type: "paste", time: Date.now() }]);
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock student ID for now, usually would come from auth
      const studentId = "student-123";
      const res = await fetch("/api/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          studentId,
          content: "Submission completed",
          answers: data,
          cheatLogs // Send monitoring logs
        })
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      alert("Homework submitted successfully!");
      navigate({ to: "/student/homework" });
    }
  });

  // Randomize questions and options on load
  const randomizedQuestions = useMemo(() => {
    if (!assignment?.questions) return [];
    const shuffledQs = shuffle(assignment.questions);
    return shuffledQs.map((q: any) => {
      if ((q.type === "mcq" || q.type === "multiple_choice") && Array.isArray(q.options)) {
        return { ...q, options: shuffle(q.options) };
      }
      return q;
    });
  }, [assignment?.questions]);

  if (isLoading) return (
    <div className="flex justify-center items-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );

  if (error || !assignment) return (
    <div className="py-20 text-center">
      <h2 className="text-xl font-bold">Assignment not found.</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in main-content-padding pb-20">
      <button onClick={() => navigate({ to: "/student/homework" })} className="flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity">
        <ChevronLeft className="w-4 h-4" /> Back to Homework
      </button>

      {warnings.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <AlertTriangle className="w-5 h-5" />
            Anti-Cheating Warnings ({warnings.length})
          </div>
          <ul className="text-sm text-red-400 list-disc list-inside">
            {warnings.slice(-3).map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="pro-card glass-panel p-8">
        <h1 className="text-3xl font-black mb-2">{assignment.title}</h1>
        <p className="opacity-70 mb-6">{assignment.description}</p>
        <div className="flex items-center gap-4 text-sm font-bold opacity-60">
          <span>Total Points: {assignment.totalPoints}</span>
          {assignment.dueDate && <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>}
        </div>
      </div>

      <div className="space-y-6">
        {randomizedQuestions.length === 0 ? (
          <div className="pro-card glass-panel p-8 text-center opacity-70 font-bold">
            No questions added to this assignment yet.
          </div>
        ) : (
          randomizedQuestions.map((q: any, i: number) => (
            <div key={i} className="pro-card glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg">
                <span className="text-amber-500 mr-2">{i + 1}.</span> {q.questionText || q.text || "Question text"}
                <span className="ml-2 text-xs opacity-50 font-normal">({q.points || 1} pts)</span>
              </h3>
              
              {q.type === "multiple_choice" || q.type === "mcq" ? (
                <div className="space-y-2">
                  {(q.options || []).map((opt: string, idx: number) => (
                    <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name={`q-${i}`} 
                        value={opt} 
                        checked={answers[`q-${i}`] === opt}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [`q-${i}`]: e.target.value }))}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : q.type === "true_false" ? (
                <div className="flex gap-4">
                  {["True", "False"].map(opt => (
                    <label key={opt} className="flex-1 flex justify-center items-center gap-2 p-4 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name={`q-${i}`} 
                        value={opt}
                        checked={answers[`q-${i}`] === opt}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [`q-${i}`]: e.target.value }))}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span className="font-bold">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea 
                  className="w-full bg-transparent border border-white/20 rounded-xl p-4 focus:outline-none focus:border-amber-500 min-h-[120px]"
                  placeholder="Type your answer here..."
                  value={answers[`q-${i}`] || ""}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [`q-${i}`]: e.target.value }))}
                />
              )}
            </div>
          ))
        )}
      </div>

      {randomizedQuestions.length > 0 && (
        <div className="flex justify-end pt-4">
          <button 
            onClick={() => submitMutation.mutate(answers)}
            disabled={submitMutation.isPending}
            className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-white font-black rounded-2xl shadow-glow hover:scale-105 transition-transform disabled:opacity-50"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Homework"}
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}

      <AIStudyAssistant documentContext={`Assignment Title: ${assignment.title}\nDescription: ${assignment.description}\nQuestions: ${JSON.stringify(randomizedQuestions)}`} />
    </div>
  );
}
