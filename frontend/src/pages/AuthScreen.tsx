import React, { useState } from "react";
import { ShieldLogo } from "../components/common/ShieldLogo";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import type { UserRole } from "../types";

export function AuthScreen() {
  const { login, signup, demoLogin } = useAuth();
  const { push } = useToast();
  const [view, setView] = useState<"splash" | "login" | "signup">("splash");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user"); const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try { view === "login" ? await login(email, password) : await signup(name, email, password, role); }
    catch { push("API unavailable — use Demo access", "warning"); }
    finally { setSubmitting(false); }
  }

  if (view === "splash") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-navy bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(0,240,255,0.12),transparent)] px-6">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <ShieldLogo size="lg" className="mb-12" />
        <button onClick={() => setView("login")} className="glow-cyan mb-4 w-full max-w-xs rounded-xl border border-accent-cyan/50 bg-accent-blue/20 py-3.5 text-sm font-bold uppercase tracking-widest text-accent-cyan hover:bg-accent-blue/30">Login</button>
        <button onClick={() => setView("signup")} className="text-sm font-medium text-accent-cyan/80 hover:text-accent-cyan">Sign Up</button>
        <div className="mt-16 flex w-full max-w-xs flex-col gap-2">
          <button onClick={() => demoLogin("user")} className="w-full rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 py-2.5 text-xs font-medium text-accent-cyan hover:bg-accent-cyan/20">Demo User App</button>
          <button onClick={() => demoLogin("admin")} className="w-full rounded-lg border border-accent-blue/30 bg-accent-blue/10 py-2.5 text-xs font-medium text-accent-blue hover:bg-accent-blue/20">Demo Admin Control Center</button>
          <p className="text-center text-[10px] text-slate-600">Separate panels — no role switching inside admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="glass-card w-full max-w-md rounded-2xl p-8">
        <ShieldLogo size="md" className="mb-6" />
        <h2 className="mb-6 text-center text-lg font-bold text-white">{view === "login" ? "Welcome Back" : "Create Account"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {view === "signup" && <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent-cyan/50" />}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent-cyan/50" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent-cyan/50" />
          {view === "signup" && (
            <div className="flex gap-3">{(["user", "admin"] as UserRole[]).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 rounded-xl border py-2.5 text-sm capitalize ${role === r ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan" : "border-white/10 text-slate-400"}`}>{r}</button>
            ))}</div>
          )}
          <button type="submit" disabled={submitting} className="glow-red w-full rounded-xl bg-emergency-red py-3 text-sm font-bold uppercase text-white disabled:opacity-50">{submitting ? "Please wait..." : view === "login" ? "Login" : "Sign Up"}</button>
        </form>
        <button onClick={() => setView("splash")} className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-300">← Back</button>
      </div>
    </div>
  );
}
