"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getInsforgeClient } from "@/utils/insforge/client";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ShieldCheck,
    School,
    Zap,
    Cpu,
    Crosshair,
    Building2,
    Users
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"principal" | "faculty">("principal");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);

    const insforge = getInsforgeClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data, error: signInError } = await insforge.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Read role from InsForge user profile/metadata
            const user = data?.user as any;
            const actualRole =
                user?.profile?.role ||
                user?.metadata?.role ||
                role; // fall back to UI-selected role (login page toggle)

            if (!actualRole || (actualRole !== "principal" && actualRole !== "faculty")) {
                // Profile is incomplete — go to oauth-complete to finish setup
                router.push("/oauth-complete");
            } else {
                router.push(actualRole === "principal" ? "/dashboard" : "/faculty");
            }
            router.refresh();

        } catch (err: any) {
            setError(err.message || "Failed to sign in. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider: "google" | "github") => {
        setError(null);
        setOauthLoading(provider);
        try {
            // Redirect to /oauth-complete — it checks user's profile and routes accordingly
            // (handles both returning users and new OAuth sign-ups)
            await insforge.auth.signInWithOAuth({
                provider,
                redirectTo: `${window.location.origin}/oauth-complete`,
            });
        } catch (err: any) {
            setError(err.message || `Failed to sign in with ${provider}.`);
            setOauthLoading(null);
        }
    };

    // Role-specific content
    const roleContent = {
        principal: {
            badge: "Principal Access",
            tagline: "Institute-wide control & analytics",
            icon: <Building2 className="w-5 h-5" />,
            accent: "from-blue-600 to-violet-600",
            glowColor: "rgba(99, 102, 241, 0.25)",
            features: [
                { icon: <Zap className="w-4 h-4" />, title: "Full Institute Control", desc: "Manage faculty, departments & all settings" },
                { icon: <Cpu className="w-4 h-4" />, title: "AI Anomaly Detection", desc: "Gemini AI validates attendance in real-time" },
                { icon: <Crosshair className="w-4 h-4" />, title: "Advanced Reports", desc: "Monthly, daily and period-wise analytics" },
            ]
        },
        faculty: {
            badge: "Faculty Access",
            tagline: "Class management & live sessions",
            icon: <Users className="w-5 h-5" />,
            accent: "from-violet-600 to-pink-600",
            glowColor: "rgba(168, 85, 247, 0.25)",
            features: [
                { icon: <Zap className="w-4 h-4" />, title: "Live Sessions", desc: "Start AI face recognition attendance instantly" },
                { icon: <School className="w-4 h-4" />, title: "Class Dashboard", desc: "View attendance trends for your classes" },
                { icon: <Crosshair className="w-4 h-4" />, title: "Sleep Detection", desc: "Monitor student engagement in real-time" },
            ]
        }
    };

    const content = roleContent[role];

    return (
        <div className="bg-[#070a10] font-display min-h-screen flex flex-col text-white antialiased overflow-x-hidden">
            {/* Animated gradient bg */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute top-[-20%] left-[30%] w-[50%] h-[60%] rounded-full blur-[140px] transition-all duration-1000"
                    style={{ background: content.glowColor }}
                />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-violet-900/20 rounded-full blur-[100px]" />
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-20 w-full border-b border-white/5 bg-[#070a10]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-white text-[18px]">face</span>
                            </div>
                            <span className="font-black text-lg tracking-tight text-white">SmartAI<span className="text-blue-400"> Attendance</span></span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">How it works</Link>
                            <Link className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Security</Link>
                            <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20">
                                Register Institute
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

                    {/* LEFT: Role-Specific Hero Content */}
                    <div className="hidden lg:flex flex-col justify-center space-y-8">
                        {/* Role badge */}
                        <div className="flex items-center gap-3">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${content.accent} bg-opacity-20 border border-white/10 shadow-lg`}>
                                {content.icon}
                                {content.badge}
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        {/* Title */}
                        <div className="space-y-4">
                            <h1 className="text-5xl xl:text-6xl font-black leading-tight tracking-tight text-white">
                                Secure Access<br />
                                with <span className={`bg-gradient-to-r ${content.accent} bg-clip-text text-transparent`}>Next-Gen</span><br />
                                Face ID
                            </h1>
                            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                                {content.tagline}. Our AI-powered system ensures 99.9% accuracy with real-time liveness detection.
                            </p>
                        </div>

                        {/* Role-specific feature cards */}
                        <div className="space-y-3">
                            {content.features.map((f, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors group">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${content.accent} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                                        {f.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{f.title}</h3>
                                        <p className="text-sm text-slate-400 mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Gemini badge */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shrink-0">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-bold text-white text-sm">Powered by Google Gemini AI</span>
                                <p className="text-xs text-slate-400 mt-0.5">Advanced anomaly detection & automated reporting</p>
                            </div>
                            <div className="ml-auto">
                                <span className="px-2 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full">LIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Login Form */}
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-[#0e1218] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Gradient top bar — changes with role */}
                            <div className={`h-1 w-full bg-gradient-to-r ${content.accent}`} />

                            <div className="p-8">
                                {/* Header */}
                                <div className="text-center mb-7">
                                    <h2 className="text-2xl font-black text-white mb-1">Welcome Back</h2>
                                    <p className="text-slate-400 text-sm">Sign in to manage your institute dashboard</p>
                                </div>

                                {/* Role Toggle — PRINCIPAL vs FACULTY */}
                                <div className="flex bg-[#1a1f2e] rounded-xl p-1 mb-7 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => { setRole("principal"); setError(null); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${role === "principal"
                                            ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <Building2 className="w-4 h-4" /> Principal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setRole("faculty"); setError(null); }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${role === "faculty"
                                            ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-500/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <Users className="w-4 h-4" /> Faculty
                                    </button>
                                </div>

                                {/* Role-specific info banner */}
                                <div className={`mb-6 p-3 rounded-lg bg-gradient-to-r ${content.accent} bg-opacity-10 border border-white/10 flex items-center gap-3`}
                                    style={{ background: `linear-gradient(to right, ${role === "principal" ? "rgba(37,99,235,0.12)" : "rgba(124,58,237,0.12)"}, rgba(0,0,0,0))` }}>
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${content.accent} flex items-center justify-center shrink-0`}>
                                        {content.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{content.badge}</p>
                                        <p className="text-xs text-slate-400">{content.tagline}</p>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* OAuth Buttons */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => handleOAuth("google")}
                                        disabled={!!oauthLoading}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {oauthLoading === "google" ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        )}
                                        Google
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleOAuth("github")}
                                        disabled={!!oauthLoading}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {oauthLoading === "github" ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                            </svg>
                                        )}
                                        GitHub
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-3 bg-[#0e1218] text-xs text-slate-500 font-medium">or continue with email</span>
                                    </div>
                                </div>

                                {/* Email/Password Form */}
                                <form className="space-y-4" onSubmit={handleLogin}>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider" htmlFor="email">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={role === "principal" ? "principal@institute.edu" : "faculty@institute.edu"}
                                                className="block w-full pl-9 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider" htmlFor="password">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="block w-full pl-9 pr-10 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40" />
                                            <span className="text-sm text-slate-400">Remember me</span>
                                        </label>
                                        <Link className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors" href="/forgot-password">
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${content.accent} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg`}
                                    >
                                        {isLoading ? (
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <LogIn className="w-4 h-4" />
                                        )}
                                        {isLoading ? "Signing in..." : `Sign in as ${role === "principal" ? "Principal" : "Faculty"}`}
                                    </button>
                                </form>

                                {/* Footer Links */}
                                <div className="mt-6 pt-5 border-t border-white/8 flex flex-col items-center gap-2">
                                    <p className="text-sm text-slate-400">
                                        New to the platform?{" "}
                                        <Link className="font-bold text-blue-400 hover:text-blue-300 transition-colors" href="/register">
                                            Register your Institute
                                        </Link>
                                    </p>
                                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Encrypted end-to-end. Your data is secure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 py-6 text-center border-t border-white/5">
                <p className="text-slate-600 text-xs">© 2024 SmartAI Attendance System. All rights reserved.</p>
            </footer>
        </div>
    );
}
