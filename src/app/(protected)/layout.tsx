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

    useEffect(() => {
        const insforge = getInsforgeClient();
        insforge.auth.getCurrentSession().then(({ data }) => {
            if (!data?.session) {
                router.replace("/login");
            } else {
                setChecking(false);
            }
        }).catch(() => {
            router.replace("/login");
        });
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
        <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Sidebar handles its own mobile/desktop rendering */}
            <Sidebar />
            {/* Main content area — on mobile the sidebar is overlaid, so we use full width */}
            <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
                {children}
            </main>
        </div>
    );
}
