"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getInsforgeClient } from "@/utils/insforge/client";
import { Mail, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const role = searchParams.get("role") || "principal";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMsg, setResendMsg] = useState<string | null>(null);

    const insforge = getInsforgeClient();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data, error: verifyError } = await insforge.auth.verifyEmail({
                email,
                otp,
            });

            if (verifyError) throw verifyError;

            setSuccess(true);
            setTimeout(() => {
                router.push(role === "principal" ? "/dashboard" : "/faculty");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Invalid or expired code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setResendMsg(null);
        setError(null);
        try {
            await insforge.auth.resendVerificationEmail({ email });
            setResendMsg("Verification code resent! Check your email.");
        } catch (err: any) {
            setError("Failed to resend code: " + (err.message || "Unknown error"));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-[#0d1117] font-display text-slate-100 min-h-screen antialiased flex items-center justify-center p-6">
            {/* Mesh background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute w-96 h-96 bg-primary/8 rounded-full blur-3xl top-0 right-0 animate-pulse"></div>
                <div className="absolute w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl bottom-0 left-0 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">face</span>
                        </div>
                        <span className="font-black text-xl text-white">SmartAI Attendance</span>
                    </Link>
                    <h1 className="text-2xl font-black text-white mb-2">Verify Your Email</h1>
                    <p className="text-slate-400 text-sm">
                        A 6-digit code was sent to{" "}
                        <span className="text-primary font-semibold">{email || "your email"}</span>
                    </p>
                </div>

                <div className="bg-[#111418] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-primary"></div>
                    <div className="p-8">
                        {success ? (
                            <div className="flex flex-col items-center gap-4 py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>
                                <p className="text-white font-bold text-lg">Email verified!</p>
                                <p className="text-slate-400 text-sm text-center">Redirecting you to the dashboard...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Verification Code
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-slate-500 w-[18px] h-[18px]" />
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            placeholder="123456"
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#1c2127] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-xl font-mono tracking-[0.5em]"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}
                                {resendMsg && (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
                                        {resendMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight size={18} />
                                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="w-full py-2.5 text-slate-400 hover:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={14} />
                                    {isResending ? "Sending..." : "Resend code"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Wrong account?{" "}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                        Register again
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="bg-[#0d1117] min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
