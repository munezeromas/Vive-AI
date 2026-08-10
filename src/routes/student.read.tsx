
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  Volume2, 
  Brain, 
  ZoomIn,
  ZoomOut,
  Sparkles,
  Download
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { geminiSimplify } from "@/lib/gemini-server";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { AIStudyAssistant } from "@/components/vive/AIStudyAssistant";
import { lazy, Suspense } from "react";

const PDFViewer = lazy(() => import("@/components/vive/PDFViewer"));

const isEnglishText = (text: string): boolean => {
  if (!text) return false;
  const commonEnglish = /\b(the|be|to|of|and|a|in|that|have|i|it|for|not|on|with|he|as|you|do|at|this|but|his|by|from|they|we|say|her|she|or|an|will|my|one|all|would|there|their|what|so|up|out|if|about|who|get|which|go|me|when|make|can|like|time|no|just|him|know|take|people|into|year|your|good|some|could|them|see|other|than|then|now|look|only|come|its|over|think|also|back|after|use|two|how|our|work|first|well|way|even|new|want|because|any|these|give|day|most|us|is|am|are|was|were|has|had|do|does|did|hello|yes|no|hi|ok|okay|welcome|study|learn|teacher|tutor|student)\b/i;
  const commonKinyarwanda = /\b(amahoro|amakuru|yego|oya|muraho|bite|neza|murakoze|nshuti|umwana|abana|igitabo|ishuri|umwarimu|gukora|gusoma|kwiga|niba|ariko|kuko|ni|na|ko|mu|ku|za|wa|ba|ya|yo|ndagukunda|mwaramutse|isi|umuriro|amazi|kugira|kora)\b/i;
  const hasEnglish = commonEnglish.test(text);
  const hasKinyarwanda = commonKinyarwanda.test(text);
  if (hasKinyarwanda && !hasEnglish) return false;
  return hasEnglish;
};

const searchSchema = z.object({
  file: z.string(),
  title: z.string(),
});

export const Route = createFileRoute("/student/read")({
  validateSearch: (search) => searchSchema.parse(search),
  component: Reader,
});

function Reader() {
  const { file, title } = Route.useSearch();
  const [isReading, setIsReading] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [isDyslexicMode, setIsDyslexicMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default for prominence
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(file);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = title.endsWith(".pdf") ? title : `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download file:", e);
      alert("Failed to download file for offline reading.");
    }
  };

  // Only get what the student actually highlighted — NO clipboard fallback
  const getActiveText = () => {
    // 1. Prefer whatever is live-selected RIGHT NOW in the window
    const liveSelection = window.getSelection()?.toString().trim() ?? "";
    if (liveSelection.length > 0 && liveSelection.length <= 600) {
      return liveSelection;
    }

    // 2. Fall back to the last selection stored on mouseup (capped at 600 chars)
    if (selectedText.trim().length > 0 && selectedText.length <= 600) {
      return selectedText.trim();
    }

    // 3. Nothing usable found
    return "";
  };

  // Real Gemini Simplification via Server Function
  const simplifyText = async () => {
    const textToSimplify = getActiveText();
    
    if (!textToSimplify) {
      alert("Please highlight a word or sentence in the book first, then click Make it easier!");
      return;
    }
    
    // Clear stored selection so it isn't reused next time
    setSelectedText("");
    setIsSimplifying(true);
    setIsSidebarOpen(true);
    
    try {
      const grade = title.match(/P(\d)/i)?.[1] || "3";
      const subject = title.includes("English") ? "English"
        : title.includes("French") ? "French"
        : title.includes("Math") ? "Mathematics"
        : title.includes("Science") ? "Science"
        : "General";
      
      const text = await geminiSimplify({ 
        data: { text: textToSimplify, grade, subject }
      });
      
      setSimplifiedText(text || "I couldn't simplify that right now. Try selecting a different word!");
    } catch (error) {
      console.error("Gemini Error:", error);
      setSimplifiedText("Sorry, I'm having trouble right now. Please try again in a moment!");
    } finally {
      setIsSimplifying(false);
    }
  };

  // Only store selection if it's a reasonable highlight (not the whole book)
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()?.toString().trim() ?? "";
      // Accept selections between 1 and 600 characters
      if (selection.length > 0 && selection.length <= 600) {
        setSelectedText(selection);
      } else if (selection.length === 0) {
        // Don't clear — user may have accidentally clicked away
      }
    };
    document.addEventListener("mouseup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech API
  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support text-to-speech.");
      return;
    }

    if (!isEnglishText(text)) {
      console.log("[AI Reader] Non-English text detected, muting audio:", text);
      window.speechSynthesis.cancel();
      return;
    }
    
    // Cancel and reset
    window.speechSynthesis.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Ensure voices are loaded
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Premium') || v.name.includes('Google'))) || 
                        voices.find(v => v.lang.startsWith('en')) || 
                        voices[0];
    
    if (englishVoice) utterance.voice = englishVoice;
    utterance.pitch = 1.05;
    utterance.rate = 0.98;
    
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error:", e);
      setIsReading(false);
    };

    // Chrome/Safari Fix: Speech synthesis sometimes needs a tiny "kickstart"
    // to work if the engine was idle.
    const kickstart = new SpeechSynthesisUtterance("");
    kickstart.volume = 0;
    window.speechSynthesis.speak(kickstart);

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const toggleSpeech = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const textToRead = getActiveText()
        || (simplifiedText ? `Here is the simplified version: ${simplifiedText}` : `You are on page ${page} of ${title}. Highlight any word or sentence you find difficult and I will explain it for you.`);
      speak(textToRead);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-[#080C14] flex flex-col transition-all duration-500 ${isDyslexicMode ? 'font-dyslexic' : ''}`}>
      <style>{`
        /* Force the react-pdf text layer to be perfectly on top of the canvas and fully interactive */
        .react-pdf__Page__textLayer {
          z-index: 2 !important;
          pointer-events: auto !important;
          opacity: 1 !important;
          mix-blend-mode: multiply;
        }
        /* Ensure the canvas lies in the background and ignores selection mouse gestures */
        .react-pdf__Page__canvas {
          z-index: 1 !important;
          pointer-events: none !important;
        }
        /* Style high-contrast child selection background */
        .react-pdf__Page__textLayer span::selection {
          background-color: rgba(37, 99, 235, 0.35) !important;
          color: inherit !important;
        }
      `}</style>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0A1020]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to="/student/library" className="p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px]">{title}</h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Vive AI Reader</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30" disabled={page <= 1}><ChevronLeft className="h-4 w-4 text-white" /></button>
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-[10px] font-black text-white/40 uppercase">Page</span>
              <input 
                type="number" 
                value={page} 
                min={1}
                max={numPages ?? undefined}
                onChange={(e) => setPage(Math.max(1, Math.min(numPages ?? 9999, Number(e.target.value))))}
                className="w-10 bg-transparent text-center text-sm font-black text-white focus:outline-none"
              />
              {numPages && <span className="text-[10px] font-black text-white/30">/ {numPages}</span>}
            </div>
            <button onClick={() => setPage(p => numPages ? Math.min(numPages, p + 1) : p + 1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30" disabled={!!(numPages && page >= numPages)}><ChevronRight className="h-4 w-4 text-white" /></button>
          </div>

          <div className="w-px h-6 bg-white/10" />

          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-white/60 hover:text-white transition-all" title="Download for Offline Reading"><Download className="h-4 w-4" /></button>
            <button onClick={() => setFontSize(s => Math.min(s + 2, 32))} className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-white/60 hover:text-white transition-all"><ZoomIn className="h-4 w-4" /></button>
            <button onClick={() => setFontSize(s => Math.max(s - 2, 12))} className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-white/60 hover:text-white transition-all"><ZoomOut className="h-4 w-4" /></button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button 
              onClick={() => setIsDyslexicMode(!isDyslexicMode)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDyslexicMode ? 'bg-primary text-white shadow-glow' : 'border border-white/5 text-white/60 hover:text-white'}`}>
              Dyslexic Mode
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all ${isSidebarOpen ? 'bg-primary/20 text-primary border-primary/20' : 'text-white/60'}`}><Brain className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-4xl px-4 py-8">
            {isClient && file.toLowerCase().endsWith('.pdf') ? (
              <Suspense fallback={
                <div className="w-full flex flex-col items-center justify-center py-20">
                  <Brain className="h-12 w-12 text-[#4A90D9] animate-pulse mb-4 mx-auto" />
                  <p className="text-[#4A6A8A] font-black text-lg uppercase tracking-widest">Opening Book...</p>
                </div>
              }>
                <PDFViewer file={file} page={page} fontSize={fontSize} onTotalPages={setNumPages} onPageChange={setPage} />
              </Suspense>
            ) : (file.toLowerCase().endsWith('.docx') || file.toLowerCase().endsWith('.doc') || file.toLowerCase().endsWith('.pptx') || file.toLowerCase().endsWith('.ppt')) ? (
              <div className="w-full h-[80vh] bg-white shadow-2xl rounded-2xl overflow-hidden">
                <iframe 
                  key={file}
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(file)}&embedded=true`} 
                  className="w-full h-full border-none"
                  title={title}
                />
              </div>
            ) : (
              <div className="w-full h-[80vh] bg-white shadow-2xl rounded-2xl overflow-hidden">
                <iframe 
                  key={`${file}-${page}`}
                  src={`${file}#page=${page}&toolbar=0&navpanes=0&scrollbar=0`} 
                  className="w-full h-full"
                  title={title}
                />
              </div>
            )}
            
            
          </div>
          {/* Floating tools - sticky to the PDF reading area */}
          <div className="sticky bottom-8 mt-auto z-50 flex flex-row gap-3 bg-[#0A1020]/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
             <button onClick={simplifyText} disabled={isSimplifying} className="h-11 px-4 rounded-xl bg-primary text-white shadow-glow flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 text-xs font-black uppercase tracking-widest disabled:opacity-50">
               <Sparkles className="h-4 w-4" />
               {isSimplifying ? "Thinking..." : "Make it easier"}
             </button>
             <button onClick={toggleSpeech} className="h-11 px-4 rounded-xl bg-white/5 text-primary border border-primary/20 flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 text-xs font-black uppercase tracking-widest">
               <Volume2 className="h-4 w-4" />
               {isReading ? "Stop" : "Read aloud"}
             </button>
          </div>
        </div>


        {/* AI Sidebar */}
        {isSidebarOpen && (
          <aside className="w-96 border-l border-white/5 bg-[#0A1020]/50 backdrop-blur-xl p-8 overflow-y-auto animate-in slide-in-from-right duration-500">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Vive AI Assistant
            </h3>
            
            {simplifiedText ? (
              <div className="space-y-4">
                {/* Mascot sits above the explanation card */}
                <div className="flex justify-end pr-1">
                  <div className="h-20 w-20">
                    <RiveAnimation src="/riv-animations/17633-33058-little-fella.riv" className="w-full h-full" />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Simplified Explanation</p>
                  <p className="text-sm font-medium leading-relaxed text-white/80">{simplifiedText}</p>
                </div>
                <div className="space-y-3">
                  <button onClick={() => speak(simplifiedText)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-black text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                    <Volume2 className="h-4 w-4 text-primary" />
                    Read Explanation
                  </button>
                  <button onClick={() => setSimplifiedText(null)} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Clear Assistant</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 space-y-5">
                {/* Mascot */}
                <div className="h-40 w-40">
                  <RiveAnimation src="/riv-animations/17633-33058-little-fella.riv" className="w-full h-full" />
                </div>

                {/* Selected text preview */}
                {selectedText ? (
                  <div className="w-full space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center">
                      ✅ You selected:
                    </p>
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-sm font-semibold text-white/80 leading-relaxed line-clamp-3">
                        "{selectedText}"
                      </p>
                    </div>
                    <p className="text-[10px] text-white/40 text-center font-semibold">
                      Now click <span className="text-primary font-black">Make it easier</span> below!
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-white/30 uppercase tracking-widest text-center leading-relaxed max-w-[180px]">
                    Highlight a word or sentence in the book to explain it
                  </p>
                )}
              </div>
            )}
          </aside>
        )}
      </div>

      <AIStudyAssistant documentContext={title ? `Reading document: ${title}\nURL: ${file}` : "Reading materials"} />
    </div>
  );
}
