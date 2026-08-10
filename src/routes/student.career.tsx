import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Compass, GraduationCap, Microscope, Rocket, Globe, Palette, RotateCcw, Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { geminiSimplify } from "@/lib/gemini-server";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/student/career")({
  head: () => ({ meta: [{ title: "Pathways — Vive AI" }] }),
  component: CareerPathExplorer,
});

const STREAMS = [
  { id: "MCB", name: "Math-Chem-Bio", icon: Microscope, color: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20", careers: ["Doctor", "Pharmacist", "Biotechnologist"], strength: "Science & Life" },
  { id: "MPC", name: "Math-Phys-Comp", icon: Rocket, color: "text-[#5BA0E3] bg-[#5BA0E3]/10 border-[#5BA0E3]/20", careers: ["Engineer", "Software Developer", "Data Scientist"], strength: "Logic & Building" },
  { id: "PCB", name: "Phys-Chem-Bio", icon: Brain, color: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20", careers: ["Medical Specialist", "Chemical Engineer", "Researcher"], strength: "Universal Sciences" },
  { id: "HEG", name: "Hist-Econ-Geog", icon: Globe, color: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20", careers: ["Economist", "Urban Planner", "Diplomat"], strength: "Society & Finance" },
  { id: "LEG", name: "Lit-Econ-Geog", icon: Palette, color: "text-[#EC4899] bg-[#EC4899]/10 border-[#EC4899]/20", careers: ["Journalist", "Lawyer", "International Relations"], strength: "Language & Analysis" },
];

const ASSESSMENT = [
  { q: "Which subject makes you most curious?", opts: ["How living things work", "How machines and computers work", "How our world and money work", "How we tell stories and share ideas"] },
  { q: "What's your favorite activity?", opts: ["Doing science experiments", "Solving math puzzles", "Reading and writing stories", "Discussing history or news"] },
  { q: "When you grow up, what sounds coolest?", opts: ["Helping people get healthy", "Building new apps or bridges", "Leading a business or country", "Being a famous writer or reporter"] }
];

function CareerPathExplorer() {
  const [stage, setStage] = useState<"intro" | "assessment" | "loading" | "result">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [recommendedStream, setRecommendedStream] = useState<typeof STREAMS[0] | null>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted   = isDark ? "#94A3B8" : "#64748B";

  const startAssessment = () => {
    setStage("assessment");
    setStep(0);
    setAnswers([]);
  };

  const handlePick = async (opt: string) => {
    const newAnswers = [...answers, opt];
    setAnswers(newAnswers);
    
    if (step + 1 < ASSESSMENT.length) {
      setStep(step + 1);
    } else {
      generateResult(newAnswers);
    }
  };

  const generateResult = async (finalAnswers: string[]) => {
    setStage("loading");
    
    try {
      const hasLife = finalAnswers.some(a => a.includes("living") || a.includes("experiments") || a.includes("healthy"));
      const hasTech = finalAnswers.some(a => a.includes("machines") || a.includes("puzzles") || a.includes("apps"));
      const hasArts = finalAnswers.some(a => a.includes("stories") || a.includes("writing") || a.includes("reporter"));
      
      let streamId = "MCB";
      if (hasTech) streamId = "MPC";
      else if (hasLife) streamId = "PCB";
      else if (hasArts) streamId = "LEG";
      else streamId = "HEG";

      const stream = STREAMS.find(s => s.id === streamId) || STREAMS[0];
      setRecommendedStream(stream);

      const prompt = `A primary school student picked these interests: ${finalAnswers.join(", ")}. I recommended the High School stream "${stream.name}". Give them a very encouraging 2-sentence explanation of why this path fits them and one cool career they could have.`;
      const res = await (geminiSimplify as any)({ data: { text: prompt, grade: "6", subject: "Career Guidance" } });
      setAiAdvice(res || "This path perfectly matches your brilliant mind! You will do amazing things in the future.");
      setStage("result");
    } catch (e) {
      console.error(e);
      setAiAdvice("You have a very versatile mind! This path will open many doors for your bright future.");
      setRecommendedStream(STREAMS[0]);
      setStage("result");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in main-content-padding pb-20">
      
      {stage === "intro" && (
        <div className="flex flex-col items-center justify-center py-20 gap-10 text-center relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-400/10 rounded-full filter blur-[100px] pointer-events-none" />
           
           <div className="relative group z-10">
              <div className="absolute inset-0 bg-sky-400/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <div className="h-48 w-48 rounded-[40px] flex items-center justify-center relative pro-card glass-panel shadow-2xl">
                 <Compass className="h-24 w-24 text-sky-400 animate-pulse-glow" />
              </div>
           </div>
           
           <div className="space-y-4 max-w-2xl relative z-10">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter" style={{ color: textPrimary }}>
                Your <span className="text-sky-400 italic">High School</span> <br /> Path Explorer
              </h1>
              <p className="text-lg md:text-xl font-bold opacity-80" style={{ color: textMuted }}>
                Discover which Rwandan subject combinations match your brilliant future!
              </p>
           </div>
           
           <button 
              onClick={startAssessment} 
              className="relative z-10 px-10 py-5 rounded-full text-lg font-black text-white flex items-center gap-3 transition-transform hover:scale-105 shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)]"
              style={{ background: "linear-gradient(135deg, #5BA0E3, #3B7DBF)" }}
           >
              Start Exploring <ArrowRight className="h-6 w-6" />
           </button>

           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full pt-16 relative z-10">
              {STREAMS.map(s => (
                <div key={s.id} className="p-5 rounded-[24px] pro-card glass-panel text-center space-y-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default group hover:-translate-y-2">
                   <s.icon className={`h-8 w-8 mx-auto ${s.color.split(' ')[0]}`} />
                   <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: textPrimary }}>{s.id}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {stage === "assessment" && (
        <div className="flex flex-col items-center py-10 space-y-12">
            <div className="w-full max-w-2xl text-center space-y-6">
               <div className="flex justify-center gap-2 mb-8">
                  {ASSESSMENT.map((_, i) => (
                    <div key={i} className={`h-2 w-16 rounded-full transition-all duration-500`} style={{ background: i <= step ? "#5BA0E3" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"), boxShadow: i <= step ? "0 0 10px rgba(59,130,246,0.5)" : "none" }} />
                  ))}
               </div>
               <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: textPrimary }}>{ASSESSMENT[step].q}</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6 w-full max-w-4xl">
               {ASSESSMENT[step].opts.map((o) => (
                 <button 
                  key={o} 
                  onClick={() => handlePick(o)}
                  className="group relative rounded-[32px] pro-card glass-panel p-10 text-left transition-all duration-500 hover:scale-[1.02] active:scale-95 overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-400/10 rounded-full filter blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-xl font-black transition-colors block relative z-10" style={{ color: textPrimary }}>{o}</span>
                 </button>
               ))}
            </div>
        </div>
      )}

      {stage === "loading" && (
        <div className="flex flex-col items-center justify-center py-40 space-y-10">
           <div className="h-32 w-32 relative">
              <div className="absolute inset-0 border-[6px] rounded-full" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
              <div className="absolute inset-0 border-[6px] border-sky-400 border-t-transparent rounded-full animate-spin" />
              <Brain className="absolute inset-0 m-auto h-12 w-12 text-sky-400 animate-pulse" />
           </div>
           <div className="text-center">
              <p className="text-2xl font-black uppercase tracking-widest mb-2" style={{ color: textPrimary }}>Computing Neural Pathways...</p>
              <p className="text-sm font-bold opacity-60" style={{ color: textMuted }}>Vive AI is mapping your interests to Rwandan Streams</p>
           </div>
        </div>
      )}

      {stage === "result" && recommendedStream && (
        <div className="space-y-12 md:pb-20 animate-fade-in relative">
           
           <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full filter blur-[120px] pointer-events-none" style={{ background: recommendedStream.color.includes('10B981') ? 'rgba(16,185,129,0.1)' : recommendedStream.color.includes('3B82F6') ? 'rgba(59,130,246,0.1)' : recommendedStream.color.includes('F59E0B') ? 'rgba(245,158,11,0.1)' : recommendedStream.color.includes('8B5CF6') ? 'rgba(139,92,246,0.1)' : 'rgba(236,72,153,0.1)' }} />

           <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="relative group shrink-0">
                 <div className={`absolute inset-0 ${recommendedStream.color.split(' ')[1]} blur-[80px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity`} />
                 <div className="h-64 w-64 rounded-[56px] pro-card glass-panel flex items-center justify-center relative shadow-2xl overflow-hidden border-[3px]" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "transparent" }}>
                    <div className={`absolute inset-0 ${recommendedStream.color.split(' ')[1]} opacity-20`} />
                    <recommendedStream.icon className={`h-32 w-32 ${recommendedStream.color.split(' ')[0]} drop-shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-500`} />
                    <div className={`absolute -bottom-0 left-0 right-0 py-4 ${recommendedStream.color.split(' ')[1]} backdrop-blur-md border-t ${recommendedStream.color.split(' ')[2]} text-center font-black tracking-widest text-[10px] uppercase`} style={{ color: textPrimary }}>
                       STRENGTH: {recommendedStream.strength}
                    </div>
                 </div>
              </div>

              <div className="flex-1 space-y-6 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${recommendedStream.color}`}>Recommended Path</span>
                    <div className="h-px w-20" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter" style={{ color: textPrimary }}>
                   Your future starts with <br /><span className={recommendedStream.color.split(' ')[0]}>{recommendedStream.name}</span>
                 </h1>
                 <div className="p-6 md:p-8 rounded-[32px] pro-card glass-panel relative group overflow-hidden">
                    <Sparkles className={`absolute -right-4 -top-4 h-32 w-32 ${recommendedStream.color.split(' ')[0]} opacity-10 group-hover:scale-125 transition-transform duration-700`} />
                    <p className="text-lg md:text-xl font-bold italic opacity-90 relative z-10 leading-relaxed" style={{ color: textPrimary }}>
                       "{aiAdvice}"
                    </p>
                 </div>
              </div>
           </div>

           <div className="grid lg:grid-cols-2 gap-8 relative z-10">
              <div className="rounded-[40px] pro-card glass-panel p-8 md:p-12 space-y-8">
                 <h3 className="text-2xl font-black flex items-center gap-3" style={{ color: textPrimary }}>
                    <GraduationCap className={`h-8 w-8 ${recommendedStream.color.split(' ')[0]}`} />
                    Why this combination?
                 </h3>
                 <div className="space-y-4">
                    {[
                      "Strong focus on analytical thinking and problem solving",
                      "Direct gateway to highly sought-after professional degrees",
                      "Matches your natural interest in exploring how things work",
                      "Allows you to use your favorite subjects in practical ways"
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 rounded-[24px] transition-colors hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5">
                         <div className={`h-8 w-8 rounded-full ${recommendedStream.color.split(' ')[1]} border ${recommendedStream.color.split(' ')[2]} flex items-center justify-center shrink-0 mt-0.5`}>
                            <CheckCircle2 className={`h-4 w-4 ${recommendedStream.color.split(' ')[0]}`} />
                         </div>
                         <p className="font-bold opacity-80" style={{ color: textPrimary }}>{item}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className={`rounded-[40px] pro-card glass-panel p-8 md:p-12 space-y-8 text-center md:text-left ${recommendedStream.color.split(' ')[1].replace('10', '5')} border-2 ${recommendedStream.color.split(' ')[2]}`}>
                 <h3 className="text-2xl font-black flex items-center justify-center md:justify-start gap-3" style={{ color: textPrimary }}>
                    <Rocket className={`h-8 w-8 ${recommendedStream.color.split(' ')[0]}`} />
                    Career Trajectories
                 </h3>
                 <p className="text-lg font-bold opacity-80" style={{ color: textMuted }}>With a background in <strong className={recommendedStream.color.split(' ')[0]}>{recommendedStream.id}</strong>, you can excel in these rewarding fields:</p>
                 <div className="flex flex-col gap-4">
                    {recommendedStream.careers.map((c) => (
                       <div key={c} className="px-8 py-5 rounded-[24px] bg-white/50 dark:bg-black/20 backdrop-blur-md border border-black/5 dark:border-white/5 font-black text-xl hover:scale-105 transition-transform cursor-default" style={{ color: textPrimary }}>
                          {c}
                       </div>
                    ))}
                 </div>
                 <div className="pt-6">
                    <button 
                      onClick={() => setStage("intro")} 
                      className="px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 mx-auto md:mx-0"
                      style={{ color: textPrimary }}
                    >
                       <RotateCcw className="h-4 w-4" /> Start New Search
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

