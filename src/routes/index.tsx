import { createFileRoute, Link } from "@tanstack/react-router";
import { geminiSimplify } from "@/lib/gemini-server";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/soma/Logo";
import logo from "@/assets/logo.png";
import img1 from "@/assets/img1.png";
import img2 from "@/assets/img2.png";
import {
  ChevronDown,
  Brain,
  BookOpen,
  Star,
  BarChart2,
  Languages,
  Briefcase,
  Upload,
  Sparkles,
  Trophy,
  Check,
  Phone,
  Mail,
  Menu,
  X,
  User,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vive AI — Learn Smarter with your AI study mentor" },
      {
        name: "description",
        content: "AI-powered, inclusive learning platform for African students.",
      },
    ],
  }),
  component: () => <Index routeLanguageCode="en" />,
});

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "For Schools", href: "#schools" },
  { label: "Pricing", href: "#pricing" },
];

const STATS = [
  { value: "150k+", label: "Notes Simplified" },
  { value: "50+", label: "African Languages" },
  { value: "92%", label: "Exam Pass Rate" },
  { value: "12ms", label: "Response Time" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Dyslexia Mode",
    desc: "Switch to high-contrast themes and accessible fonts like OpenDyslexic with one click.",
    color: "#2563EB",
  },
  {
    icon: BookOpen,
    title: "Simplify Notes",
    desc: "Paste any textbook paragraph and let Vive AI rewrite it in simpler language or bullet points.",
    color: "#00C36B",
  },
  {
    icon: Star,
    title: "AI Quizzes",
    desc: "Instantly generate practice tests from your study materials to reinforce learning.",
    color: "#F59E0B",
  },
  {
    icon: Languages,
    title: "Multi-lingual",
    desc: "Learn in Swahili, Yoruba, Zulu or French. Vive speaks your language.",
    color: "#8B5CF6",
  },
  {
    icon: BarChart2,
    title: "Smart Tracking",
    desc: "Visual dashboards show exactly where you excel and where you need more focus.",
    color: "#EC4899",
  },
  {
    icon: Briefcase,
    title: "Career Paths",
    desc: "AI career coach connects your academic strengths to real-world job opportunities.",
    color: "#14B8A6",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Upload Materials",
    desc: "Snap a photo of your textbook or upload a PDF syllabus.",
    icon: Upload,
  },
  {
    num: "2",
    title: "AI Transforms",
    desc: "Our AI adapts the content to your reading style and language preference.",
    icon: Sparkles,
  },
  {
    num: "3",
    title: "Ace Your Exams",
    desc: "Practice with quizzes and follow your custom study roadmap.",
    icon: Trophy,
  },
];

const TESTIMONIALS = [
  {
    initials: 'AK',
    name: 'Amina Kamanzi',
    role: 'S4 Student, Kigali',
    color: 'bg-primary text-white',
    quote: 'I used to struggle with biology notes. Vive AI made everything clear and even quizzed me. My grade went from C to A in one term.',
  },
  {
    initials: 'MN',
    name: 'Mr. Nshimiyimana',
    role: 'Teacher, FAWE Girls School',
    color: 'bg-accent text-white',
    quote: 'I can finally understand which students are struggling. The dashboard shows me exactly who needs help before it is too late.',
  },
  {
    initials: 'EM',
    name: 'Eric Manzi',
    role: 'S5 Student, Musanze',
    color: 'bg-warm text-white',
    quote: 'The dyslexia mode changed everything for me. I no longer get lost in the text. I actually enjoy studying now.',
  },
]

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    color: "#E2E8F0",
    textColor: "#0F172A",
    highlight: false,
    features: [
      "5 note simplifications/day",
      "10 AI quiz questions/day",
      "Basic dyslexia mode",
      "1 language",
      "Community support",
    ],
  },
  {
    name: "Student",
    price: "2,500",
    period: "RWF / month",
    color: "#ffffff",
    textColor: "#0F172A",
    highlight: true,
    features: [
      "Unlimited note simplifications",
      "Unlimited AI quizzes",
      "Full dyslexia & accessibility suite",
      "5+ African languages",
      "Smart progress tracking",
      "Priority support",
    ],
  },
  {
    name: "School",
    price: "Custom",
    period: "per institution",
    color: "#0F172A",
    textColor: "#0F172A",
    highlight: false,
    features: [
      "Everything in Student",
      "Teacher dashboard",
      "Class analytics",
      "Curriculum alignment",
      "Dedicated account manager",
      "LMS integration",
    ],
  },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const LANGUAGES = [
  { code: "rw", flag: "🇷🇼", label: "Kinyarwanda" },
  { code: "us", flag: "🇺🇸", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "French" },
  { code: "ke", flag: "🇰🇪", label: "Kiswahili" },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ QUIZ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export type LandingLanguageCode = "en" | "fr" | "rw" | "sw";

const LANGUAGE_ROUTES: Record<string, `/${LandingLanguageCode}`> = {
  us: "/en",
  en: "/en",
  fr: "/fr",
  rw: "/rw",
  ke: "/sw",
  sw: "/sw",
};

const LANGUAGE_CODE_BY_ROUTE: Record<LandingLanguageCode, string> = {
  en: "us",
  fr: "fr",
  rw: "rw",
  sw: "ke",
};

const getLanguageByRoute = (code: LandingLanguageCode) =>
  LANGUAGES.find((lang) => lang.code === LANGUAGE_CODE_BY_ROUTE[code]) ?? LANGUAGES[1];

const getLanguageRoute = (code: string) => LANGUAGE_ROUTES[code] ?? "/en";

const QUICK_QUIZ_QUESTIONS = [
  {
    q: "What is the main function of chlorophyll?",
    options: ["Store water", "Absorb sunlight", "Produce oxygen", "Break down glucose"],
    answer: 1,
  },
  {
    q: "Where does photosynthesis take place in a plant?",
    options: ["Roots", "Stem", "Chloroplasts", "Mitochondria"],
    answer: 2,
  },
  {
    q: "What gas do plants release during photosynthesis?",
    options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
    answer: 2,
  },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ DEMO WIDGET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DemoWidget() {
  const [activeTab, setActiveTab] = useState<"simplifier" | "quiz">("simplifier");

  // â”€â”€ Simplifier state â”€â”€
  const [noteText, setNoteText] = useState(
    "Photosynthesis is the process by which plants convert light energy into chemical energy stored as glucose. It occurs in the chloroplasts using chlorophyll to absorb sunlight. The equation is: 6COâ‚‚ + 6Hâ‚‚O + light â†’ Câ‚†Hâ‚â‚‚Oâ‚† + 6Oâ‚‚. It has two stages: light-dependent reactions and the Calvin cycle."
  );
  const [simplified, setSimplified] = useState<string[] | null>(null);
  const [keywords, setKeywords]     = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [speaking, setSpeaking]     = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const handleSimplify = async () => {
    if (!noteText.trim()) return;
    setLoading(true);
    setSimplified(null);
    setKeywords([]);
    try {
      // Use secure server-side Gemini â€” no API key exposed to browser
      const prompt = `You are Vive AI, a study helper for African students aged 12-18.
Simplify the following note into clear, easy numbered steps a teen can understand.
Then list 3-5 KEY WORDS from the text.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{"steps":["step 1","step 2","step 3"],"keywords":["word1","word2","word3"]}

Note to simplify:
${noteText}`;

      const raw = await geminiSimplify({ data: { text: prompt, promptType: "quiz-start", temperature: 0.4 } });
      const clean = (raw ?? "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setSimplified(parsed.steps ?? []);
      setKeywords(parsed.keywords ?? []);
    } catch {
      setSimplified(["Could not simplify right now. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!simplified || !synthRef.current) return;
    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }
    const text = simplified.map((s, i) => `${i + 1}. ${s}`).join(". ");
    const utt  = new SpeechSynthesisUtterance(text);
    utt.rate   = 0.9;
    utt.onend  = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synthRef.current.speak(utt);
  };

  // â”€â”€ Quiz state â”€â”€
  const [qIdx, setQIdx]       = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore]     = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === QUICK_QUIZ_QUESTIONS[qIdx].answer) setScore(s => s + 1);
  };
  const handleNext = () => {
    if (qIdx < QUICK_QUIZ_QUESTIONS.length - 1) { setQIdx(q => q + 1); setSelected(null); }
    else setQuizDone(true);
  };
  const resetQuiz = () => { setQIdx(0); setSelected(null); setScore(0); setQuizDone(false); };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-[28px] shadow-lg border border-gray-100 overflow-hidden">

      {/* â”€â”€ Tabs â”€â”€ */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("simplifier")}
          className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
            activeTab === "simplifier"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#94A3B8] hover:text-[#475569]"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Note simplifier
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
            activeTab === "quiz"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-[#94A3B8] hover:text-[#475569]"
          }`}
        >
          <Star className="h-4 w-4" /> Quick quiz
        </button>
      </div>

      {/* â”€â”€ SIMPLIFIER TAB â”€â”€ */}
      {activeTab === "simplifier" && (
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

          {/* Left â€” input */}
          <div className="p-8 flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Your Notes</p>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={8}
              placeholder="Paste your textbook notes here..."
              className="w-full text-sm text-[#374151] leading-relaxed bg-[#F8FAFC] border border-gray-200 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
            <button
              onClick={handleSimplify}
              disabled={loading || !noteText.trim()}
              className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Simplifying...
                </>
              ) : (
                <><SparkleIcon /> Simplify with AI</>
              )}
            </button>
          </div>

          {/* Right â€” output */}
          <div className="p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Simplified Version</p>
              {simplified && (
                <button
                  onClick={handleReadAloud}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                    speaking
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "text-[#475569] border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  {speaking ? "â¹ Stop" : "â–· Read aloud"}
                </button>
              )}
            </div>

            {/* Output area */}
            <div className="flex-1 min-h-[200px] bg-[#F8FAFC] rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              {!simplified && !loading && (
                <p className="text-sm text-[#94A3B8] italic m-auto text-center">
                  Your simplified notes will appear here after you click "Simplify with AI"
                </p>
              )}
              {loading && (
                <div className="m-auto flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
                  <p className="text-xs text-[#94A3B8] font-semibold">Vive AI is thinking...</p>
                </div>
              )}
              {simplified && simplified.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#1E293B] leading-relaxed">
                  <span className="text-[#94A3B8] font-black text-xs mt-0.5 shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] w-full">Key Words</span>
                {keywords.map(kw => (
                  <span key={kw} className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold border border-[#BFDBFE]">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* â”€â”€ QUIZ TAB â”€â”€ */}
      {activeTab === "quiz" && (
        <div className="p-8 max-w-2xl mx-auto">
          {quizDone ? (
            <div className="text-center space-y-6 py-8">
              <div className="text-6xl">{score === 3 ? "🏆" : score >= 2 ? "🌟" : "📚"}</div>
              <h3 className="text-2xl font-black">You scored {score}/{QUICK_QUIZ_QUESTIONS.length}</h3>
              <p className="text-sm text-[#64748B] font-medium">
                {score === 3 ? "🏆" : score >= 2 ? "🌟" : "📚"}
              </p>
              <button onClick={resetQuiz} className="h-11 px-8 rounded-2xl bg-[#2563EB] text-white text-sm font-black hover:bg-[#1D4ED8] transition-all hover:scale-105">
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                  Question {qIdx + 1} of {QUICK_QUIZ_QUESTIONS.length}
                </p>
                <div className="flex gap-1">
                  {QUICK_QUIZ_QUESTIONS.map((_, i) => (
                    <div key={i} className={`w-8 h-1.5 rounded-full transition-colors ${i <= qIdx ? "bg-[#2563EB]" : "bg-gray-200"}`} />
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-black text-[#0F172A] leading-snug">
                {QUICK_QUIZ_QUESTIONS[qIdx].q}
              </h3>

              <div className="grid gap-3">
                {QUICK_QUIZ_QUESTIONS[qIdx].options.map((opt, i) => {
                  const isCorrect  = i === QUICK_QUIZ_QUESTIONS[qIdx].answer;
                  const isSelected = i === selected;
                  let style = "border-gray-200 text-[#374151] hover:border-[#2563EB] hover:bg-[#EFF6FF]";
                  if (selected !== null) {
                    if (isCorrect)       style = "border-[#00C36B] bg-[#F0FDF4] text-[#16A34A]";
                    else if (isSelected) style = "border-red-400 bg-red-50 text-red-600";
                    else                 style = "border-gray-100 text-[#94A3B8]";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all ${style}`}
                    >
                      <span className="font-black mr-2 text-xs">{["A","B","C","D"][i]}.</span>{opt}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <button
                  onClick={handleNext}
                  className="w-full h-11 rounded-2xl bg-[#2563EB] text-white text-sm font-black hover:bg-[#1D4ED8] transition-all hover:scale-[1.02]"
                >
                  {qIdx < QUICK_QUIZ_QUESTIONS.length - 1 ? "Next Question â†’" : "See Results"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAIN INDEX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function Index({ routeLanguageCode }: { routeLanguageCode: LandingLanguageCode }) {
  const [dyslexia, setDyslexia] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const selectedLang = getLanguageByRoute(routeLanguageCode);
  const languageHome = getLanguageRoute(selectedLang.code);

  return (
    <div
      className={`min-h-screen bg-white text-[#0F172A] font-sans selection:bg-[#00C36B]/30 ${dyslexia ? "dyslexia-mode" : ""}`}
      style={
        dyslexia
          ? ({ fontFamily: "OpenDyslexic, Arial, sans-serif", fontSize: "1.05em", lineHeight: "1.8" } as React.CSSProperties)
          : {}
      }
    >
      {/* â”€â”€ NAVBAR â”€â”€ */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to={languageHome}>
            <Logo size={42} lightBg={true} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#2563EB] hover:after:w-full after:transition-all after:duration-300"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Accessibility and Language Group */}
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/60 rounded-full p-1">
              {/* Language Dropdown */}
              <div className="relative" onMouseEnter={() => setLangOpen(true)} onMouseLeave={() => setLangOpen(false)}>
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#475569] hover:text-[#0F172A] rounded-full px-3 py-1.5 transition-colors bg-white shadow-sm border border-gray-100">
                  <span className="text-sm leading-none">{selectedLang.flag}</span>
                  <span>{selectedLang.label}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown panel */}
                {langOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 py-1">
                    {LANGUAGES.map((lang) => (
                      <Link
                        key={lang.code}
                        to={getLanguageRoute(lang.code)}
                        onClick={() => setLangOpen(false)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                          selectedLang.code === lang.code
                            ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                            : "text-[#374151] hover:bg-gray-50 font-semibold"
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span className="flex-1">{lang.label}</span>
                        {selectedLang.code === lang.code && (
                          <span className="text-[#2563EB]">âœ“</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Dyslexia Toggle */}
              <button
                onClick={() => setDyslexia(!dyslexia)}
                title="Toggle Dyslexia-friendly font & theme"
                className={`flex items-center gap-2 text-xs font-bold rounded-full px-3 py-1.5 transition-all ${
                  dyslexia
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#475569] hover:text-[#0F172A] hover:bg-white/50"
                }`}
              >
                <span className="text-xs font-semibold">Aa</span>
                <span className="hidden xl:inline">Dyslexia</span>
              </button>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <Button
                className="h-9 px-5 text-sm font-bold bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-1.5"
                asChild
              >
                <Link to="/island">🏝️ Explore Vive Island</Link>
              </Button>
              <Link
                to="/login"
                className="text-sm font-bold text-[#475569] hover:text-[#2563EB] transition-colors px-3 py-1.5"
              >
                Login
              </Link>
              <Button
                className="h-9 px-5 text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5"
                asChild
              >
                <Link to="/login">Get started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button className="lg:hidden p-2 rounded-lg text-[#475569]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-5 space-y-5 animate-in slide-in-from-top duration-300">
            <div className="space-y-3.5">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="block text-sm font-bold text-[#475569] hover:text-[#2563EB] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </div>
            
            {/* Mobile Settings */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
              {/* Dyslexia Toggle */}
              <button
                onClick={() => setDyslexia(!dyslexia)}
                className={`flex items-center gap-2 text-xs font-bold rounded-full px-4 py-2 border transition-all ${
                  dyslexia
                     ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "text-[#475569] border-gray-200 bg-gray-50"
                }`}
              >
                <span>Aa Dyslexia mode</span>
              </button>

              {/* Language selection in mobile */}
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <Link
                    key={lang.code}
                    to={getLanguageRoute(lang.code)}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      selectedLang.code === lang.code
                        ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                        : "text-[#475569] border-gray-200 bg-gray-50"
                    }`}
                  >
                    <span>{lang.flag} {lang.code.toUpperCase()}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
              <Button
                className="w-full h-11 text-sm font-bold bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-full flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all"
                asChild
              >
                <Link to="/island" onClick={() => setMobileOpen(false)}>
                  🏝️ Explore Vive Island
                </Link>
              </Button>
              <div className="flex items-center gap-4 pt-1">
                <Link to="/login" className="text-sm font-bold text-[#475569] hover:text-[#2563EB]" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Button
                  className="h-10 px-6 text-sm font-bold bg-[#2563EB] text-white rounded-full flex-1"
                  asChild
                >
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Get started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* â”€â”€ HERO â”€â”€ */}
      <section className="relative pt-1 pb-1 overflow-visible" style={{ background: "#f5f0f5" }}>
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute top-[-80px] right-[10%] w-[300px] h-[300px] rounded-full z-0" style={{ background: "rgba(7, 74, 218, 0.07)" }} />
        <div aria-hidden="true" className="absolute bottom-[200px] left-[-2%] w-[100px] h-[100px] rounded-full z-0" style={{ background: "rgba(6, 19, 78, 0.08)" }} />

        {/* Bottom wave / scallop */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <circle key={i} cx={i * 120 + 60} cy={60} r={62} fill="white" />
            ))}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#BFDBFE] backdrop-blur-sm">
              <SparkleIcon />
              <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">AI study mentor for Africa</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-[#0F172A]">
              Learn smarter with your AI{" "}
              <span className="text-[#2563EB]">study buddy</span>
            </h1>
            <p className="text-base text-[#4B5563] max-w-md leading-relaxed font-medium">
              Vive AI simplifies your notes, builds personal study plans, and quizzes you so every student can succeed, even with dyslexia or reading challenges.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-7 text-sm font-bold bg-[#22C55E] hover:bg-[#1D4ED8] text-white rounded-2xl" asChild>
                <Link to="/login">Get started for free</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 text-sm font-bold border-2 border-gray-300 rounded-2xl text-[#0F172A] hover:bg-black hover:border-white hover:text-white bg-white/60" asChild>
                <a href="#demo">Watch Demo</a>
              </Button>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-9 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">1000 rate from different schools</span>
            </div>
          </div>

          {/* Right â€“ Hero Image with ring + floating avatars */}
          <div className="relative flex justify-center items-center py-10 overflow-hidden md:overflow-visible">
            {/* Outer ring */}
            <div
              aria-hidden="true"
              className="absolute hidden md:block"
              style={{
                width: 550,
                height: 520,
                borderRadius: "50%",
                border: "6px solid rgba(100,120,220,0.25)",
              }}
            />
            {/* Inner ring */}
            <div
              aria-hidden="true"
              className="absolute hidden md:block"
              style={{
                width: 500,
                height: 480,
                borderRadius: "50%",
                border: "4px solid rgba(100,120,220,0.15)",
              }}
            />

            {/* Floating avatar â€“ top center */}
            <div
              className="absolute z-20 hidden md:block"
              style={{ top: 0, left: "50%", transform: "translateX(-50%)" }}
            >
              <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                <img src={img2} alt="Student" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Floating avatar â€“ left middle */}
            <div
              className="absolute z-20 hidden md:block"
              style={{ top: "50%", left: -10, transform: "translateY(-50%)" }}
            >
              <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                <img src={img2} alt="Student" className="w-full h-full object-cover object-top" />
              </div>
            </div>

            {/* Floating avatar â€“ right middle */}
            <div
              className="absolute z-20 hidden md:block"
              style={{ top: "50%", right: -10, transform: "translateY(-50%)" }}
            >
              <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                <img src={img2} alt="Student" className="w-full h-full object-cover object-bottom" />
              </div>
            </div>

            {/* Main image â€“ clipped circle bottom */}
            <div
              className="relative z-10 overflow-hidden w-[280px] h-[350px] sm:w-[400px] sm:h-[500px]"
              style={{
                borderRadius: "140px 140px 0 0",
                background: "rgba(180,160,200,0.25)",
              }}
            >
              <img
                src={img1}
                alt="Student learning with Vive AI"
                className="w-full h-full object-cover object-top"
              />

              
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ STATS BAR â”€â”€ */}
      <div className="bg-white border-y border-white py-10 mt-">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-[#2563EB]">{s.value}</div>
              <div className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ FEATURES â”€â”€ */}
      <section id="features" className="py-28 bg-[#F0F4FF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">Tools for Every Learner</h2>
            <p className="text-sm text-[#64748B] font-semibold">Designed to remove barriers and spark curiosity</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group bg-white rounded-3xl p-8 flex flex-col items-center text-center gap-5 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border border-gray-100"
              >
                {/* Large icon in a soft coloured circle */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "linear-gradient(135deg, #2563EB18, #2563EB35)" }}
                >
                  <f.icon className="h-9 w-9 text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-black text-[#2563EB]">
                  {f.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ DEMO â”€â”€ */}
      <section id="demo" className="py-28 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-[#2563EB]">Experience Vive</p>
            <h2 className="text-4xl font-black tracking-tight">See how it works</h2>
            <p className="text-sm text-[#64748B] font-semibold max-w-lg mx-auto">
              Paste any textbook paragraph â€” Vive AI breaks it down into simple steps and quizzes you instantly.
            </p>
          </div>
          <DemoWidget />
        </div>
      </section>

      {/* â”€â”€ 3 STEPS â”€â”€ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight">Three Steps to Success</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((s, i) => (
              <div key={s.num} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xl font-black mx-auto">{s.num}</div>
                <h3 className="text-lg font-black">{s.title}</h3>
                <p className="text-sm text-[#64748B] font-medium leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ TESTIMONIALS â”€â”€ */}
      <section className="bg-[#3B6AE8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label text-white/60 block mb-3">Student stories</span>
            <h2 className="font-display font-bold text-[36px] text-white">Loved by students and teachers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-[20px] p-6 flex flex-col gap-4 shadow-float">
                <div className="flex gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <i key={i} className="ti ti-star-filled text-warm text-[16px]" aria-hidden="true" />
                  ))}
                </div>
                <p className="font-body text-textMid text-[14px] leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-display font-bold text-[13px] flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-[14px] text-textDark">{t.name}</p>
                    <p className="font-body text-[12px] text-textMuted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ PRICING â”€â”€ */}
      <section id="pricing" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl font-black tracking-tight">Simple, fair pricing</h2>
            <p className="text-sm text-[#64748B] font-semibold max-w-md mx-auto">Start free, upgrade when you're ready. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 flex flex-col gap-6 ${
                  plan.highlight
                    ? "ring-4 ring-[#2563EB] ring-offset-2 scale-105 shadow-xl"
                    : "border border-gray-100"
                }`}
                style={{ background: plan.highlight ? "linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)" : "#F8FAFC" }}
              >
                {plan.highlight && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-black text-center">Most Popular</div>
                )}
                <div>
                  <div className="text-lg font-black" style={{ color: plan.textColor }}>{plan.name}</div>
                  <div className="flex items-baseline gap-1 mt-2">
                    {plan.price !== "Custom" && (
                      <span className="text-3xl font-black" style={{ color: plan.textColor }}>
                        {plan.price === "0" ? "Free" : plan.price}
                      </span>
                    )}
                    {plan.price === "Custom" && (
                      <span className="text-3xl font-black" style={{ color: plan.textColor }}>Custom</span>
                    )}
                    {plan.price !== "0" && plan.price !== "Custom" && (
                      <span className="text-xs font-bold opacity-70" style={{ color: plan.textColor }}>{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm font-medium"
                      style={{ color: plan.textColor }}
                    >
                      <Check
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: plan.highlight ? "#2563EB" : "#00C36B" }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full h-11 rounded-2xl text-sm font-black transition-transform hover:scale-105 ${
                    plan.highlight
                      ? "bg-white text-[#2563EB] hover:bg-[#F1F5F9] border border-blue-100 shadow-sm"
                      : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  }`}
                  asChild
                >
                  <Link to="/login">
                    {plan.price === "Custom" ? "Contact Us" : plan.price === "0" ? "Get started free" : "Get Student Plan"}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA BANNER â”€â”€ */}
      <section id="schools" className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative rounded-[48px] bg-[#0F172A] overflow-hidden p-14 lg:p-20 flex flex-col lg:flex-row items-center gap-14">
          <div className="relative z-10 text-white space-y-6 lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">Start Your Learning Journey Today</h2>
            <p className="text-base opacity-80 font-medium leading-relaxed">
              Join thousands of students across Rwanda using Vive AI to achieve higher grades and clearer understanding.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-12 px-8 rounded-2xl font-black text-sm transition-transform hover:scale-105" asChild>
                <Link to="/login">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white/20 text-black hover:bg-white/10 h-12 px-8 rounded-2xl font-black text-sm" asChild>
                <a href="#schools">For Schools</a>
              </Button>
            </div>
          </div>
          <div className="relative lg:w-1/2 flex justify-center">
            <div className="w-full max-w-xs aspect-square rounded-[40px] overflow-hidden ring-8 ring-white/10">
              <img src={img2} alt="Student with Vive AI" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ FOOTER â”€â”€ */}
      <footer className="bg-[#0F172A] text-gray-400 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-white/5 pb-16">

            {/* Brand */}
            <div className="space-y-5 md:col-span-2">
              <Logo size={42} lightBg={false} />
              <p className="text-xs leading-relaxed max-w-xs font-medium">
                The smart mentor for the modern African student. Making education
                accessible, personalised, and engaging through AI.
              </p>
            </div>

            {/* Products */}
            <div className="space-y-5">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Products</h3>
              <ul className="space-y-3 text-sm font-semibold">
                <li><Link to="/student" className="hover:text-[#00C36B] transition-colors">AI Notes</Link></li>
                <li><Link to="/student" className="hover:text-[#00C36B] transition-colors">Quiz Bank</Link></li>
                <li><a href="#" className="hover:text-[#00C36B] transition-colors">Study Planner</a></li>
                <li><a href="#schools" className="hover:text-[#00C36B] transition-colors">For Schools</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-5">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Support</h3>
              <ul className="space-y-3 text-sm font-semibold">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#00C36B]" />
                  +250 785 0XX XXX
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#00C36B]" />
                  viveai@gmail.com
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-semibold uppercase tracking-widest">
              Â© 2026 Vive AI Education. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["𝕏", "in", "f"].map((s) => (
                <button key={s} className="w-9 h-9 rounded-full border border-white/10 text-sm flex items-center justify-center hover:border-[#00C36B] hover:text-[#00C36B] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2563EB]">
      <path d="M12 3L14.5 9L21 12L14.5 15L12 21L9.5 15L3 12L9.5 9L12 3Z" fill="currentColor" />
    </svg>
  );
}


