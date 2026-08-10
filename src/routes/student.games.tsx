import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, RefreshCw, Sparkles, Brain, Calculator, Type, Layers, X } from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";

export const Route = createFileRoute("/student/games")({
  head: () => ({ meta: [{ title: "Play Zone — Vive AI" }] }),
  component: Games,
});

const ALL_RIVE_FILES = [
  { id: "ui",          title: "Game UI Sandbox",    desc: "Interactive conceptual interface.",             file: "10970-21511-aaa-game-ui.riv",                                               icon: Sparkles, type: "toy" },
  { id: "designer",    title: "Designer Logic",      desc: "Interactive design matrices.",                 file: "11058-21184-designer-in-space.riv",                                         icon: Layers,   type: "toy" },
  { id: "memory",      title: "Memory Match",        desc: "Card matching game to test your memory.",      file: "11229-21493-memory-game.riv",                                               icon: Brain,    type: "game" },
  { id: "cooking",     title: "Cooking Fun",         desc: "Simulated cooking dynamics.",                  file: "1137-2229-cooking-animation.riv",                                           icon: Layers,   type: "toy" },
  { id: "rockstar",    title: "Rhythm Mechanics",    desc: "Musical interaction model.",                   file: "12132-34408-introvert-rock-star.riv",                                       icon: Star,     type: "toy" },
  { id: "math",        title: "Math Ninja",          desc: "Solve math problems quickly.",                 file: "13250-25048-math.riv",                                                      icon: Calculator, type: "game" },
  { id: "pizza",       title: "Pizza Fractions",     desc: "Learn fractions with pizza slices.",           file: "17500-32805-slice-of-pi-unlocking-the-mysteries-of-pizza-geometry.riv",     icon: Calculator, type: "game" },
  { id: "alphabet",    title: "Alphabet Puzzle",     desc: "Match the letters.",                           file: "18336-34406-monster-alphabet-puzzle.riv",                                   icon: Type,     type: "game" },
  { id: "bubbles",     title: "Pop the Bubbles",     desc: "Tap the emoji bubbles before they float away.",file: "21312-40032-tap-the-emoji-bubbles-interactive-game.riv",                    icon: Sparkles, type: "game" },
  { id: "shakespeare", title: "Story Time",          desc: "Interactive reading book.",                    file: "21797-40906-my-first-shakespeare.riv",                                      icon: Type,     type: "toy" },
  { id: "cup",         title: "Guess the Cup",       desc: "Follow the cup with the ball.",                file: "23303-43633-guess-the-cup.riv",                                             icon: Sparkles, type: "game" },
  { id: "solar",       title: "Solar System",        desc: "Explore the planets.",                         file: "24331-45439-solar-system.riv",                                              icon: Star,     type: "toy" },
  { id: "anatomy",     title: "Human Body",          desc: "Learn about the human body.",                  file: "24657-46067-medura-an-interactive-anatomy-experience.riv",                  icon: Brain,    type: "toy" },
  { id: "runner",      title: "Space Runner",        desc: "Infinite procedural runner game.",             file: "26133-49002-studiorun-a-cosmic-game-by-thelittlelabs.riv",                  icon: Sparkles, type: "game" },
  { id: "monster",     title: "Monster Pet",         desc: "Take care of your virtual monster.",           file: "2742-5796-monster-game.riv",                                                icon: Layers,   type: "toy" },
  { id: "potion",      title: "Magic Potions",       desc: "Mix colorful potions.",                        file: "4062-8437-magic-potion-to-grant-a-wish-s.riv",                             icon: Sparkles, type: "toy" },
  { id: "ship",        title: "Ship Captain",        desc: "Steer the ship safely.",                       file: "4894-9900-ship-gamekit-demo.riv",                                           icon: Sparkles, type: "game" },
];

const GAMES = ALL_RIVE_FILES.filter(g => g.type === "game").map(g => ({ ...g, riv: `/riv-animations/${g.file}` }));
const TOYS  = ALL_RIVE_FILES.filter(g => g.type === "toy" ).map(g => ({ ...g, riv: `/riv-animations/${g.file}` }));

const CARD_COLORS = ["#4A90D9","#2ECC71","#FF9500","#9B59B6","#FF6B6B","#1ABC9C","#E74C3C","#3498DB"];

function GameCard({ g, idx, color, onPlay }: { g: typeof GAMES[0]; idx: number; color: string; onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      className="group relative text-left p-0 overflow-hidden rounded-[32px] bg-card/60 border border-white/10 hover:border-white/30 transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-2 animate-in fade-in duration-300"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {/* Thumbnail */}
      <div className="h-36 w-full flex items-center justify-center overflow-hidden relative transition-transform duration-700 group-hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}>
        <RiveAnimation src={g.riv} className="w-full h-full pointer-events-none drop-shadow-2xl" />
      </div>
      {/* Info */}
      <div className="p-5 relative">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm absolute -top-5 right-5 bg-card border border-white/10" style={{ color }}>
          <g.icon className="h-5 w-5" />
        </div>
        <h3 className="font-black text-base mb-1 leading-tight group-hover:text-primary transition-colors mt-2">{g.title}</h3>
        <p className="text-xs font-semibold text-muted-foreground leading-relaxed line-clamp-2">{g.desc}</p>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest" style={{ color }}>
          Play <Sparkles className="h-3 w-3" />
        </div>
      </div>
    </button>
  );
}

function Games() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="space-y-8 max-w-7xl pb-20 relative">

      {/* Hero banner */}
      <div className="relative rounded-[2rem] overflow-hidden p-8 flex items-center gap-6"
        style={{ background: "linear-gradient(135deg, #FF6B6B 0%, #FF9500 50%, #FFD93D 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 w-20 h-20 shrink-0">
          <RiveAnimation src="/riv-animations/21312-40032-tap-the-emoji-bubbles-interactive-game.riv" className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black uppercase tracking-widest backdrop-blur-sm mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Vive Play Zone
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Play &amp; <span className="text-yellow-200">Learn</span></h1>
          <p className="text-white/80 font-semibold text-sm">Fun games and interactive toys to make learning exciting!</p>
        </div>
      </div>

      {!active ? (
        <div className="space-y-10">
          {/* Games */}
          <div>
            <h2 className="text-xl font-black mb-5">🎮 Games</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GAMES.map((g, idx) => (
                <GameCard key={g.id} g={g} idx={idx} color={CARD_COLORS[idx % CARD_COLORS.length]} onPlay={() => setActive(g.id)} />
              ))}
            </div>
          </div>

          {/* Interactive Toys */}
          <div>
            <h2 className="text-xl font-black mb-5">🧸 Interactive Toys</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TOYS.map((g, idx) => (
                <GameCard key={g.id} g={g} idx={idx + GAMES.length} color={CARD_COLORS[(idx + GAMES.length) % CARD_COLORS.length]} onPlay={() => setActive(g.id)} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="absolute top-6 right-6 z-[110]">
            <button
              onClick={() => setActive(null)}
              className="glass bg-white/10 hover:bg-red-500/80 p-3 rounded-full text-white shadow-2xl transition-all flex items-center gap-2 border border-white/20"
            >
              <span className="font-black px-2 uppercase tracking-wider text-xs hidden sm:block">Close Game</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="w-full h-full p-4 md:p-12 relative flex items-center justify-center">
            {ALL_RIVE_FILES.find(g => g.id === active) ? (
              <div className="w-full h-full max-w-7xl max-h-full bg-black/50 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] relative border border-white/5">
                <RiveAnimation
                  src={`/riv-animations/${ALL_RIVE_FILES.find(g => g.id === active)!.file}`}
                  className="w-full h-full"
                  withSound
                  stateMachines="State Machine 1"
                />
              </div>
            ) : (
              <div className="w-full max-w-4xl max-h-full overflow-y-auto rounded-[40px] bg-background/5 p-10 shadow-2xl relative border border-white/10 text-white">
                {active === "math"    && <MathGame />}
                {active === "memory"  && <MemoryGame />}
                {active === "spell"   && <SpellGame />}
                {active === "word"    && <WordGame />}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mini-games ─────────────────────────────────────────────────────────────────

function ScoreBar({ score, stars }: { score: number; stars: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-bold">Score: {score}</span>
      <span className="flex">{Array.from({ length: stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}</span>
    </div>
  );
}

function MathGame() {
  const [a, setA] = useState(0); const [b, setB] = useState(0);
  const [opts, setOpts] = useState<number[]>([]);
  const [score, setScore] = useState(0); const [msg, setMsg] = useState("");
  const next = () => {
    const x = Math.floor(Math.random()*12)+1; const y = Math.floor(Math.random()*12)+1;
    setA(x); setB(y);
    const ans = x*y;
    const arr = [ans, ans+Math.floor(Math.random()*5)+1, Math.max(1, ans-Math.floor(Math.random()*5)-1), ans+Math.floor(Math.random()*8)+2].sort(() => Math.random()-0.5);
    setOpts(arr); setMsg("");
  };
  useEffect(next, []);
  const pick = (n: number) => {
    if (n === a*b) { setScore(s => s+10); setMsg("Masterful!"); setTimeout(next, 700); }
    else { setMsg("Recalculating..."); }
  };
  return (
    <div className="mt-8 rounded-3xl glass p-12 text-center bg-card/50 border-none shadow-glow">
      <ScoreBar score={score} stars={Math.min(3, Math.floor(score/30))} />
      <div className="text-8xl font-black my-12 tracking-tighter text-primary">{a} × {b}</div>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {opts.map((o, i) => <button key={i} onClick={() => pick(o)} className="rounded-2xl glass py-6 text-3xl font-black hover:bg-primary hover:text-primary-foreground transition-all duration-300">{o}</button>)}
      </div>
      <div className="mt-8 text-2xl font-bold italic text-muted-foreground">{msg}</div>
    </div>
  );
}

function MemoryGame() {
  const ICONS = [Brain, Calculator, Type, Layers, Star, Sparkles];
  const [cards, setCards] = useState<{icon:any;f:boolean;m:boolean}[]>([]);
  const [first, setFirst] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const reset = () => {
    const deck = [...ICONS, ...ICONS].sort(() => Math.random()-0.5).map(icon => ({icon, f:false, m:false}));
    setCards(deck); setFirst(null); setMoves(0);
  };
  useEffect(reset, []);
  const flip = (i: number) => {
    if (cards[i].f || cards[i].m) return;
    const next = cards.map((c, idx) => idx === i ? {...c, f:true} : c);
    setCards(next);
    if (first === null) setFirst(i);
    else {
      setMoves(m => m+1);
      if (next[first].icon === next[i].icon) {
        setTimeout(() => { setCards(c => c.map((cc, idx) => (idx===i||idx===first)?{...cc,m:true}:cc)); setFirst(null); }, 500);
      } else {
        setTimeout(() => { setCards(c => c.map((cc, idx) => (idx===i||idx===first)?{...cc,f:false}:cc)); setFirst(null); }, 800);
      }
    }
  };
  const won = cards.length > 0 && cards.every(c => c.m);
  return (
    <div className="mt-8 rounded-3xl glass p-10 bg-card/50 border-none shadow-glow">
      <div className="flex justify-between items-center mb-10">
        <span className="text-xl font-bold">Analysis Cycles: <strong className="text-primary">{moves}</strong></span>
        <Button size="lg" variant="outline" onClick={reset} className="glass font-bold px-6"><RefreshCw className="h-5 w-5 mr-3" />Synchronize</Button>
      </div>
      <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
        {cards.map((c, i) => (
          <button key={i} onClick={() => flip(i)} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 shadow-soft ${c.f||c.m ? "bg-primary text-primary-foreground scale-105" : "glass hover:bg-muted/50"} ${c.m ? "opacity-40" : ""}`}>
            {(c.f||c.m) ? <c.icon className="h-10 w-10" /> : <div className="text-2xl font-black text-muted-foreground/30">?</div>}
          </button>
        ))}
      </div>
      {won && <div className="text-center mt-10 text-primary text-2xl font-black flex items-center justify-center gap-2 animate-bounce"><Sparkles className="h-6 w-6" /> Cognitive Pattern Matched!</div>}
    </div>
  );
}

function SpellGame() {
  const WORDS = ["efficiency","mastery","analytical","synergy","concept","innovation"];
  const [w, setW] = useState(WORDS[0]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0); const [msg, setMsg] = useState("");
  const speak = (t: string) => { if (typeof window === "undefined") return; const u = new SpeechSynthesisUtterance(t); u.rate = 0.8; u.pitch = 1.1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); };
  const next = () => { const n = WORDS[Math.floor(Math.random()*WORDS.length)]; setW(n); setInput(""); setMsg(""); speak(n); };
  const check = () => { if (input.trim().toLowerCase() === w) { setScore(s=>s+10); setMsg("Verified."); setTimeout(next, 800); } else setMsg(`Inefficient — targeting: "${w}"`); };
  return (
    <div className="mt-8 rounded-3xl glass p-12 text-center bg-card/50 border-none shadow-glow">
      <ScoreBar score={score} stars={Math.min(3, Math.floor(score/30))} />
      <p className="my-6 text-xl font-medium text-muted-foreground italic">Phonological recognition enabled. Audit the signal and transcribe.</p>
      <Button size="lg" onClick={() => speak(w)} className="mb-10 h-16 px-10 rounded-2xl text-lg font-black shadow-glow">🔊 Audio Reference</Button>
      <input value={input} onChange={(e) => setInput(e.target.value)} className="block mx-auto rounded-3xl glass bg-background focus:ring-4 ring-primary/20 px-10 py-6 text-4xl font-black text-center max-w-md uppercase tracking-tighter" placeholder="TRANSCRIPTION..." />
      <div className="mt-10 flex gap-4 justify-center">
        <Button size="lg" onClick={check} className="h-14 px-10 font-black rounded-xl">Validate</Button>
        <Button size="lg" variant="outline" onClick={next} className="h-14 px-10 font-black rounded-xl glass">Bypass</Button>
      </div>
      <div className="mt-8 text-xl font-bold">{msg}</div>
    </div>
  );
}

function WordGame() {
  const PAIRS = [["happy","joyful"],["fast","quick"],["big","large"],["smart","clever"],["start","begin"]];
  const [pair, setPair] = useState(PAIRS[0]);
  const [opts, setOpts] = useState<string[]>([]);
  const [score, setScore] = useState(0); const [msg, setMsg] = useState("");
  const next = () => {
    const p = PAIRS[Math.floor(Math.random()*PAIRS.length)];
    setPair(p);
    const wrong = PAIRS.filter(x => x !== p).map(x => x[1]).sort(() => Math.random()-0.5).slice(0,3);
    setOpts([p[1], ...wrong].sort(() => Math.random()-0.5)); setMsg("");
  };
  useEffect(next, []);
  const pick = (o: string) => { if (o === pair[1]) { setScore(s=>s+10); setMsg("✅"); setTimeout(next, 600); } else setMsg("❌"); };
  return (
    <div className="mt-4 rounded-2xl border bg-card p-8 text-center">
      <ScoreBar score={score} stars={Math.min(3, Math.floor(score/30))} />
      <p className="my-3 text-muted-foreground">Pick the word that means the same as:</p>
      <div className="text-5xl font-bold mb-6 text-primary">{pair[0]}</div>
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {opts.map((o, i) => <button key={i} onClick={() => pick(o)} className="rounded-2xl border bg-card py-4 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">{o}</button>)}
      </div>
      <div className="mt-3 text-xl">{msg}</div>
    </div>
  );
}
