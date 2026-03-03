"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getInsforgeClient } from "@/utils/insforge/client";
import {
    Building2,
    School,
    ShieldAlert,
    User,
    Mail,
    Lock,
    Camera,
    Info,
    ChevronDown,
    Loader2
} from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<"principal" | "faculty">("principal");

    // Shared fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Principal specific
    const [instituteName, setInstituteName] = useState("");

    // Faculty specific
    const [selectedInstitute, setSelectedInstitute] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const insforge = getInsforgeClient();

    const handleOAuth = async (provider: "google" | "github") => {
        setError(null);
        setOauthLoading(provider);
        try {
            // OAuth redirects to /oauth-complete which handles role/institute setup
            await insforge.auth.signInWithOAuth({
                provider,
                redirectTo: `${window.location.origin}/oauth-complete`,
            });
        } catch (err: any) {
            setError(err.message || `Failed to sign up with ${provider}.`);
            setOauthLoading(null);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (role === "principal" && !instituteName.trim()) {
            setError("Institute name is required for Principal registration.");
            return;
        }

        if (role === "faculty" && !selectedInstitute) {
            setError("Please select an institute.");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Sign up the user via InsForge Auth
            const { data, error: signUpError } = await insforge.auth.signUp({
                email,
                password,
                name: fullName,
            });

            if (signUpError) {
                throw signUpError;
            }

            // 2. After signup, store extra role/institute metadata in the user profile
            if (data?.accessToken) {
                // User is already signed in (email verification disabled)
                await insforge.auth.setProfile({
                    name: fullName,
                    role: role,
                    institute_name: role === "principal" ? instituteName : null,
                    institute_id: role === "faculty" ? selectedInstitute : null,
                });

                setSuccessMsg("Registration successful! Redirecting to your dashboard...");
                setTimeout(() => {
                    router.push(role === "principal" ? "/dashboard" : "/faculty");
                }, 1500);
            } else if (data?.requireEmailVerification) {
                // Email verification required — show message, redirect to verify page
                setSuccessMsg("Account created! Please check your email and enter the 6-digit verification code to activate your account.");
                setTimeout(() => {
                    router.push(`/verify-email?email=${encodeURIComponent(email)}&role=${role}`);
                }, 2000);
            } else {
                setSuccessMsg("Registration successful! Please log in to continue.");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }

        } catch (err: any) {
            setError(err.message || "Failed to register. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0d1117] font-display text-slate-100 min-h-screen antialiased overflow-x-hidden">
            {/* Mesh background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute w-96 h-96 bg-primary/8 rounded-full blur-3xl top-0 right-0 animate-pulse"></div>
                <div className="absolute w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl bottom-0 left-0 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <nav className="relative z-10 border-b border-slate-800 bg-[#0d1117]/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[18px]">face</span>
                        </div>
                        <span className="font-black text-lg text-white">SmartAI Attendance</span>
                    </Link>
                    <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">login</span> Already have an account? Sign In
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">Create Your Account</h1>
                        <p className="text-slate-400">Join the Smart AI Attendance ecosystem</p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1.5 mb-8">
                        <button
                            onClick={() => { setRole("principal"); setError(null); }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${role === "principal" ? "bg-primary text-white shadow-[0_4px_15px_rgba(19,127,236,0.3)]" : "bg-transparent text-slate-400"
                                }`}
                        >
                            <ShieldAlert className="w-5 h-5" /> Principal Registration
                        </button>
                        <button
                            onClick={() => { setRole("faculty"); setError(null); }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${role === "faculty" ? "bg-primary text-white shadow-[0_4px_15px_rgba(19,127,236,0.3)]" : "bg-transparent text-slate-400"
                                }`}
                        >
                            <School className="w-5 h-5" /> Faculty Registration
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm md:text-base font-medium text-center">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm md:text-base font-medium text-center">
                            {successMsg}
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="bg-[#111418] border border-slate-800 rounded-2xl overflow-hidden">
                        <div className={`h-1 bg-gradient-to-r ${role === 'principal' ? 'from-primary via-violet-500 to-primary' : 'from-violet-500 via-primary to-violet-500'}`}></div>

                        <div className="p-8">

                            {/* OAuth Buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => handleOAuth("google")}
                                    disabled={!!oauthLoading}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    {oauthLoading === "google" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    Sign up with Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOAuth("github")}
                                    disabled={!!oauthLoading}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    {oauthLoading === "github" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                        </svg>
                                    )}
                                    Sign up with GitHub
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/8" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-3 bg-[#111418] text-xs text-slate-500 font-medium">or register with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleRegister}>
                                {/* Dynamic Header */}
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'principal' ? 'bg-primary/20 text-primary' : 'bg-violet-500/20 text-violet-400'}`}>
                                        {role === 'principal' ? <ShieldAlert className="w-5 h-5" /> : <School className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white">
                                            {role === 'principal' ? 'Principal Registration' : 'Faculty Registration'}
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            {role === 'principal'
                                                ? 'Creates a new institute record. Full system access.'
                                                : 'Links to existing institute. Access restricted to assigned classes.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 text-slate-500 w-[18px] h-[18px]" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder={role === 'principal' ? "Dr. Sarah Anderson" : "Prof. John Smith"}
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-[#1c2127] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${role === 'principal' ? 'focus:ring-primary/50 focus:border-primary' : 'focus:ring-violet-500/50 focus:border-violet-500'}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-slate-500 w-[18px] h-[18px]" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder={role === 'principal' ? "principal@institute.edu" : "faculty@institute.edu"}
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-[#1c2127] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${role === 'principal' ? 'focus:ring-primary/50 focus:border-primary' : 'focus:ring-violet-500/50 focus:border-violet-500'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {role === 'principal' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Institute Name</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-3 text-slate-500 w-[18px] h-[18px]" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={instituteName}
                                                    onChange={(e) => setInstituteName(e.target.value)}
                                                    placeholder="National Institute of Technology"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-[#1c2127] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Institute</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-3 text-slate-500 w-[18px] h-[18px]" />
                                                <select
                                                    required
                                                    value={selectedInstitute}
                                                    onChange={(e) => setSelectedInstitute(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-2.5 bg-[#1c2127] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm appearance-none"
                                                >
                                                    <option value="" disabled>Select an institute...</option>
                                                    <option value="inst_1">National Institute of Technology</option>
                                                    <option value="inst_2">City Engineering College</option>
                                                    <option value="inst_3">State University — CS Department</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-slate-500 w-[18px] h-[18px] pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 text-slate-500 w-[18px] h-[18px]" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-[#1c2127] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${role === 'principal' ? 'focus:ring-primary/50 focus:border-primary' : 'focus:ring-violet-500/50 focus:border-violet-500'}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 text-slate-500 w-[18px] h-[18px]" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-[#1c2127] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${role === 'principal' ? 'focus:ring-primary/50 focus:border-primary' : 'focus:ring-violet-500/50 focus:border-violet-500'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Profile Photo</label>
                                        <div className="border-2 border-dashed border-slate-700 hover:border-primary hover:bg-primary/5 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all">
                                            <div className={`w-12 h-12 rounded-full bg-[#1c2127] flex items-center justify-center`}>
                                                <Camera className={`w-6 h-6 ${role === 'principal' ? 'text-primary' : 'text-violet-400'}`} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-slate-300">Click to upload or drag & drop</p>
                                                <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB • Used for AI face registration</p>
                                            </div>
                                            <span className={`px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1 mt-2`}>
                                                <span className="material-symbols-outlined text-xs">face</span> AI Face Enrolled
                                            </span>
                                        </div>
                                    </div>

                                    {/* Security/Info Notice */}
                                    {role === 'principal' ? (
                                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2">
                                            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-400">
                                                As Principal, you will have <strong className="text-white">full access</strong> to manage faculty, view all attendance, download reports, and control institute settings.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2">
                                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-400">
                                                Faculty accounts may require <strong className="text-amber-400">Principal approval</strong> before activation. You will receive an email confirmation once approved.
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3.5 text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${role === 'principal'
                                            ? 'bg-primary hover:bg-primary/90 shadow-primary/25'
                                            : 'bg-violet-600 hover:bg-violet-600/90 shadow-violet-500/25'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">how_to_reg</span>
                                        {isLoading ? "Processing..." : (role === 'principal' ? "Create Institute & Register" : "Register as Faculty")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <p className="text-center text-slate-500 text-sm mt-6">
                        Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
