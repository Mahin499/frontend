"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Video,
    CalendarDays,
    Clock,
    CalendarRange,
    Cpu,
    LogOut
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-64 flex flex-col h-full bg-surface-dark border-r border-border-dark flex-shrink-0">
            <div className="p-6 flex items-center gap-3 border-b border-border-dark">
                <div className="bg-primary/20 p-2 rounded-xl">
                    <span className="material-symbols-outlined text-primary">face</span>
                </div>
                <div>
                    <h1 className="text-white text-base font-bold">SmartAttend AI</h1>
                    <p className="text-slate-400 text-xs">Admin Console</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive("/dashboard")} />
                <NavLink href="/faculty" icon={<Users size={20} />} label="Faculty" active={isActive("/faculty")} />
                <NavLink href="/students" icon={<GraduationCap size={20} />} label="Students" active={isActive("/students")} />
                <NavLink href="/classes" icon={<BookOpen size={20} />} label="Classes" active={isActive("/classes")} />
                <NavLink href="/session" icon={<Video size={20} />} label="Live Session" active={isActive("/session")} />

                <div className="pt-2 mt-2 border-t border-border-dark">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reports</p>
                    <NavLink href="/reports/daily" icon={<CalendarDays size={20} />} label="Whole-Day" active={isActive("/reports/daily")} />
                    <NavLink href="/reports/period" icon={<Clock size={20} />} label="Period-Wise" active={isActive("/reports/period")} />
                    <NavLink href="/reports/monthly" icon={<CalendarRange size={20} />} label="Monthly" active={isActive("/reports/monthly")} />
                </div>

                <div className="pt-2 mt-2 border-t border-border-dark">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Systems</p>
                    <NavLink href="/ai-validation" icon={<Cpu size={20} />} label="AI Validation" active={isActive("/ai-validation")} />
                </div>
            </nav>

            <div className="p-4 border-t border-border-dark">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Logout</span>
                </Link>
            </div>
        </aside>
    );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    if (active) {
        return (
            <Link href={href} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/20 text-primary">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </Link>
        );
    }

    return (
        <Link href={href} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}
