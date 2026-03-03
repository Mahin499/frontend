"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getInsforgeClient } from "@/utils/insforge/client";
import { Building2, Users, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

export default function OAuthCompletePage() {
    const router = useRouter();

    const [step, setStep] = useState<"detecting" | "role" | "institute" | "done">("detecting");
    const [role, setRole] = useState<"principal" | "faculty">("principal");
    const [instituteName, setInstituteName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState("");

    const insforge = getInsforgeClient();

    useEffect(() => {
        // After OAuth redirect, check if user has a session + profile already set
        const checkSession = async () => {
            try {
                const { data } = await insforge.auth.getCurrentSession();
                if (!data?.session) {
                    // No session - redirect to login
                    router.push("/login");
                    return;
                }

                const user = data.session.user;
                setUserName((user as any)?.profile?.name || user?.email?.split("@")[0] || "");

                // Check if role/institute already set in profile
                const existingRole = (user as any)?.profile?.role || (user as any)?.metadata?.role;
                if (existingRole) {
                    // Profile already complete — go to dashboard
                    router.push(existingRole === "principal" ? "/dashboard" : "/faculty");
                    return;
                }

                // Profile incomplete — show role selection
                setStep("role");
            } catch {
                router.push("/login");
            }
        };

        checkSession();
    }, []);

    const handleRoleSelect = (selectedRole: "principal" | "faculty") => {
        setRole(selectedRole);
        setStep("institute");
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Save role + institute to InsForge profile
            const profileData: Record<string, any> = { role };
            if (role === "principal") {
                if (!instituteName.trim()) {
                    setError("Institute name is required.");
                    setIsLoading(false);
                    return;
                }
                profileData.institute_name = instituteName.trim();
            }

            const { error: profileError } = await insforge.auth.setProfile(profileData);
            if (profileError) throw profileError;

            setStep("done");
            setTimeout(() => {
                router.push(role === "principal" ? "/dashboard" : "/faculty");
            }, 1200);
        } catch (err: any) {
            setError(err.message || "Failed to save profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070a10] flex items-center justify-center p-4">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[30%] w-[50%] h-[60%] bg-blue-600/15 rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="material-symbols-outlined text-white text-[20px]">face</span>
                    </div>
                    <span className="font-black text-xl text-white">SmartAI<span className="text-blue-400"> Attendance</span></span>
                </div>

                {/* Card */}
                <div className="bg-[#0e1218] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-violet-600" />
                    <div className="p-8">

                        {/* STEP: detecting */}
                        {step === "detecting" && (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                                <p className="text-white font-semibold">Setting up your account...</p>
                                <p className="text-slate-400 text-sm text-center">Connecting with your OAuth provider</p>
                            </div>
                        )}

                        {/* STEP: role selection */}
                        {step === "role" && (
                            <>
                                <div className="text-center mb-7">
                                    <h1 className="text-2xl font-black text-white mb-1">Almost there, {userName}!</h1>
                                    <p className="text-slate-400 text-sm">What is your role in the institute?</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect("principal")}
                                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-blue-600/10 hover:border-blue-500/40 transition-all group"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Building2 className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-white text-sm">Principal</p>
                                            <p className="text-xs text-slate-400 mt-1">Create & manage institute</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect("faculty")}
                                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-violet-600/10 hover:border-violet-500/40 transition-all group"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Users className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-white text-sm">Faculty</p>
                                            <p className="text-xs text-slate-400 mt-1">Join an existing institute</p>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP: institute name / faculty confirmation */}
                        {step === "institute" && (
                            <>
                                <div className="text-center mb-7">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role === "principal" ? "from-blue-600 to-violet-600" : "from-violet-600 to-pink-600"} flex items-center justify-center shadow-lg mx-auto mb-4`}>
                                        {role === "principal" ? <Building2 className="w-7 h-7 text-white" /> : <Users className="w-7 h-7 text-white" />}
                                    </div>
                                    <h1 className="text-xl font-black text-white mb-1">
                                        {role === "principal" ? "Name your Institute" : "You're joining as Faculty"}
                                    </h1>
                                    <p className="text-slate-400 text-sm">
                                        {role === "principal"
                                            ? "Your institute will be created and you'll have full admin access."
                                            : "You'll be able to access your classes once a Principal approves you."}
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleComplete} className="space-y-4">
                                    {role === "principal" ? (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                                Institute Name
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    value={instituteName}
                                                    onChange={e => setInstituteName(e.target.value)}
                                                    placeholder="e.g. National Institute of Technology"
                                                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-violet-500/8 border border-violet-500/15 text-sm text-slate-300">
                                            You'll receive access once a Principal from your institute adds you. You can also contact them directly to get your institute code.
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep("role")}
                                            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${role === "principal" ? "from-blue-600 to-violet-600" : "from-violet-600 to-pink-600"} hover:opacity-90 transition-all disabled:opacity-50`}
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                            {isLoading ? "Saving..." : "Complete Setup →"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* STEP: done */}
                        {step === "done" && (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-bold text-lg">All set!</p>
                                    <p className="text-slate-400 text-sm mt-1">Redirecting to your dashboard...</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secured by InsForge. Your data is encrypted.
                </p>
            </div>
        </div>
    );
}
