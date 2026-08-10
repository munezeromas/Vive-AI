import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { MessageSquare, Send, User, ChevronRight } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/parent/messages")({
  head: () => ({ meta: [{ title: "Direct Messages — Vive AI" }] }),
  component: ParentMessages,
});

const MOCK_PARENT_ID = "parent-demo-123";

// Fallback mock teachers if no active classes
const MOCK_TEACHERS = [
  { id: "teacher-demo-123", name: "Mr. Nshimiyimana Eric", email: "eric@vive.edu", role: "teacher" },
  { id: "teacher-demo-456", name: "Mrs. Uwera Solange", email: "solange@vive.edu", role: "teacher" }
];

function ParentMessages() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const isDark = theme === "dark";

  const parentId = session?.user?.id || MOCK_PARENT_ID;
  const parentName = session?.user?.name || "Mukamanzi Beatrice";

  const [activeThreads, setActiveThreads] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState<any[]>(MOCK_TEACHERS);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch active threads
  const fetchThreads = async () => {
    try {
      const res = await fetch(`/api/messages?userId=${parentId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveThreads(data);
      }
    } catch (err) {
      console.warn("Failed to fetch messages threads", err);
    }
  };

  // Fetch chat history for selected contact
  const fetchHistory = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/messages/${selectedUserId}?userId=${parentId}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
      }
    } catch (err) {
      console.warn("Failed to fetch chat history", err);
    }
  };

  useEffect(() => {
    fetchThreads();
    // Fetch classes to find real teachers
    const fetchRealTeachers = async () => {
      try {
        const res = await fetch("/api/classes");
        if (res.ok) {
          const classesData = await res.json();
          // Fetch teachers details
          const uniqueTeacherIds = Array.from(new Set(classesData.map((c: any) => c.teacherId)));
          const teachersList = [];
          for (const tId of uniqueTeacherIds) {
            // Find teacher name/info by searching user (or fallback to mock if API lacks single user fetch)
            // For now, let's create a solid list of teachers
            teachersList.push({
              id: tId as string,
              name: `Class Teacher (${(tId as string).substring(0, 5)})`,
              role: "teacher"
            });
          }
          if (teachersList.length > 0) {
            setAvailableTeachers(teachersList);
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };
    fetchRealTeachers();

    const interval = setInterval(() => {
      fetchThreads();
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, [parentId, selectedUserId]);

  useEffect(() => {
    fetchHistory();
  }, [selectedUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: parentId,
          receiverId: selectedUserId,
          content: inputText
        }),
      });

      if (res.ok) {
        setInputText("");
        fetchHistory();
        fetchThreads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedUser = availableTeachers.find(t => t.id === selectedUserId) || 
                       activeThreads.find(t => t.otherUser.id === selectedUserId)?.otherUser;

  const textPrimary = isDark ? "#F3F4F6" : "#065F46";
  const textMuted = isDark ? "#9CA3AF" : "#4B5563";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const cardBorder = isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid #D1FAE5";

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* LEFT: THREADS / CONTACTS */}
      <div
        className="w-full md:w-[280px] rounded-[24px] p-4 border flex flex-col h-full overflow-hidden shrink-0"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={{ color: textPrimary }}>
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          Inbox Threads
        </h3>

        {/* Start conversation select */}
        <div className="mb-4">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">New Chat</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-transparent"
            style={{ color: textPrimary, borderColor: isDark ? "rgba(16,185,129,0.3)" : "#D1FAE5" }}
          >
            <option value="" style={{ background: cardBg }}>Select a teacher...</option>
            {availableTeachers.map(t => (
              <option key={t.id} value={t.id} style={{ background: cardBg }}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Recent Threads</p>
          {activeThreads.length === 0 ? (
            <p className="text-xs text-center py-6 text-slate-400">No active chats</p>
          ) : (
            activeThreads.map(t => (
              <div
                key={t.otherUser.id}
                onClick={() => setSelectedUserId(t.otherUser.id)}
                className="p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors"
                style={{
                  borderColor: selectedUserId === t.otherUser.id ? "#10B981" : "transparent",
                  background: selectedUserId === t.otherUser.id ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.02)"
                }}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-xs">
                  {t.otherUser.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-none truncate" style={{ color: textPrimary }}>{t.otherUser.name}</p>
                  <p className="text-[9px] mt-1 truncate" style={{ color: textMuted }}>
                    {t.lastMessage.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: CHAT WORKSPACE */}
      <div
        className="flex-1 rounded-[24px] border flex flex-col h-full overflow-hidden"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        {selectedUserId ? (
          <>
            {/* Active chat header */}
            <div
              className="p-4 flex items-center gap-3 border-b"
              style={{ borderColor: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5" }}
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-sm">
                {selectedUser?.name ? selectedUser.name[0] : "?"}
              </div>
              <div>
                <h4 className="text-xs font-black" style={{ color: textPrimary }}>{selectedUser?.name || "Chat"}</h4>
                <p className="text-[9px]" style={{ color: textMuted }}>Direct Message thread</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-slate-400 italic">Say hello to start the conversation! 👋</p>
                </div>
              ) : (
                chatHistory.map((msg: any) => {
                  const isSender = msg.senderId === parentId;
                  return (
                    <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="rounded-2xl p-3 text-xs max-w-xs break-words shadow-sm font-semibold"
                        style={{
                          background: isSender ? 'linear-gradient(135deg, #10B981, #059669)' : (isDark ? '#374151' : '#F3F4F6'),
                          color: isSender ? '#FFFFFF' : (isDark ? '#F3F4F6' : '#1F2937')
                        }}
                      >
                        <p>{msg.content}</p>
                        <span className="text-[8px] opacity-70 block text-right mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Send Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t flex gap-2"
              style={{ borderColor: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5" }}
            >
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs border outline-none bg-transparent"
                style={{ borderColor: isDark ? "rgba(16,185,129,0.3)" : "#D1FAE5", color: textPrimary }}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 active:scale-[0.95]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-sm font-black mb-1" style={{ color: textPrimary }}>No conversation selected</h3>
            <p className="text-xs max-w-xs" style={{ color: textMuted }}>
              Select a child's class teacher from the list or select a new contact to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
