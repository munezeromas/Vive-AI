import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { Logo } from "@/components/vive/Logo";
import { useRef, useState } from "react";
import {
  GraduationCap, Presentation, Eye, EyeOff, Github,
  ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Vive AI" }] }),
  component: Login,
});

type Screen = "login" | "register" | "forgot" | "forgot-success";

const DEMO_STUDENT = { schoolNum: "1234", studentNum: "5678", password: "demo123" };
const DEMO_TEACHER = { schoolNum: "9876", studentNum: "5432", password: "demo123" };

/* ─── Background ─── */
function Bg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* gradient base */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#1a4a7a 40%,#0d2d4f 100%)" }} />
      {/* glow orbs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,rgba(74,144,217,0.35) 0%,transparent 70%)" }} />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle,rgba(91,160,227,0.2) 0%,transparent 70%)" }} />
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* decorative rings */}
      <div className="absolute top-16 left-10 w-20 h-20 rounded-full border-4 border-sky-400/40" />
      <div className="absolute top-28 left-24 w-8 h-8 rounded-full border-2 border-sky-300/30" />
      <div className="absolute bottom-24 right-14 w-28 h-28 rounded-full border-4 border-blue-400/30" />
      <div className="absolute bottom-12 right-36 w-5 h-5 rounded-full bg-sky-400/40" />
      {/* wave shapes */}
      <svg className="absolute bottom-0 left-0 right-0 w-full opacity-10" viewBox="0 0 1440 120" fill="none">
        <path d="M0,80 C240,20 480,120 720,60 C960,0 1200,100 1440,50 L1440,120 L0,120 Z" fill="white" />
      </svg>
    </div>
  );
}

/* ─── Error Banner ─── */
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-sm mb-5 animate-in slide-in-from-top duration-300">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
      <span className="font-medium leading-snug">{msg}</span>
    </div>
  );
}

/* ─── Input Field ─── */
function Field({
  id, label, type = "text", placeholder, value, onChange, right, hint,
}: {
  id: string; label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; right?: React.ReactNode; hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-white/70 uppercase tracking-widest" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id} type={type} placeholder={placeholder}
          className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/60 font-medium transition-all backdrop-blur-sm"
          style={{ paddingRight: right ? "3rem" : undefined }}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={type === "password" ? "current-password" : undefined}
        />
        {right && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {hint}
    </div>
  );
}

/* ─── Vive ID Field ─── */
function ViveIdField({ schoolNum, studentNum, onSchoolChange, onStudentChange, studentRef }: {
  schoolNum: string; studentNum: string;
  onSchoolChange: (v: string) => void; onStudentChange: (v: string) => void;
  studentRef: React.RefObject<HTMLInputElement | null>;
}) {
  const isValid = schoolNum.length >= 1 && studentNum.length >= 1;
  const hasAny = schoolNum || studentNum;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Vive ID</label>
      <div className="flex items-center bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-sky-400/60 focus-within:border-sky-400/60 rounded-xl overflow-hidden transition-all backdrop-blur-sm">
        <span className="bg-sky-500 text-white text-[11px] font-black tracking-widest px-3 py-[0.95rem] select-none whitespace-nowrap shrink-0">
          VIVE
        </span>
        <span className="text-white/30 px-1.5 font-black text-base select-none shrink-0">—</span>
        <input
          type="text" inputMode="numeric" placeholder="0042" maxLength={6}
          value={schoolNum}
          onChange={e => onSchoolChange(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => (e.key === "-" || e.key === "Enter") && studentRef.current?.focus()}
          className="w-16 py-3.5 text-center text-white font-bold text-sm outline-none border-r border-white/20 bg-transparent placeholder-white/30"
        />
        <span className="text-white/30 px-1.5 font-black text-base select-none shrink-0">—</span>
        <input
          ref={studentRef} type="text" inputMode="numeric" placeholder="00291" maxLength={8}
          value={studentNum}
          onChange={e => onStudentChange(e.target.value.replace(/\D/g, ""))}
          className="flex-1 py-3.5 px-2 text-white font-bold text-sm outline-none bg-transparent placeholder-white/30"
        />
      </div>
      {hasAny && (
        <p className={`text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors ${isValid ? "text-green-400" : "text-white/35"}`}>
          {isValid && <CheckCircle className="w-3 h-3" />}
          VIVE-{schoolNum || "____"}-{studentNum || "____"}
        </p>
      )}
    </div>
  );
}

/* ─── Role Tab ─── */
function RoleTabs({ role, setRole }: { role: "student" | "teacher"; setRole: (r: "student" | "teacher") => void }) {
  return (
    <div className="flex bg-white/8 rounded-2xl p-1 mb-4 border border-white/10 gap-1">
      {(["student", "teacher"] as const).map(r => (
        <button
          key={r} type="button" onClick={() => setRole(r)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
            ${role === r
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
              : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
        >
          {r === "student" ? <GraduationCap className="w-3.5 h-3.5" /> : <Presentation className="w-3.5 h-3.5" />}
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  );
}

/* ─── Social Buttons ─── */
function SocialButtons({ onError }: { onError: (m: string) => void }) {
  const handleSocial = async (provider: "google" | "github") => {
    const { error } = await authClient.signIn.social({ provider, callbackURL: "/student" });
    if (error) onError(error.message || "Social login failed. Please try again.");
  };
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={() => handleSocial("google")}
          className="flex-1 py-3 bg-white rounded-xl flex items-center justify-center gap-2.5 hover:bg-gray-50 hover:shadow-lg transition-all font-semibold text-sm text-gray-700 active:scale-[0.98]">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
        <button type="button" onClick={() => handleSocial("github")}
          className="flex-1 py-3 bg-white rounded-xl flex items-center justify-center gap-2.5 hover:bg-gray-50 hover:shadow-lg transition-all font-semibold text-sm text-gray-700 active:scale-[0.98]">
          <Github className="w-4 h-4 text-gray-900" />
          GitHub
        </button>
      </div>
    </div>
  );
}

/* ─── Password strength indicator ─── */
function PwStrength({ pw }: { pw: string }) {
  if (!pw) return null;
  const strength = pw.length >= 12 ? 3 : pw.length >= 8 ? 2 : 1;
  const labels = ["", "Weak", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-green-400"];
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-white/15"}`} />
        ))}
      </div>
      <span className={`text-[10px] font-bold ${strength === 3 ? "text-green-400" : strength === 2 ? "text-yellow-400" : "text-red-400"}`}>
        {labels[strength]}
      </span>
    </div>
  );
}

/* ═══════════════════════ MAIN LOGIN COMPONENT ═══════════════════════ */
function Login() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [schoolNum, setSchoolNum] = useState("");
  const [studentNum, setStudentNum] = useState("");
  const studentRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regViveCode, setRegViveCode] = useState("");
  const [regSchoolNum, setRegSchoolNum] = useState("");
  const [regStudentNum, setRegStudentNum] = useState("");
  const regStudentRef = useRef<HTMLInputElement>(null);
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConf, setShowRegConf] = useState(false);

  // Forgot fields
  const [forgotSchoolNum, setForgotSchoolNum] = useState("");
  const [forgotStudentNum, setForgotStudentNum] = useState("");
  const forgotStudentRef = useRef<HTMLInputElement>(null);

  const goTo = (s: Screen) => { setAuthError(""); setScreen(s); };

  const pwMatch = regConfirm.length > 0 && regConfirm === regPassword;
  const pwNoMatch = regConfirm.length > 0 && regConfirm !== regPassword;
  const regValid = !!regName && !!regViveCode && !!regSchoolNum && !!regStudentNum && regPassword.length >= 8 && pwMatch;

  /* ── Handlers ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    // Demo bypass
    if (schoolNum === DEMO_STUDENT.schoolNum && studentNum === DEMO_STUDENT.studentNum && password === DEMO_STUDENT.password) {
      navigate({ to: "/student" }); return;
    }
    if (schoolNum === DEMO_TEACHER.schoolNum && studentNum === DEMO_TEACHER.studentNum && password === DEMO_TEACHER.password) {
      navigate({ to: "/teacher" }); return;
    }

    const email = `${schoolNum}-${studentNum}@vive.edu`;
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) { setAuthError(error.message || "Invalid credentials. Check your Vive ID and password."); return; }
    navigate({ to: role === "student" ? "/student" : "/teacher" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    const email = `${regSchoolNum}-${regStudentNum}@vive.edu`;
    const { error } = await authClient.signUp.email({ email, password: regPassword, name: regName });
    setLoading(false);
    if (error) { setAuthError(error.message || "Registration failed. Please try again."); return; }
    navigate({ to: role === "student" ? "/student" : "/teacher" });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setScreen("forgot-success");
  };

  const fillDemo = (type: "student" | "teacher") => {
    const d = type === "student" ? DEMO_STUDENT : DEMO_TEACHER;
    setSchoolNum(d.schoolNum);
    setStudentNum(d.studentNum);
    setPassword(d.password);
    setRole(type);
    setAuthError("");
  };

  /* ── Eye toggle button ── */
  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="text-white/40 hover:text-white/70 transition-colors" tabIndex={-1}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Bg />

      <div className="w-full max-w-[420px] relative z-10 px-4 py-2">

        {/* ══════════ LOGIN ══════════ */}
        {screen === "login" && (
          <div className="bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* header strip */}
            <div className="px-8 pt-5 pb-4 border-b border-white/10">
              <div className="flex justify-center mb-3">
                <Link to="/" className="hover:scale-105 transition-transform block">
                  <Logo size={36} lightBg={false} />
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-white text-center tracking-tight">Welcome back 👋</h1>
              <p className="text-white/45 text-sm text-center mt-1">Sign in to continue your learning journey</p>
            </div>

            <div className="px-8 py-4">
              {authError && <ErrorBanner msg={authError} />}
              <RoleTabs role={role} setRole={setRole} />

              <form className="flex flex-col gap-3" onSubmit={handleLogin}>
                <ViveIdField schoolNum={schoolNum} studentNum={studentNum}
                  onSchoolChange={setSchoolNum} onStudentChange={setStudentNum} studentRef={studentRef} />

                <Field id="login-pw" label="Password" type={showPw ? "text" : "password"}
                  placeholder="Enter your password" value={password} onChange={setPassword}
                  right={<EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />} />

                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => goTo("forgot")}
                    className="text-[11px] text-sky-300/80 hover:text-sky-300 font-semibold transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={loading || !schoolNum || !studentNum || !password}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 active:scale-[0.98] mt-1">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In →"}
                </button>

                {/* Demo buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => fillDemo("student")}
                    className="py-2.5 bg-white/6 border border-white/15 hover:bg-white/12 rounded-xl text-[11px] text-white/60 hover:text-white font-semibold transition-all flex items-center justify-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Demo Student
                  </button>
                  <button type="button" onClick={() => fillDemo("teacher")}
                    className="py-2.5 bg-white/6 border border-white/15 hover:bg-white/12 rounded-xl text-[11px] text-white/60 hover:text-white font-semibold transition-all flex items-center justify-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5" /> Demo Teacher
                  </button>
                </div>
              </form>

              <SocialButtons onError={setAuthError} />

              <p className="text-center text-[12px] text-white/40 mt-4">
                Don't have an account?{" "}
                <button onClick={() => goTo("register")} className="text-sky-300 font-bold hover:text-white transition-colors">
                  Register for free
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ══════════ REGISTER ══════════ */}
        {screen === "register" && (
          <div className="bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* header strip */}
            <div className="px-8 pt-8 pb-5 border-b border-white/10">
              <button onClick={() => goTo("login")}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
              <div className="flex justify-center mb-4">
                <Logo size={32} lightBg={false} />
              </div>
              <h1 className="text-2xl font-bold text-white text-center tracking-tight">Create Account ✨</h1>
              <p className="text-white/45 text-sm text-center mt-1">Start your learning journey today</p>
            </div>

            <div className="px-8 py-6">
              {authError && <ErrorBanner msg={authError} />}
              <RoleTabs role={role} setRole={setRole} />

              <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                <Field id="reg-name" label="Full Name" placeholder="e.g. Amara Diallo"
                  value={regName} onChange={setRegName} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Vive Access Code</label>
                  <div className="relative">
                    <input id="reg-code" type="text" placeholder="Enter your 8-digit access code"
                      className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/60 font-medium transition-all"
                      value={regViveCode} onChange={e => setRegViveCode(e.target.value)} />
                  </div>
                  <p className="text-[10px] text-white/35 font-medium">
                    📌 Get your code from your school, or purchase at{" "}
                    <span className="text-sky-400">viveai.rw</span>
                  </p>
                </div>

                <ViveIdField schoolNum={regSchoolNum} studentNum={regStudentNum}
                  onSchoolChange={setRegSchoolNum} onStudentChange={setRegStudentNum} studentRef={regStudentRef} />

                <Field id="reg-pw" label="Password" type={showRegPw ? "text" : "password"}
                  placeholder="Create a strong password (min. 8 chars)" value={regPassword} onChange={setRegPassword}
                  right={<EyeBtn show={showRegPw} toggle={() => setShowRegPw(v => !v)} />}
                  hint={<PwStrength pw={regPassword} />} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-widest" htmlFor="reg-conf">Confirm Password</label>
                  <div className="relative">
                    <input id="reg-conf" type={showRegConf ? "text" : "password"} placeholder="Repeat your password"
                      className={`w-full px-4 py-3.5 bg-white/10 border text-white placeholder-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 font-medium transition-all pr-12
                        ${pwNoMatch ? "border-red-400/60 focus:ring-red-400/40" : pwMatch ? "border-green-400/60 focus:ring-green-400/40" : "border-white/20 focus:ring-sky-400/60"}`}
                      value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {pwMatch && <CheckCircle className="w-4 h-4 text-green-400" />}
                      <EyeBtn show={showRegConf} toggle={() => setShowRegConf(v => !v)} />
                    </div>
                  </div>
                  {pwNoMatch && <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Passwords don't match</p>}
                  {pwMatch && <p className="text-[11px] text-green-400 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>}
                </div>

                <button type="submit" disabled={loading || !regValid}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 active:scale-[0.98] mt-1">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create Account →"}
                </button>
              </form>

              <SocialButtons onError={setAuthError} />

              <p className="text-center text-[12px] text-white/40 mt-6">
                Already have an account?{" "}
                <button onClick={() => goTo("login")} className="text-sky-300 font-bold hover:text-white transition-colors">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ══════════ FORGOT PASSWORD ══════════ */}
        {screen === "forgot" && (
          <div className="bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-8 pt-8 pb-5 border-b border-white/10">
              <button onClick={() => goTo("login")}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
              <div className="w-14 h-14 rounded-2xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-sky-300" />
              </div>
              <h1 className="text-2xl font-bold text-white text-center">Forgot Password?</h1>
              <p className="text-white/45 text-sm text-center mt-2 leading-relaxed">
                Enter your Vive ID and we'll send a reset link to your registered contact.
              </p>
            </div>
            <div className="px-8 py-6">
              {authError && <ErrorBanner msg={authError} />}
              <form className="flex flex-col gap-5" onSubmit={handleForgot}>
                <ViveIdField schoolNum={forgotSchoolNum} studentNum={forgotStudentNum}
                  onSchoolChange={setForgotSchoolNum} onStudentChange={setForgotStudentNum} studentRef={forgotStudentRef} />
                <button type="submit" disabled={!forgotSchoolNum || !forgotStudentNum}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-500/30 active:scale-[0.98]">
                  Send Reset Link
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════ FORGOT SUCCESS ══════════ */}
        {screen === "forgot-success" && (
          <div className="bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.5)] px-8 py-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400/40 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Link Sent! 🎉</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-[280px]">
              We sent a password reset link to the contact associated with{" "}
              <span className="text-white font-semibold font-mono">
                VIVE-{forgotSchoolNum || "____"}-{forgotStudentNum || "____"}
              </span>.
              Check your inbox.
            </p>
            <button onClick={() => { goTo("login"); setForgotSchoolNum(""); setForgotStudentNum(""); }}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-500/30 active:scale-[0.98]">
              Back to Login
            </button>
            <p className="text-[11px] text-white/30 mt-5">
              Didn't receive it?{" "}
              <button onClick={() => goTo("forgot")} className="text-sky-400 hover:text-sky-300 font-semibold">Try again</button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
