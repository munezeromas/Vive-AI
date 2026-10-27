import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Brain, ArrowRight, RotateCcw, Send, Mic, MicOff,
  Trophy, CheckCircle2, XCircle, ChevronRight, Volume2, Zap, Target, Clock, Award
} from "lucide-react";
import { geminiSimplify } from "@/lib/gemini-server";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { toast } from "sonner";

export const Route = createFileRoute("/student/ai-quizzes")({
  head: () => ({ meta: [{ title: "AI Quizzes — Vive AI" }] }),
  component: AIQuizzes,
});

// ── Subject catalogue (broad & professional) ──────────────────────────────────
const SUBJECTS = [
  { label: "Mathematics",       emoji: "🔢", color: "from-sky-500 to-cyan-400" },
  { label: "English",           emoji: "📖", color: "from-violet-500 to-purple-400" },
  { label: "Science",           emoji: "🔬", color: "from-emerald-500 to-green-400" },
  { label: "Social Studies",    emoji: "🌍", color: "from-amber-500 to-yellow-400" },
  { label: "ICT & Programming", emoji: "💻", color: "from-indigo-500 to-blue-400" },
  { label: "History & Civics",  emoji: "🏛️", color: "from-rose-500 to-pink-400" },
  { label: "Biology",           emoji: "🧬", color: "from-teal-500 to-green-400" },
  { label: "Chemistry",         emoji: "⚗️", color: "from-orange-500 to-amber-400" },
  { label: "Physics",           emoji: "⚡", color: "from-yellow-500 to-orange-400" },
  { label: "Geography",         emoji: "🗺️", color: "from-blue-500 to-indigo-400" },
  { label: "Art & Creativity",  emoji: "🎨", color: "from-pink-500 to-rose-400" },
  { label: "Critical Thinking", emoji: "🧩", color: "from-purple-600 to-violet-400" },
];

const GRADES = ["P1","P2","P3","P4","P5","P6","S1","S2","S3","S4","S5","S6","University"];

const DIFFICULTIES = [
  { label: "Easy",   emoji: "🟢", desc: "Basic recall & understanding" },
  { label: "Medium", emoji: "🟡", desc: "Application & analysis" },
  { label: "Hard",   emoji: "🔴", desc: "Synthesis & critical thinking" },
];

// Broad, rotating sub-topics per subject — ensures genuine variety
const SUBJECT_TOPICS: Record<string, string[]> = {
  "Mathematics": [
    "algebra and equations","fractions and decimals","geometry and shapes",
    "statistics and probability","number theory","calculus concepts",
    "ratios and proportions","measurement and units","word problems","sequences and patterns",
  ],
  "English": [
    "grammar and syntax","reading comprehension","vocabulary and word origins",
    "essay writing","literary devices","poetry analysis",
    "persuasive writing","punctuation","synonyms and antonyms","text structures",
  ],
  "Science": [
    "scientific method","ecosystems and ecology","the human body",
    "matter and its properties","energy and forces","genetics and heredity",
    "the water cycle","photosynthesis","chemical reactions","motion and physics",
  ],
  "Social Studies": [
    "world cultures","government and democracy","economic systems",
    "human rights","globalisation","African history",
    "Rwandan culture and provinces","environmental conservation","trade and resources","civic responsibility",
  ],
  "ICT & Programming": [
    "algorithms and flowcharts","programming fundamentals","data types and variables",
    "web development basics","cybersecurity","artificial intelligence concepts",
    "databases","networks and the internet","software development lifecycle","digital literacy",
  ],
  "History & Civics": [
    "African independence movements","World War I and II","ancient civilizations",
    "Rwandan genocide and reconciliation","civil rights movements","the United Nations",
    "colonialism and decolonization","constitutional law","elections and democracy","human rights history",
  ],
  "Biology": [
    "cell biology","genetics and DNA","ecosystems and biodiversity",
    "evolution","human anatomy","plant biology",
    "microbiology","immunology","ecology","reproductive biology",
  ],
  "Chemistry": [
    "periodic table and elements","chemical bonding","acids and bases",
    "stoichiometry","organic chemistry","electrochemistry",
    "thermodynamics","kinetics","chemical equations","laboratory safety",
  ],
  "Physics": [
    "Newton's laws of motion","energy and work","electromagnetism",
    "waves and optics","quantum mechanics basics","thermodynamics",
    "gravitational fields","relativity concepts","nuclear physics","fluid mechanics",
  ],
  "Geography": [
    "plate tectonics","climate zones","human migration",
    "natural resources","urbanisation","map reading and cartography",
    "East African geography","rivers and water bodies","population dynamics","environmental geography",
  ],
  "Art & Creativity": [
    "colour theory and mixing","perspective drawing","African traditional art",
    "digital art tools","art history","sculptural techniques",
    "photography basics","design principles","Rwandan crafts","art criticism",
  ],
  "Critical Thinking": [
    "logical fallacies","argument analysis","problem-solving strategies",
    "evidence evaluation","bias and perspective","deductive vs inductive reasoning",
    "ethical dilemmas","decision-making frameworks","data interpretation","creative solutions",
  ],
};

// Question type cycle per question index
const TYPE_CYCLE = ["multiple_choice","open","multiple_choice","speaking","multiple_choice"] as const;

function getTopic(subject: string, index: number): string {
  const list = SUBJECT_TOPICS[subject] ?? [subject];
  return list[index % list.length];
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuizQuestion {
  type: "multiple_choice" | "open" | "speaking";
  question: string;
  options?: string[];
  correct?: string;
}

// ── Parsers ───────────────────────────────────────────────────────────────────
function parseQuestion(raw: string, type: string): QuizQuestion {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  if (type === "multiple_choice") {
    const questionLine = lines.find(l => l.toUpperCase().startsWith("QUESTION:"))?.replace(/^QUESTION:\s*/i, "") ?? raw;
    const options = lines.filter(l => /^[A-D][).:]\s/.test(l));
    const correctLine = lines.find(l => /^(CORRECT|ANSWER):/i.test(l));
    const correct = correctLine?.match(/[A-D]/)?.[0];
    if (options.length >= 2) return { type: "multiple_choice", question: questionLine, options, correct };
  }
  const questionText = lines.find(l => l.toUpperCase().startsWith("QUESTION:"))?.replace(/^QUESTION:\s*/i, "") ?? raw;
  return { type: type as any, question: questionText };
}

function getAnswerLetter(answer: string): string | undefined {
  const n = answer.toUpperCase().trim();
  const m = n.match(/^([A-D])[).: ]*/);
  if (m) return m[1];
  if (/\bOPTION\s*A\b|\bA\b/.test(n)) return "A";
  if (/\bOPTION\s*B\b|\bB\b/.test(n)) return "B";
  if (/\bOPTION\s*C\b|\bC\b/.test(n)) return "C";
  if (/\bOPTION\s*D\b|\bD\b/.test(n)) return "D";
  return undefined;
}

function parseQuizResult(response: string): { correct: boolean; feedback: string } | null {
  const jsonMatch = response.trim().match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const p = JSON.parse(jsonMatch[0]);
      if (typeof p.correct === "boolean" && typeof p.feedback === "string") return p;
    } catch { /* ignore */ }
  }
  const lower = response.toLowerCase();
  const neg = /\b(not quite|incorrect|wrong|no|false|not correct|did not)\b/;
  const pos = /\b(correct|right|true|yes|excellent|well done|great job|perfect)\b/;
  if (neg.test(lower) && !pos.test(lower)) return { correct: false, feedback: response.trim() };
  if (pos.test(lower) && !neg.test(lower)) return { correct: true, feedback: response.trim() };
  return null;
}

const FRIENDLY_MIC: Record<string, { message: string; suggestion: string }> = {
  "not-allowed":        { message: "Microphone access is blocked!", suggestion: "Click the lock 🔒 in your address bar → set Microphone to 'Allow'. On Windows, also check Settings → Privacy → Microphone." },
  "audio-capture":      { message: "No microphone detected!", suggestion: "Plug in a microphone or headset, make sure it is powered on and selected as the default input device." },
  "network":            { message: "Internet connection issue!", suggestion: "Speech recognition needs a stable internet connection. Check your Wi-Fi and try again." },
  "service-not-allowed":{ message: "Speech service not allowed!", suggestion: "Try Google Chrome for the best speech recognition support." },
  "no-speech":          { message: "We didn't hear anything!", suggestion: "Speak louder or check your microphone. Click the mic button to try again!" },
};
function getFriendlyMicError(code: string) {
  return FRIENDLY_MIC[code] ?? { message: `Microphone issue: ${code}`, suggestion: "Try refreshing the page or using Google Chrome." };
}

// ── Prompt builders ───────────────────────────────────────────────────────────
function buildQuestionPrompt(
  i: number, total: number, grade: string, subject: string, topic: string,
  difficulty: string, type: string, seed: string, prevQuestions: string[]
): string {
  const difficultyInstr = difficulty === "Easy"
    ? "Make this a basic recall question appropriate for a beginner."
    : difficulty === "Hard"
    ? "Make this a challenging synthesis or critical-thinking question requiring deep understanding."
    : "Make this a moderate application question requiring understanding and some reasoning.";

  const prevBlock = prevQuestions.length > 0
    ? `\n\nDo NOT repeat or rephrase any of these already-asked questions:\n${prevQuestions.map((q, n) => `${n + 1}. ${q}`).join("\n")}`
    : "";

  if (type === "multiple_choice") {
    return `You are generating quiz question ${i + 1} of ${total} for a ${grade} student.\nSubject: ${subject}\nTopic: "${topic}"\nDifficulty: ${difficulty} — ${difficultyInstr}\nSeed: ${seed}${prevBlock}\n\nGenerate ONE unique multiple-choice question about "${topic}" in ${subject}. Use real-world context, African examples, or Rwandan context where natural.\n\nOutput EXACTLY this format, no other text:\nQUESTION: [question text here]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nCORRECT: [A, B, C, or D]`;
  }
  return `You are generating quiz question ${i + 1} of ${total} for a ${grade} student.\nSubject: ${subject}\nTopic: "${topic}"\nDifficulty: ${difficulty} — ${difficultyInstr}\nSeed: ${seed}${prevBlock}\n\nGenerate ONE unique ${type === "speaking" ? "spoken verbal" : "open-ended short-answer"} question about "${topic}" in ${subject}.\n\nOutput EXACTLY this format, no other text:\nQUESTION: [question text here]`;
}

function buildEvalPrompt(q: QuizQuestion, ans: string, grade: string): string {
  const optBlock = q.type === "multiple_choice" && q.options
    ? `ANSWER OPTIONS:\n${q.options.join("\n")}\nCORRECT ANSWER: Option ${q.correct}\n`
    : "";
  return `A ${grade} student answered the following quiz question.\n\nQUESTION: "${q.question}"\n${optBlock}STUDENT'S ANSWER: "${ans}"\n\nEvaluate the answer and give a clear educational explanation:\n- If CORRECT: celebrate briefly, then explain WHY the answer is right in 2-3 sentences. Add a helpful fact or real-world example.\n- If WRONG: be kind. State the CORRECT answer clearly. Explain in 2-3 sentences WHY it is correct and what was wrong about the student's answer.\n\nRULES:\n- Use language appropriate for a ${grade} student.\n- NEVER give only vague praise — always include educational reasoning.\n- Keep total response under 5 sentences.\n\nOutput ONLY this JSON (no other text):\n{"correct": true|false, "feedback": "Your complete explanation as a single paragraph string."}`;
}

// ── Main Component ─────────────────────────────────────────────────────────────
function AIQuizzes() {
  const [step, setStep] = useState<"setup" | "quiz" | "result">("setup");
  const [subject, setSubject]     = useState("");
  const [grade, setGrade]         = useState("P3");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState<string[]>([]);
  const [correctness, setCorrectness] = useState<boolean[]>([]);
  const [feedback, setFeedback]   = useState<{
    text: string;
    isCorrect: boolean;
    correctAnswer: string;
    studentAnswer: string;
  } | null>(null);
  const [quizFeedbacks, setQuizFeedbacks] = useState<{
    text: string;
    isCorrect: boolean;
    correctAnswer: string;
    studentAnswer: string;
  }[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);
  const [openAnswer, setOpenAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript]   = useState("");
  const [score, setScore]         = useState(0);
  const [micError, setMicError]   = useState<{ message: string; suggestion: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const recognitionRef   = useRef<any>(null);
  const shouldBeListeningRef = useRef(false);
  const accumulatedRef   = useRef("");
  const dspStreamRef     = useRef<MediaStream | null>(null);
  const spokenTextRef    = useRef("");

  // Cleanup on unmount
  useEffect(() => () => {
    shouldBeListeningRef.current = false;
    recognitionRef.current?.stop();
    dspStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // ── DSP warm-up ───────────────────────────────────────────────────
  const startDSP = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        dspStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
      }
    } catch { /* ignore */ }
  };
  const stopDSP = () => {
    dspStreamRef.current?.getTracks().forEach(t => t.stop());
    dspStreamRef.current = null;
  };

  // ── Generate quiz questions (parallel batch) ───────────────────────
  const startQuiz = async () => {
    if (!subject.trim()) return;
    setStep("quiz");
    setGenerating(true);
    setLoading(false);
    setCurrentQ(0);
    setAnswers([]);
    setCorrectness([]);
    setFeedback(null);
    setQuestions([]);
    setMicError(null);
    setScore(0);
    setGeneratedCount(0);

    const seenQuestions: string[] = [];
    const generated: QuizQuestion[] = new Array(numQuestions).fill(null);
    let count = 0;

    // Fire all requests in parallel
    const tasks = Array.from({ length: numQuestions }, (_, i) => {
      const type = TYPE_CYCLE[i % TYPE_CYCLE.length];
      const topic = getTopic(subject, i);
      const seed  = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return (async () => {
        const prompt = buildQuestionPrompt(i, numQuestions, grade, subject, topic, difficulty, type, seed, seenQuestions);
        try {
          const raw = await geminiSimplify({ data: { text: prompt, grade, subject, promptType: "quiz-start", temperature: 1.1 } });
          const parsed = parseQuestion(raw ?? "", type);
          const isDupe = seenQuestions.some(sq => sq.toLowerCase().trim() === parsed.question.toLowerCase().trim());
          const final = isDupe
            ? { type: "open" as const, question: `Describe in your own words what "${topic}" means in ${subject}.` }
            : parsed;
          seenQuestions.push(final.question);
          generated[i] = final;
        } catch {
          generated[i] = { type: "open", question: `Tell me one important fact you know about "${topic}" in ${subject}.` };
        }
        count++;
        setGeneratedCount(count);
      })();
    });

    await Promise.allSettled(tasks);
    setQuestions(generated.filter(Boolean));
    setGenerating(false);
  };

  // ── Submit answer ──────────────────────────────────────────────────
  const submitAnswer = async (ans: string) => {
    if (!ans.trim() || loading) return;
    if (shouldBeListeningRef.current && recognitionRef.current) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      stopDSP();
      setIsListening(false);
    }
    setLoading(true);
    const q = questions[currentQ];
    const evalPrompt = buildEvalPrompt(q, ans, grade);

    let isCorrect = false;
    let feedbackText = "";

    // Build a human-readable correct answer string
    const getCorrectAnswerLabel = (): string => {
      if (q.type === "multiple_choice" && q.correct && q.options) {
        const fullOpt = q.options.find(o => o.toUpperCase().startsWith(q.correct!));
        return fullOpt ? fullOpt : `Option ${q.correct}`;
      }
      return "See explanation below";
    };

    // Build human-readable student answer string
    const getStudentAnswerLabel = (): string => {
      if (q.type === "multiple_choice" && q.options) {
        const letter = getAnswerLetter(ans);
        if (letter) {
          const full = q.options.find(o => o.toUpperCase().startsWith(letter));
          return full ? full : ans;
        }
      }
      return ans;
    };

    try {
      const fb = await geminiSimplify({ data: { text: evalPrompt, grade, subject, promptType: "quiz-answer" } });
      const result = parseQuizResult(fb ?? "");

      if (q.type === "multiple_choice" && q.correct) {
        const letter = getAnswerLetter(ans);
        isCorrect = letter ? letter === q.correct : result?.correct === true;
      } else {
        isCorrect = result?.correct === true;
      }

      feedbackText = result?.feedback ?? fb ?? "";
      if (!feedbackText || feedbackText.trim().length < 15) {
        if (q.type === "multiple_choice" && q.correct && q.options) {
          const correctOpt = q.options.find(o => o.toUpperCase().startsWith(q.correct!));
          feedbackText = isCorrect
            ? `That's right! Option ${q.correct} is correct because it best answers the question. Understanding this will help you with similar problems in ${subject}.`
            : `The correct answer is Option ${q.correct}: ${correctOpt ?? ""}. Review why this option is correct and how it relates to the topic "${subject}".`;
        } else {
          feedbackText = isCorrect
            ? "Well done! Your answer shows a solid understanding of the concept. Keep applying this knowledge!"
            : "That's not quite right. Review this topic carefully — every mistake is a step closer to mastering it!";
        }
      }
    } catch {
      if (q.type === "multiple_choice" && q.correct && q.options) {
        const correctOpt = q.options.find(o => o.toUpperCase().startsWith(q.correct!));
        const letter = getAnswerLetter(ans);
        isCorrect = !!letter && letter === q.correct;
        feedbackText = isCorrect
          ? `Correct! Option ${q.correct} is the right answer: ${correctOpt ?? ""}. Great job!`
          : `The correct answer is Option ${q.correct}: ${correctOpt ?? ""}. Study this topic again and you'll get it next time!`;
      } else {
        feedbackText = "Review this topic carefully — understanding the reasoning behind the answer will help you improve.";
        isCorrect = false;
      }
    }

    const fbObj = {
      text: feedbackText,
      isCorrect,
      correctAnswer: getCorrectAnswerLabel(),
      studentAnswer: getStudentAnswerLabel(),
    };
    setFeedback(fbObj);
    setQuizFeedbacks(prev => [...prev, fbObj]);
    if (isCorrect) setScore(s => s + 1);
    setCorrectness(prev => [...prev, isCorrect]);
    setAnswers(prev => [...prev, ans]);
    setOpenAnswer("");
    setTranscript("");
    setLoading(false);
  };

  // ── Next question ──────────────────────────────────────────────────
  const nextQuestion = () => {
    if (shouldBeListeningRef.current && recognitionRef.current) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      stopDSP();
      setIsListening(false);
    }
    setFeedback(null);
    setMicError(null);
    if (currentQ + 1 >= questions.length) {
      setStep("result");
    } else {
      setCurrentQ(q => q + 1);
    }
  };

  // ── Microphone toggle ──────────────────────────────────────────────
  const toggleMic = async () => {
    if (isListening && recognitionRef.current) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
      stopDSP();
      setIsListening(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Your browser does not support speech recognition. Please use Chrome!", { id: "speech-support" });
      return;
    }

    shouldBeListeningRef.current = true;
    setMicError(null);
    accumulatedRef.current = "";
    spokenTextRef.current  = "";
    setTranscript("");
    setIsListening(true);
    await startDSP();

    const startSession = () => {
      if (!shouldBeListeningRef.current) return;
      try {
        const rec = new SR();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart  = () => setIsListening(true);

        rec.onresult = (event: any) => {
          let seg = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) seg += event.results[i][0].transcript;
          const combined = (accumulatedRef.current + " " + seg).trim();
          spokenTextRef.current = combined;

          if (questions[currentQ]?.type === "open") setOpenAnswer(combined);
          else setTranscript(combined);

          if (questions[currentQ]?.type === "multiple_choice") {
            const n = combined.toLowerCase().trim();
            let letter = "";
            if (/\b(a|option a|choice a)\b/.test(n)) letter = "A";
            else if (/\b(b|option b|choice b)\b/.test(n)) letter = "B";
            else if (/\b(c|option c|choice c)\b/.test(n)) letter = "C";
            else if (/\b(d|option d|choice d)\b/.test(n)) letter = "D";
            if (letter) {
              shouldBeListeningRef.current = false;
              stopDSP();
              setIsListening(false);
              rec.stop();
              submitAnswer(letter);
            }
          }
        };

        rec.onerror = (e: any) => {
          if (e.error === "aborted") return;
          const friendly = getFriendlyMicError(e.error);
          setMicError(friendly);
          if (e.error !== "no-speech") toast.error(friendly.message, { id: "mic-error" });
          shouldBeListeningRef.current = false;
          stopDSP();
          setIsListening(false);
        };

        rec.onend = () => {
          if (shouldBeListeningRef.current) {
            accumulatedRef.current = spokenTextRef.current;
            setTimeout(() => { if (shouldBeListeningRef.current) startSession(); }, 100);
            return;
          }
          setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch {
        setIsListening(false);
      }
    };
    startSession();
  };

  // ── Reset ──────────────────────────────────────────────────────────
  const resetQuiz = () => {
    shouldBeListeningRef.current = false;
    recognitionRef.current?.stop();
    stopDSP();
    setIsListening(false);
    setStep("setup");
    setQuestions([]);
    setAnswers([]);
    setCorrectness([]);
    setFeedback(null);
    setQuizFeedbacks([]);
    setExpandedIndex(null);
    setScore(0);
    setCurrentQ(0);
    setOpenAnswer("");
    setTranscript("");
    setMicError(null);
    setGenerating(false);
    setGeneratedCount(0);
  };

  const q = questions[currentQ];
  const starScore = Math.round((score / numQuestions) * 5);
  const percentage = Math.round((score / numQuestions) * 100);

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "setup") {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-500">
        {/* Hero */}
        <div className="relative rounded-[2rem] overflow-hidden p-10 text-center"
          style={{ background: "linear-gradient(135deg, #0F2447 0%, #1B4080 50%, #4A8FE7 100%)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 border border-white/30 text-white mb-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Vive AI Quiz Engine</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-lg">
              Test Your <span className="text-yellow-300">Knowledge!</span>
            </h1>
            <p className="text-white/85 font-semibold text-lg max-w-xl mx-auto">
              Pick any subject, set your difficulty, and Vive AI will create a professional, personalized quiz just for you.
            </p>
          </div>
        </div>

        {/* Subject grid */}
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">📚 Choose a subject</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SUBJECTS.map((s) => (
              <button
                key={s.label}
                onClick={() => setSubject(s.label)}
                className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 font-black transition-all duration-200 hover:scale-105 active:scale-95 border-2 ${
                  subject === s.label
                    ? "border-transparent text-white scale-105 shadow-lg"
                    : "border-white/10 bg-card/40 text-foreground hover:border-white/30"
                }`}
                style={subject === s.label ? { background: `linear-gradient(135deg, ${s.color.replace("from-","").replace(" to-","_").split("_").map(c=>`var(--color-${c})`).join(",")})` } : {}}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[10px] uppercase tracking-widest text-center leading-tight px-1">{s.label}</span>
              </button>
            ))}
          </div>
          {/* Custom subject */}
          <div className="relative mt-3">
            <Brain className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Or type any topic… (e.g. Machine Learning, Space, Philosophy, Law)"
              className="w-full h-14 rounded-2xl bg-card/60 border border-white/10 pl-14 pr-6 text-base font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 ring-primary/30"
            />
          </div>
        </div>

        {/* Grade */}
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">🎓 Grade / Level</p>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`h-10 px-5 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 ${
                  grade === g
                    ? "border-primary bg-primary text-white"
                    : "border-white/10 bg-card/40 text-foreground hover:border-white/30"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">⚡ Difficulty</p>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.label}
                onClick={() => setDifficulty(d.label)}
                className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 ${
                  difficulty === d.label
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 bg-card/40 text-foreground hover:border-white/30"
                }`}
              >
                <span className="text-2xl">{d.emoji}</span>
                <span className="text-xs font-black">{d.label}</span>
                <span className="text-[9px] text-muted-foreground font-semibold text-center leading-tight px-2">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of questions */}
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
            🎯 Questions: <span className="text-primary">{numQuestions}</span>
          </p>
          <div className="flex gap-3">
            {[3, 5, 10, 15].map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={`h-12 px-6 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 ${
                  numQuestions === n
                    ? "border-primary bg-primary text-white"
                    : "border-white/10 bg-card/40 text-foreground hover:border-white/30"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startQuiz}
          disabled={!subject.trim()}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_40px_rgba(99,102,241,0.45)]"
        >
          <Sparkles className="h-5 w-5" />
          Start {difficulty} Quiz — {subject || "pick a subject above"}
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Mascot */}
        <div className="flex justify-center">
          <div className="h-32 w-32">
            <RiveAnimation src="/riv-animations/17629-33045-strawberry-studying-mascot.riv" className="w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATING SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "quiz" && generating) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
        <div className="h-44 w-44">
          <RiveAnimation src="/riv-animations/27328-51630-loading-books.riv" className="w-full h-full" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black text-foreground/80 uppercase tracking-widest animate-pulse">
            Generating Your Quiz…
          </p>
          <p className="text-sm font-bold text-muted-foreground">
            {generatedCount} of {numQuestions} questions ready
          </p>
          {/* Progress bar */}
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${(generatedCount / numQuestions) * 100}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-widest">
          {subject} · {grade} · {difficulty}
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "quiz" && q) {
    const typeLabel = q.type === "multiple_choice" ? "🔤 Multiple Choice"
      : q.type === "speaking" ? "🎤 Speaking"
      : "✏️ Open Question";

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-400">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Target className="h-4 w-4 text-primary" />
            {subject} · {grade} · {difficulty}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Trophy className="h-3.5 w-3.5" />
            {score} pts
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-black text-muted-foreground">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{Math.round(((currentQ) / questions.length) * 100)}% done</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700"
              style={{ width: `${(currentQ / questions.length) * 100}%` }}
            />
          </div>
          {/* Mini answer history dots */}
          <div className="flex gap-1.5 pt-1">
            {Array.from({ length: questions.length }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < correctness.length
                    ? correctness[i] ? "bg-emerald-500" : "bg-red-500"
                    : i === currentQ ? "bg-primary animate-pulse" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-3xl bg-card/60 border border-white/10 p-8 space-y-6 shadow-xl">
          {/* Type badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
            {typeLabel}
          </span>

          {/* Question text */}
          {q.type !== "speaking" && (
            <p className="text-2xl font-black leading-snug">{q.question}</p>
          )}

          {/* ── MULTIPLE CHOICE ─────────────────────────────────── */}
          {q.type === "multiple_choice" && !feedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options?.map((opt, i) => {
                  const letter = opt.match(/^([A-D])/)?.[1] ?? String.fromCharCode(65 + i);
                  return (
                    <button
                      key={i}
                      onClick={() => submitAnswer(letter)}
                      disabled={loading}
                      className="min-h-[64px] rounded-2xl bg-white/5 border-2 border-white/10 hover:border-primary hover:bg-primary/10 font-bold text-left px-5 py-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-sm leading-snug"
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {/* Speak option */}
              <div className="flex flex-col items-center gap-2 pt-4 border-t border-white/5">
                {micError && (
                  <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-left animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">{micError.message}</p>
                        <p className="text-xs font-semibold text-foreground/95 leading-relaxed">{micError.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground font-bold">🎙️ Or speak your answer: say "A", "B", "C", or "D"</p>
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse scale-105"
                      : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                {transcript && (
                  <p className="text-xs font-semibold italic text-muted-foreground">Heard: "{transcript}"</p>
                )}
              </div>
            </div>
          )}

          {/* ── OPEN QUESTION ────────────────────────────────────── */}
          {q.type === "open" && !feedback && (
            <div className="space-y-3">
              {micError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">{micError.message}</p>
                      <p className="text-xs font-semibold leading-relaxed">{micError.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="relative">
                <textarea
                  value={openAnswer}
                  onChange={(e) => setOpenAnswer(e.target.value)}
                  placeholder="Type or dictate your answer here…"
                  rows={4}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pr-14 text-base font-semibold focus:outline-none focus:ring-2 ring-primary/30 resize-none placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`absolute right-4 bottom-4 p-3 rounded-full transition-all ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
              {isListening && (
                <p className="text-xs font-bold text-red-400 animate-pulse uppercase tracking-widest text-right mr-2">
                  Listening… speak your answer!
                </p>
              )}
              <button
                onClick={() => submitAnswer(openAnswer)}
                disabled={!openAnswer.trim() || loading}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                Submit Answer
              </button>
            </div>
          )}

          {/* ── SPEAKING QUESTION ────────────────────────────────── */}
          {q.type === "speaking" && !feedback && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="w-full space-y-3 text-left">
                <h2 className="text-3xl font-black leading-snug">{q.question}</h2>
                <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                  🎙️ Click the microphone button and speak your answer clearly!
                </p>
              </div>
              {micError && (
                <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-left animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">{micError.message}</p>
                      <p className="text-xs font-semibold leading-relaxed">{micError.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center gap-4 w-full mt-4">
                <button
                  onClick={toggleMic}
                  className={`h-24 w-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                      : "bg-primary/10 border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105"
                  }`}
                >
                  {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </button>
                {isListening && (
                  <p className="text-sm font-bold text-red-400 animate-pulse uppercase tracking-widest">
                    LISTENING... SPEAK NOW!
                  </p>
                )}
                {transcript && (
                  <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">YOU SAID:</p>
                    <p className="text-base font-semibold">{transcript}</p>
                  </div>
                )}
                {transcript && (
                  <button
                    onClick={() => submitAnswer(transcript)}
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-40 shadow-[0_8px_30px_rgba(99,102,241,0.4)]"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Submit This Answer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── FEEDBACK ─────────────────────────────────────────── */}
          {feedback && (
            <div className="space-y-3 animate-in fade-in duration-400">

              {/* Result banner */}
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${
                feedback.isCorrect
                  ? "bg-emerald-500/15 border border-emerald-500/30"
                  : "bg-red-500/15 border border-red-500/30"
              }`}>
                {feedback.isCorrect
                  ? <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  : <XCircle className="h-6 w-6 text-red-400 shrink-0" />
                }
                <p className={`text-sm font-black uppercase tracking-widest ${
                  feedback.isCorrect ? "text-emerald-400" : "text-red-400"
                }`}>
                  {feedback.isCorrect ? "Correct! 🎉" : "Not quite — keep going! 💪"}
                </p>
              </div>

              {/* Answer comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Correct answer — always shown */}
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Correct Answer
                  </p>
                  <p className="text-sm font-bold leading-snug">{feedback.correctAnswer}</p>
                </div>
                {/* Student answer */}
                <div className={`rounded-2xl p-4 border ${
                  feedback.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/25"
                    : "bg-red-500/10 border-red-500/25"
                }`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${
                    feedback.isCorrect ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {feedback.isCorrect
                      ? <><CheckCircle2 className="h-3.5 w-3.5" /> Your Answer</>
                      : <><XCircle className="h-3.5 w-3.5" /> Your Answer</>
                    }
                  </p>
                  <p className="text-sm font-bold leading-snug line-clamp-2">{feedback.studentAnswer}</p>
                </div>
              </div>

              {/* AI explanation */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Explanation
                </p>
                <p className="text-sm font-semibold leading-relaxed text-foreground/90">{feedback.text}</p>
              </div>

              <button
                onClick={nextQuestion}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
              >
                {currentQ + 1 >= questions.length
                  ? <><Trophy className="h-4 w-4" /> See My Results</>
                  : <><ChevronRight className="h-4 w-4" /> Next Question</>
                }
              </button>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center gap-2 py-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  const resultMsg = percentage >= 90 ? { emoji: "🏆", text: "Outstanding! You are a champion!", color: "text-yellow-400" }
    : percentage >= 70 ? { emoji: "🌟", text: "Excellent work! Keep it up!", color: "text-emerald-400" }
    : percentage >= 50 ? { emoji: "💪", text: "Great effort! You're improving!", color: "text-blue-400" }
    : { emoji: "📚", text: "Good try! Every mistake teaches something!", color: "text-violet-400" };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center gap-8 animate-in zoom-in-90 duration-500">
      <div className="h-44 w-44">
        <RiveAnimation src="/riv-animations/22180-41567-level-up-badges-animation.riv" className="w-full h-full" />
      </div>

      <div className="text-center space-y-3 w-full">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Quiz Complete!</p>
        <div className="text-8xl font-black tabular-nums tracking-tighter">
          {score}<span className="text-primary text-5xl">/{questions.length}</span>
        </div>
        <div className="flex justify-center gap-1.5 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-3xl transition-all ${i < starScore ? "opacity-100 scale-110" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
        <p className={`text-2xl font-black ${resultMsg.color}`}>
          {resultMsg.emoji} {resultMsg.text}
        </p>
        <p className="text-sm font-bold text-muted-foreground">
          {subject} · {grade} · {difficulty} difficulty
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {[
          { icon: CheckCircle2, label: "Correct", value: score, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: XCircle, label: "Missed", value: questions.length - score, color: "text-red-400", bg: "bg-red-500/10" },
          { icon: Award, label: "Score", value: `${percentage}%`, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center border border-white/5`}>
            <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Per-question review */}
      <div className="w-full space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Question Review</p>
        {questions.map((qs, i) => {
          const isExpanded = expandedIndex === i;
          const fbItem = quizFeedbacks[i];
          return (
            <div key={i} className="space-y-2">
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:bg-white/5 active:scale-[0.99] cursor-pointer ${
                  correctness[i] ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                  correctness[i] ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-snug text-foreground">{qs.question}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-center">
                  {correctness[i]
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    : <XCircle className="h-4 w-4 text-red-400" />
                  }
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>
              
              {isExpanded && fbItem && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-200 ml-0 sm:ml-9">
                  {/* Answer comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Correct answer */}
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Correct Answer
                      </p>
                      <p className="text-xs font-bold leading-snug">{fbItem.correctAnswer}</p>
                    </div>
                    {/* Student answer */}
                    <div className={`rounded-xl p-3 border ${
                      fbItem.isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    }`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${
                        fbItem.isCorrect ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {fbItem.isCorrect
                          ? <><CheckCircle2 className="h-3 w-3" /> Your Answer</>
                          : <><XCircle className="h-3 w-3" /> Your Answer</>
                        }
                      </p>
                      <p className="text-xs font-bold leading-snug">{fbItem.studentAnswer}</p>
                    </div>
                  </div>

                  {/* AI explanation */}
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Explanation
                    </p>
                    <p className="text-xs font-medium leading-relaxed text-foreground/85">{fbItem.text}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={() => { resetQuiz(); setTimeout(startQuiz, 50); }}
          className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_8px_30px_rgba(99,102,241,0.35)]"
        >
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
        <button
          onClick={resetQuiz}
          className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 font-black text-sm hover:bg-white/10 transition-all"
        >
          New Quiz
        </button>
      </div>
    </div>
  );
}
