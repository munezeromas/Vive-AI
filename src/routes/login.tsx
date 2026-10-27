import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { useRef, useState } from "react";
import {
  GraduationCap,
  Presentation,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { RiveAnimation } from "@/components/vive/RiveAnimation";
import { Logo } from "@/components/vive/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Vive AI" }] }),
  component: Login,
});

type Screen = "login" | "register" | "register-verify" | "forgot" | "forgot-success";

/* ─── Vive ID Parsing Helper ─── */
const parseIdentifier = (input: string) => {
  const clean = input.trim();
  const viveMatch = clean.match(/^(?:vive-)?([\d]+)-([\d]+)$/i);
  if (viveMatch) {
    return {
      schoolNum: viveMatch[1],
      studentNum: viveMatch[2],
      email: `${viveMatch[1]}-${viveMatch[2]}@vive.edu`,
    };
  }
  return { schoolNum: "", studentNum: "", email: clean };
};

/* ─── Error Banner ─── */
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-3 animate-in slide-in-from-top duration-300">
      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500" />
      <span className="font-semibold leading-snug">{msg}</span>
    </div>
  );
}

/* ─── Success Banner ─── */
function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs mb-3 animate-in slide-in-from-top duration-300">
      <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
      <span className="font-semibold leading-snug">{msg}</span>
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
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id} type={type} placeholder={placeholder}
          className="w-full px-3.5 py-2.5 bg-[#f3f6f9] border border-transparent text-gray-900 placeholder-gray-400 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 font-medium transition-all"
          style={{ paddingRight: right ? "2.5rem" : undefined }}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={type === "password" ? "current-password" : undefined}
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {hint}
    </div>
  );
}


/* ─── Role Tabs ─── */
function RoleTabs({ role, setRole }: { role: "student" | "teacher" | "parent"; setRole: (r: "student" | "teacher" | "parent") => void }) {
  return (
    <div className="flex bg-[#f3f6f9] rounded-xl p-0.5 mb-3 border border-gray-100 gap-0.5">
      {(["student", "teacher", "parent"] as const).map(r => (
        <button
          key={r} type="button" onClick={() => setRole(r)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all duration-200
            ${role === r
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}
        >
          {r === "student" ? (
            <GraduationCap className="w-3.5 h-3.5" />
          ) : r === "teacher" ? (
            <Presentation className="w-3.5 h-3.5" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  );
}

/* ─── Form Header Logo ─── */
function FormHeaderLogo() {
  return (
    <div className="flex justify-center mb-3.5 select-none animate-pop-in">
      <Link to="/" className="hover:scale-105 transition-transform block">
        <Logo size={16} />
      </Link>
    </div>
  );
}

/* ─── Social Buttons ─── */
function SocialButtons({ onError }: { onError: (m: string) => void }) {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSocial = async (provider: "google") => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
      // callbackURL "/" will hit the landing page → RequireAuth on /student or /teacher
      // will handle the final redirect based on the user's role
    } catch (err) {
      console.error(`${provider} sign-in exception:`, err);
      onError(`Google sign-in failed. Please check your connection and try again.`);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mt-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button
        type="button"
        onClick={() => handleSocial("google")}
        disabled={googleLoading}
        className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-xs text-gray-700 active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>
    </div>
  );
}

/* ─── Password Strength ─── */
function getPwStrength(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

function PwStrength({ pw }: { pw: string }) {
  if (!pw) return null;
  const strength = getPwStrength(pw);
  const labels = ["", "Weak", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-gray-200"}`} />
        ))}
      </div>
      <span className={`text-[9px] font-bold ${strength === 3 ? "text-green-600" : strength === 2 ? "text-yellow-600" : "text-red-600"}`}>
        {labels[strength] || "Very Weak"}
      </span>
    </div>
  );
}

/* ─── OTP Input (6 boxes) ─── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const arr = value.padEnd(6, " ").split("");
    arr[index] = digit || " ";
    const next = arr.join("").trimEnd();
    onChange(next);
    if (digit && index < 5) refs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const arr = value.padEnd(6, " ").split("");
      arr[index] = " ";
      const next = arr.join("").trimEnd();
      onChange(next);
      if (index > 0) refs[index - 1].current?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const lastIdx = Math.min(pasted.length, 5);
    refs[lastIdx].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] && value[i] !== " " ? value[i] : ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          className={`w-10 h-12 text-center text-lg font-black rounded-xl border-2 bg-[#f3f6f9] text-gray-900 outline-none transition-all duration-150
            ${value[i] && value[i] !== " "
              ? "border-black bg-white shadow-sm"
              : "border-transparent focus:border-gray-300 focus:bg-white"
            }`}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════ MAIN LOGIN COMPONENT ═══════════════════════ */
function Login() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<"student" | "teacher" | "parent">("student");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regGrade, setRegGrade] = useState("P3");
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConf, setShowRegConf] = useState(false);

  // OTP verification
  const [otpValue, setOtpValue] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const goTo = (s: Screen) => { setAuthError(""); setAuthSuccess(""); setScreen(s); };

  const pwMatch = regConfirm.length > 0 && regConfirm === regPassword;
  const pwNoMatch = regConfirm.length > 0 && regConfirm !== regPassword;
  const isStrongPw = getPwStrength(regPassword) === 3;

  const regValid = !!regName && !!regEmail && regEmail.includes("@") && isStrongPw && pwMatch;

  /* ── Helpers ── */
  const startResendCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── Login Handler ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const { email } = parseIdentifier(identifier);
    const loginEmail = email;

    try {
      const { data, error } = await authClient.signIn.email({ email: loginEmail, password });
      setLoading(false);

      if (error) {
        // Detect email-not-verified — guide user to re-verify
        const code = (error as any)?.code as string | undefined;
        const msg = error.message?.toLowerCase() ?? "";
        if (
          code === "EMAIL_NOT_VERIFIED" ||
          msg.includes("not verified") ||
          msg.includes("verify your email")
        ) {
          // Store email so the OTP screen can use it
          setRegEmail(loginEmail);
          setAuthError("");
          setAuthSuccess("Your email isn't verified yet. We've sent a new code — please check your inbox.");
          // Send a fresh OTP
          await authClient.emailOtp.sendVerificationOtp({
            email: loginEmail,
            type: "email-verification",
          });
          startResendCooldown();
          setOtpValue("");
          setScreen("register-verify");
          return;
        }
        setAuthError(error.message || "Invalid credentials. Please check your Email/ID and password.");
        return;
      }

      // Redirect based on the actual role from the session
      const userRole = (data as any)?.user?.role as string | undefined;
      if (userRole === "teacher" || userRole === "admin") {
        navigate({ to: "/teacher" });
      } else if (userRole === "parent") {
        navigate({ to: "/parent" });
      } else {
        navigate({ to: "/student" });
      }
    } catch {
      setLoading(false);
      setAuthError("Something went wrong. Please try again.");
    }
  };

  /* ── Step 1: Create Account & Auto-Send OTP ── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const { error: signUpError } = await (authClient.signUp as any).email({
        email: regEmail,
        password: regPassword,
        name: regName,
        data: {
          role: role,
          grade: role === "student" ? regGrade : undefined,
        },
      });

      if (signUpError) {
        setAuthError(signUpError.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setOtpValue("");
      startResendCooldown();
      setScreen("register-verify");
    } catch {
      setAuthError("Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.replace(/ /g, "").length < 6) {
      setAuthError("Please enter the complete 6-digit code.");
      return;
    }
    setAuthError("");
    setLoading(true);

    try {
      const { error: otpError } = await authClient.emailOtp.verifyEmail({
        email: regEmail,
        otp: otpValue.replace(/ /g, ""),
      });

      if (otpError) {
        setAuthError(otpError.message || "Invalid or expired code. Please try again.");
        setLoading(false);
        return;
      }

      // Role and grade were already saved during sign-up via Better Auth additionalFields.
      // No separate profile update needed — just navigate to the right dashboard.
      setLoading(false);
      navigate({ to: role === "student" ? "/student" : role === "teacher" ? "/teacher" : "/parent" });
    } catch {
      setAuthError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setAuthError("");
    setLoading(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: regEmail,
        type: "email-verification",
      });
      setLoading(false);
      if (error) {
        setAuthError(error.message || "Failed to resend code.");
        return;
      }
      setAuthSuccess("A new code has been sent to your email.");
      setOtpValue("");
      startResendCooldown();
    } catch {
      setAuthError("Failed to resend code.");
      setLoading(false);
    }
  };

  /* ── Forgot Password — calls real Better Auth API ── */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setAuthError("");
    setForgotLoading(true);
    try {
      const { error } = await (authClient as any).forgetPassword?.({
        email: forgotEmail,
        redirectTo: `${window.location.origin}/login`,
      }) || {};
      setForgotLoading(false);
      if (error) {
        setAuthError(error.message || "Failed to send reset link. Please try again.");
        return;
      }
      goTo("forgot-success");
    } catch {
      setForgotLoading(false);
      setAuthError("Failed to send reset link. Please try again.");
    }
  };

  /* ── Eye toggle button ── */
  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center relative p-4 md:p-6 bg-cover bg-center select-none"
      style={{
        backgroundImage: "url('/images/sky_background.png')",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ─── Back Button ─── */}
      <Link
        to="/"
        className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-all z-20 active:scale-[0.95]"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      {/* ─── Main Auth Card ─── */}
      <div className="w-full max-w-[820px] bg-white rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row relative border border-white/20 select-text animate-pop-in">

        {/* ═══════════ LEFT VISUAL PANEL (desktop only) ═══════════ */}
        <div className="hidden md:flex md:w-[48%] relative overflow-hidden shrink-0 select-none">
          <div className="w-full h-full bg-gradient-to-br from-[#e8f0fe] via-[#f3f6f9] to-[#eaf4ff] flex flex-col justify-between min-h-[520px] relative overflow-hidden">

            {/* Subtle radial glow behind the avatar */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(74,144,217,0.18) 0%, transparent 75%)",
              }}
            />

            {/* Live Animation from Rive — larger, centered, takes up most of the panel */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "60px" }}>
              <div className="w-full" style={{ height: "78%" }}>
                <RiveAnimation
                  src="/riv-animations/5573-10970-login2.riv"
                  className="w-full h-full"
                  stateMachines="State Machine 1"
                  fit="contain"
                  alignment="center"
                />
              </div>
            </div>

            {/* Bottom text overlay */}
            <div className="relative z-10 mt-auto p-6 pt-0">
              {/* Gradient overlay for text contrast */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />
              <h2 className="relative z-10 text-slate-800 text-2xl font-black tracking-tight leading-[1.15] select-none uppercase">
                Explore.<br />Learn.<br />Grow.
              </h2>
              <p className="relative z-10 text-slate-500 text-[11px] font-semibold mt-1 select-none">
                Your AI-powered learning companion
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════ RIGHT FORM PANEL ═══════════ */}
        <div className="w-full md:w-[52%] flex flex-col justify-center p-6 md:p-8">

          {/* ══════════ LOGIN SCREEN ══════════ */}
          {screen === "login" && (
            <div className="w-full">
              <FormHeaderLogo />

              <h1 className="text-lg font-black text-gray-900 text-center tracking-tight uppercase">Welcome back</h1>
              <p className="text-gray-500 text-xs text-center mt-1 mb-5">Enter your credentials to access your account</p>

              {authError && <ErrorBanner msg={authError} />}
              <RoleTabs role={role} setRole={setRole} />

              <form className="flex flex-col gap-2.5" onSubmit={handleLogin}>
                <Field
                  id="login-id"
                  label="Email or Vive ID"
                  placeholder={role === "parent" ? "Enter your email" : "e.g. VIVE-0042-00291 or email"}
                  value={identifier}
                  onChange={setIdentifier}
                />

                <Field
                  id="login-pw"
                  label="Password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  right={<EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />}
                />

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between -mt-1.5 mb-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => goTo("forgot")}
                    className="text-[10px] text-gray-500 hover:text-black font-semibold transition-colors"
                  >
                    Forgot Password
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier || !password}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in...</> : "Sign In"}
                </button>
              </form>

              <SocialButtons onError={setAuthError} />

              <p className="text-center text-[11px] text-gray-500 mt-5">
                Don't have an account?{" "}
                <button onClick={() => goTo("register")} className="text-black font-bold hover:underline transition-all">
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* ══════════ REGISTER SCREEN (Step 1) ══════════ */}
          {screen === "register" && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => goTo("login")}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-black text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Step 1 of 2</span>
              </div>

              <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">Create Account</h1>
              <p className="text-gray-500 text-xs mt-1 mb-4">Fill in your details — we'll send you a verification code</p>

              {authError && <ErrorBanner msg={authError} />}
              <RoleTabs role={role} setRole={setRole} />

              <form className="flex flex-col gap-2.5" onSubmit={handleSendOtp}>
                <Field
                  id="reg-name"
                  label="Full Name"
                  placeholder="e.g. Amara Diallo"
                  value={regName}
                  onChange={setRegName}
                />

                <Field
                  id="reg-email"
                  label="Email Address"
                  type="email"
                  placeholder="e.g. amara@email.com"
                  value={regEmail}
                  onChange={setRegEmail}
                />

                {role === "student" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider" htmlFor="reg-grade">Your Grade / Level</label>
                    <select
                      id="reg-grade"
                      value={regGrade}
                      onChange={e => setRegGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f3f6f9] border border-transparent text-gray-900 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-black/5 font-medium transition-all"
                    >
                      <optgroup label="Primary School">
                        <option value="P1">Primary 1 (P1)</option>
                        <option value="P2">Primary 2 (P2)</option>
                        <option value="P3">Primary 3 (P3)</option>
                        <option value="P4">Primary 4 (P4)</option>
                        <option value="P5">Primary 5 (P5)</option>
                        <option value="P6">Primary 6 (P6)</option>
                      </optgroup>
                      <optgroup label="Secondary School">
                        <option value="S1">Secondary 1 (S1)</option>
                        <option value="S2">Secondary 2 (S2)</option>
                        <option value="S3">Secondary 3 (S3)</option>
                        <option value="S4">Secondary 4 (S4)</option>
                        <option value="S5">Secondary 5 (S5)</option>
                        <option value="S6">Secondary 6 (S6)</option>
                      </optgroup>
                    </select>
                  </div>
                )}

                <Field
                  id="reg-pw"
                  label="Password"
                  type={showRegPw ? "text" : "password"}
                  placeholder="Min 8 chars, uppercase, lowercase, number, special"
                  value={regPassword}
                  onChange={setRegPassword}
                  right={<EyeBtn show={showRegPw} toggle={() => setShowRegPw(v => !v)} />}
                  hint={<PwStrength pw={regPassword} />}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider" htmlFor="reg-conf">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="reg-conf"
                      type={showRegConf ? "text" : "password"}
                      placeholder="Repeat your password"
                      className={`w-full px-3.5 py-2.5 bg-[#f3f6f9] text-gray-900 placeholder-gray-400 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-black/5 font-medium transition-all pr-10 border
                        ${pwNoMatch ? "border-red-400/60 focus:border-red-400/40" : pwMatch ? "border-green-400/60 focus:border-green-400/40" : "border-transparent focus:border-gray-200"}`}
                      value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {pwMatch && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      <EyeBtn show={showRegConf} toggle={() => setShowRegConf(v => !v)} />
                    </div>
                  </div>
                  {pwNoMatch && <p className="text-[9px] text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Passwords don't match</p>}
                  {pwMatch && <p className="text-[9px] text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Passwords match</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || !regValid}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-1.5"
                >
                  {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending code...</>
                    : <><Mail className="w-3.5 h-3.5" /> Send Verification Code</>}
                </button>
              </form>

              <p className="text-center text-[11px] text-gray-500 mt-5">
                Already have an account?{" "}
                <button onClick={() => goTo("login")} className="text-black font-bold hover:underline transition-colors">
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ══════════ REGISTER VERIFY SCREEN (Step 2) ══════════ */}
          {screen === "register-verify" && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => goTo("register")}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-black text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Step 2 of 2</span>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
              </div>

              <h1 className="text-lg font-black text-gray-900 text-center tracking-tight uppercase">Check your email</h1>
              <p className="text-gray-500 text-xs text-center mt-1.5 mb-1 leading-relaxed">
                We sent a 6-digit Vive code to
              </p>
              <p className="text-black font-bold text-xs text-center mb-5 font-mono">{regEmail}</p>

              {authError && <ErrorBanner msg={authError} />}
              {authSuccess && <SuccessBanner msg={authSuccess} />}

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                <OtpInput value={otpValue} onChange={setOtpValue} />

                <button
                  type="submit"
                  disabled={loading || otpValue.replace(/ /g, "").length < 6}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...</>
                    : <><CheckCircle className="w-3.5 h-3.5" /> Verify & Create Account</>}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 mt-5">
                <span className="text-[10px] text-gray-400">Didn't receive it?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1 text-[10px] font-bold text-black hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}

          {/* ══════════ FORGOT PASSWORD SCREEN ══════════ */}
          {screen === "forgot" && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => goTo("login")}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-black text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </div>

              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5 text-gray-800" />
              </div>

              <h1 className="text-lg font-black text-gray-900 text-center tracking-tight uppercase">Forgot Password</h1>
              <p className="text-gray-500 text-xs text-center mt-1.5 mb-5 leading-relaxed">
                Enter your email and we'll send a reset link to your inbox.
              </p>

              {authError && <ErrorBanner msg={authError} />}

              <form className="flex flex-col gap-3.5" onSubmit={handleForgot}>
                <Field
                  id="forgot-id"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={setForgotEmail}
                />

                <button
                  type="submit"
                  disabled={!forgotEmail || forgotLoading}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>
            </div>
          )}

          {/* ══════════ FORGOT SUCCESS SCREEN ══════════ */}
          {screen === "forgot-success" && (
            <div className="w-full flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-5">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>

              <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">Link Sent</h1>

              <p className="text-gray-500 text-xs leading-relaxed mt-1.5 mb-6 max-w-[280px]">
                We sent a password reset link to{" "}
                <span className="text-black font-bold font-mono text-[11px]">{forgotEmail}</span>. Check your inbox.
              </p>

              <button
                onClick={() => { goTo("login"); setForgotEmail(""); }}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
              >
                Back to Login
              </button>

              <p className="text-[10px] text-gray-400 mt-4">
                Didn't receive it?{" "}
                <button onClick={() => goTo("forgot")} className="text-black font-bold hover:underline">Try again</button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
