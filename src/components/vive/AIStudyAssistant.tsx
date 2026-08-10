import { useState } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, BookOpen, PenTool, Globe } from "lucide-react";

interface AIStudyAssistantProps {
  documentContext: string;
}

export function AIStudyAssistant({ documentContext }: AIStudyAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text: string, actionPrefix = "") => {
    if (!text.trim() && !actionPrefix) return;
    
    const userMsg = actionPrefix ? actionPrefix + " " + text : text;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      // Assuming a generic chat endpoint exists for the tutor
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "temp-session",
          message: userMsg,
          context: documentContext
        })
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "ai", content: data.content || data.reply || "I am processing your request based on the material." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I am having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-amber-500 text-white rounded-full shadow-glow hover:scale-110 transition-transform z-50 flex items-center gap-2"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[80vh] flex flex-col bg-[#0A1020] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-amber-500 font-black">
          <Sparkles className="w-5 h-5" /> AI Tutor
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center opacity-70 text-sm mt-4">
            Hi! I'm your AI Tutor. Ask me anything about this material!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-xl max-w-[85%] ${m.role === 'user' ? 'bg-amber-500/20 text-white ml-auto border border-amber-500/30' : 'bg-white/5 text-white/90 mr-auto border border-white/10'}`}>
            <p className="text-sm leading-relaxed">{m.content}</p>
          </div>
        ))}
        {isTyping && (
          <div className="bg-white/5 p-3 rounded-xl mr-auto max-w-[85%] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin opacity-50" />
            <span className="text-xs opacity-50">Thinking...</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto custom-scrollbar border-t border-white/5">
        <button onClick={() => sendMessage("Please summarize this chapter.", "📝")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs border border-white/10 hover:bg-white/10 transition-colors text-white/80"><BookOpen className="w-3 h-3 text-amber-500"/> Summarize</button>
        <button onClick={() => sendMessage("Generate a quick practice question for me.", "❓")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs border border-white/10 hover:bg-white/10 transition-colors text-white/80"><PenTool className="w-3 h-3 text-amber-500"/> Quiz Me</button>
        <button onClick={() => sendMessage("Translate the key points into French.", "🌍")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs border border-white/10 hover:bg-white/10 transition-colors text-white/80"><Globe className="w-3 h-3 text-amber-500"/> Translate</button>
      </div>

      <div className="p-4 border-t border-white/10 bg-white/5">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the material..."
            className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500 text-sm"
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
