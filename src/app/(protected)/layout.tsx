"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getInsforgeClient } from "@/utils/insforge/client";
import Sidebar from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);
    const [role, setRole] = useState<"principal" | "faculty">("faculty"); // Default fallback
    const [toasts, setToasts] = useState<{ id: string, msg: string, type: 'student' | 'ai' }[]>([]);

    const addToast = (msg: string, type: 'student' | 'ai') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    useEffect(() => {
        const insforge = getInsforgeClient();
        insforge.auth.getCurrentSession().then(({ data }) => {
            if (!data?.session) {
                router.replace("/login");
            } else {
                const user = data.session.user as any;
                const userRole = user?.profile?.role || user?.user_metadata?.role || "faculty";
                setRole(userRole);

                // Role-based Route Protection
                if (userRole === "faculty" && pathname.startsWith("/faculty")) {
                    router.replace("/dashboard");
                } else if (userRole === "principal" && (pathname.startsWith("/live-session") || pathname.startsWith("/ai-validation"))) {
                    router.replace("/dashboard");
                } else {
                    setChecking(false);
                }
            }
        }).catch(() => {
            router.replace("/login");
        });

        const rt = (insforge as any).realtime;
        if (rt) {
            rt.connect?.();
            const channels = rt.channel?.('global-notifications')
                ?.on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'students' },
                    (payload: any) => {
                        addToast(`New student added: ${payload.new.name || 'Unknown'}`, 'student');
                    }
                )
                ?.on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'ai_validations' },
                    (payload: any) => {
                        addToast(`Live Detection: ${payload.new.student_name || 'Subject'} (${payload.new.confidence}%)`, 'ai');
                    }
                )
                ?.subscribe();

            return () => {
                channels?.unsubscribe();
            };
        }
    }, [pathname]);

    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0d1117]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-white text-[20px]">face</span>
                    </div>
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    <p className="text-slate-400 text-sm">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        /*
         * Mobile  (< lg): flex-col → mobile top-bar stacks ABOVE main content
         * Desktop (≥ lg): flex-row → sidebar sits to the LEFT of main content
         */
        <div className="flex flex-col lg:flex-row h-screen bg-background-light dark:bg-background-dark overflow-hidden relative">
            <Sidebar role={role} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
                {children}
            </main>

            {/* Global Toasts */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in ${t.type === 'ai' ? 'bg-indigo-900/90 border-indigo-500/50 text-white' : 'bg-emerald-900/90 border-emerald-500/50 text-white'}`}
                    >
                        <div className={`p-1.5 rounded-lg ${t.type === 'ai' ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
                            <span className="material-symbols-outlined text-[18px]">
                                {t.type === 'ai' ? 'psychiatry' : 'person_add'}
                            </span>
                        </div>
                        <p className="text-sm font-medium">{t.msg}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
