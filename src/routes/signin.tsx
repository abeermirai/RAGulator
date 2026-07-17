import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/lib/app-context";
import { ArrowRight, Eye, EyeOff, Fingerprint, Globe, KeyRound, Lock, Mail, Moon, ShieldCheck, Smartphone, Sun } from "lucide-react";

export const Route = createFileRoute("/signin")({
  component: SignIn,
  head: () => ({ meta: [{ title: "تسجيل الدخول · نظام الإنماء للتدقيق الذكي" }] }),
});

type Step = "credentials" | "mfa";

function SignIn() {
  const { lang, dir, theme, toggleTheme, toggleLang } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("fahad.alotaibi@alinma.com");
  const [password, setPassword] = useState("••••••••••");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isAr = lang === "ar";
  const s = {
    title: isAr ? "تسجيل الدخول الآمن" : "Secure sign in",
    subtitle: isAr
      ? "الوصول محصور على المدققين المعتمدين لبنك الإنماء"
      : "Access restricted to certified Alinma Bank auditors",
    email: isAr ? "البريد المؤسسي" : "Corporate email",
    password: isAr ? "كلمة المرور" : "Password",
    remember: isAr ? "إبقاء الجلسة نشطة لمدة ٨ ساعات" : "Keep session active for 8 hours",
    forgot: isAr ? "نسيت كلمة المرور؟" : "Forgot password?",
    continue: isAr ? "متابعة" : "Continue",
    sso: isAr ? "الدخول عبر الهوية الرقمية (SSO)" : "Sign in with SSO",
    biometric: isAr ? "الدخول عبر البصمة" : "Sign in with biometrics",
    or: isAr ? "أو" : "or",
    mfaTitle: isAr ? "التحقق بخطوتين" : "Two-factor verification",
    mfaBody: isAr
      ? "أدخل الرمز المكوّن من ٦ أرقام المرسل إلى تطبيق Alinma Authenticator على جهازك."
      : "Enter the 6-digit code from the Alinma Authenticator app on your device.",
    device: isAr ? "الجهاز المسجّل" : "Registered device",
    deviceVal: isAr ? "iPhone 15 Pro · محمي بالبصمة" : "iPhone 15 Pro · Face ID",
    resend: isAr ? "إعادة إرسال الرمز" : "Resend code",
    trustDevice: isAr ? "الوثوق بهذا الجهاز لمدة ٣٠ يوماً" : "Trust this device for 30 days",
    verify: isAr ? "تحقّق ودخول" : "Verify and sign in",
    back: isAr ? "رجوع" : "Back",
    cyberNotice: isAr
      ? "بالدخول أنت تُقرّ بسياسة الأمن السيبراني لبنك الإنماء وتلتزم بمتطلبات مؤسسة النقد."
      : "By signing in you accept Alinma's cybersecurity policy and SAMA compliance requirements.",
    footer: isAr
      ? "© ٢٠٢٦ بنك الإنماء · جميع الحقوق محفوظة"
      : "© 2026 Alinma Bank · All rights reserved",
    poweredBy: isAr ? "مدعومة بمحرك RAGulator AI" : "Powered by RAGulator AI",
    secure: isAr ? "اتصال مشفّر من طرف إلى طرف" : "End-to-end encrypted connection",
  };

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setStep("mfa");
    setTimeout(() => inputs.current[0]?.focus(), 60);
  }

  function handleOtpChange(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = text[i] ?? "";
    setOtp(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 650);
  }

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background" dir={dir}>
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--foreground)/0.04),transparent_60%),radial-gradient(ellipse_at_bottom_left,_hsl(var(--foreground)/0.05),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_right,_hsl(215_60%_40%/0.18),transparent_60%),radial-gradient(ellipse_at_bottom_left,_hsl(20_60%_50%/0.14),transparent_55%)]" />
        <div className="absolute -top-40 -end-40 h-96 w-96 rounded-full bg-[#5E6BB2]/20 blur-3xl" />
        <div className="absolute -bottom-40 -start-40 h-96 w-96 rounded-full bg-[#E28A6D]/15 blur-3xl" />
      </div>

      {/* Top toolbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <BrandLogo />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card transition"
          >
            <Globe className="h-3.5 w-3.5 text-[#5E6BB2]" />
            {isAr ? "English" : "العربية"}
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur text-foreground hover:bg-card transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main split */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 px-6 pb-10 md:px-10 lg:min-h-[calc(100dvh-9rem)]">
        {/* Left: enterprise pitch */}
        <section className="hidden lg:flex flex-col justify-center gap-8 pe-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5E6BB2]/30 bg-[#5E6BB2]/10 px-3 py-1 text-[11px] font-medium text-[#5E6BB2] dark:text-[#b3bbe4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              ICAAP 2026 · SAMA compliant
            </span>
            <h1 className="mt-5 font-display text-4xl xl:text-5xl font-bold leading-tight text-foreground">
              {isAr
                ? "منصة التدقيق الذكي لبنك الإنماء"
                : "Intelligent Audit Platform for Alinma Bank"}
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              {isAr
                ? "منظومة مؤسسية موحّدة لتقييم كفاية رأس المال الداخلي، مراجعة الأدلة، وإعداد تقارير ICAAP وفق متطلبات مؤسسة النقد."
                : "A unified enterprise workspace for capital-adequacy assessment, evidence review, and ICAAP reporting aligned to SAMA requirements."}
            </p>
          </div>

          <ul className="space-y-4 max-w-lg">
            {[
              {
                icon: Lock,
                title: isAr ? "تشفير من طرف إلى طرف" : "End-to-end encryption",
                body: isAr
                  ? "جميع المستندات تُعالج داخل شبكة بنك الإنماء الداخلية عبر بوابة SAMA CSF."
                  : "All documents are processed inside Alinma's internal network via the SAMA CSF gateway.",
              },
              {
                icon: ShieldCheck,
                title: isAr ? "تحقق بخطوتين إلزامي" : "Mandatory two-factor auth",
                body: isAr
                  ? "مفروض بموجب سياسة الأمن السيبراني ٢٠٢٦ لجميع المدققين المعتمدين."
                  : "Enforced by the 2026 cybersecurity policy for every certified auditor.",
              },
              {
                icon: KeyRound,
                title: isAr ? "تفويض قائم على الأدوار" : "Role-based authorization",
                body: isAr
                  ? "أذونات مستقلة للمدقق، المراجع، والمدير التنفيذي مع سجلات تدقيق كاملة."
                  : "Separate permissions for auditor, reviewer, and executive with full audit trails.",
              },
            ].map((it) => (
              <li key={it.title} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card border border-border text-[#5E6BB2] dark:text-[#b3bbe4] shadow-sm">
                  <it.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{it.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{it.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            {s.secure}
          </div>
        </section>

        {/* Right: sign-in card */}
        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md border-border shadow-elegant bg-card/95 backdrop-blur">
            <CardContent className="p-8 md:p-10">
              {step === "credentials" ? (
                <form onSubmit={handleCredentials} className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">{s.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.subtitle}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-foreground">{s.email}</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 ps-10 text-start"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium text-foreground">{s.password}</Label>
                        <button type="button" className="text-[11px] font-medium text-[#5E6BB2] dark:text-[#b3bbe4] hover:underline">
                          {s.forgot}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
                        <Input
                          id="password"
                          type={showPass ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 ps-10 pe-10 text-start"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          aria-label={showPass ? "Hide password" : "Show password"}
                          className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground transition"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-border accent-[#5E6BB2]"
                      />
                      {s.remember}
                    </label>
                  </div>

                  <Button type="submit" className="w-full h-11 bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white shadow-elegant">
                    {s.continue}
                    <ArrowRight className={`h-4 w-4 ${dir === "rtl" ? "rotate-180 me-2" : "ms-2"}`} />
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground">{s.or}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="h-11 border-border">
                      <ShieldCheck className="h-4 w-4 me-2 text-[#5E6BB2] dark:text-[#b3bbe4]" />
                      <span className="text-xs font-medium">{s.sso}</span>
                    </Button>
                    <Button type="button" variant="outline" className="h-11 border-border">
                      <Fingerprint className="h-4 w-4 me-2 text-[#E28A6D]" />
                      <span className="text-xs font-medium">{s.biometric}</span>
                    </Button>
                  </div>

                  <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
                    {s.cyberNotice}
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5E6BB2]/10 text-[#5E6BB2] dark:text-[#b3bbe4]">
                      <Smartphone className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">{s.mfaTitle}</h2>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.mfaBody}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/40 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.device}</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">{s.deviceVal}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-medium">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-center gap-2" dir="ltr">
                      {otp.map((v, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            inputs.current[i] = el;
                          }}
                          value={v}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKey(i, e)}
                          onPaste={handleOtpPaste}
                          inputMode="numeric"
                          maxLength={1}
                          aria-label={`Digit ${i + 1}`}
                          className="h-14 w-11 rounded-lg border border-border bg-background text-center font-mono text-xl font-bold text-foreground shadow-sm outline-none focus:border-[#5E6BB2] focus:ring-2 focus:ring-[#5E6BB2]/20 transition"
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <button type="button" className="font-medium text-[#5E6BB2] dark:text-[#b3bbe4] hover:underline">
                        {s.resend}
                      </button>
                      <span className="font-mono tabular-nums">00:47</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-border accent-[#5E6BB2]" />
                    {s.trustDevice}
                  </label>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 border-border"
                      onClick={() => setStep("credentials")}
                    >
                      {s.back}
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || otp.some((d) => !d)}
                      className="h-11 flex-1 bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white shadow-elegant disabled:opacity-60"
                    >
                      {submitting ? (isAr ? "جاري التحقق..." : "Verifying…") : s.verify}
                      {!submitting && <ArrowRight className={`h-4 w-4 ${dir === "rtl" ? "rotate-180 me-2" : "ms-2"}`} />}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-5 md:px-10 border-t border-border/60">
        <p className="text-[11px] text-muted-foreground">{s.footer}</p>
        <p className="text-[11px] text-muted-foreground">{s.poweredBy}</p>
      </footer>
    </div>
  );
}