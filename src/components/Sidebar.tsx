"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Video,
    CalendarDays,
    Clock,
    CalendarRange,
    CalendarCheck,
    Settings2,
    Cpu,
    LogOut,
    Menu,
    X,
    Bell
} from "lucide-react";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/faculty", icon: Users, label: "Faculty" },
    { href: "/students", icon: GraduationCap, label: "Students" },
    { href: "/classes", icon: BookOpen, label: "Classes" },
    { href: "/live-session", icon: Video, label: "Live Session" },
    { href: "/meetings", icon: CalendarCheck, label: "Meetings" },
    { href: "/settings", icon: Settings2, label: "Settings" },
];

const reportItems = [
    { href: "/reports/whole-day", icon: CalendarDays, label: "Whole-Day" },
    { href: "/reports/period-wise", icon: Clock, label: "Period-Wise" },
    { href: "/reports/monthly", icon: CalendarRange, label: "Monthly" },
];

const aiItems = [
    { href: "/ai-validation", icon: Cpu, label: "AI Validation" },
];

// ─── Desktop Sidebar ────────────────────────────────────────────────────────
export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    return (
        <>
            {/* ── Mobile Top Bar ── */}
            <div className="lg:hidden w-full flex items-center justify-between px-4 h-14 bg-[#111418] border-b border-white/8 z-30 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-primary text-[18px]">face</span>
                    </div>
                    <span className="text-white font-bold text-sm">SmartAttend AI</span>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/notifications" className="p-2 text-slate-400">
                        <Bell size={20} />
                    </Link>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 text-slate-400 hover:text-white"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {/* ── Mobile Drawer Overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Mobile Slide-in Drawer ── */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-[#111418] border-r border-white/8 z-50 flex flex-col transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-5 flex items-center justify-between border-b border-white/8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <span className="material-symbols-outlined text-primary">face</span>
                        </div>
                        <div>
                            <h1 className="text-white text-base font-bold">SmartAttend AI</h1>
                            <p className="text-slate-400 text-xs">Admin Console</p>
                        </div>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink key={item.href} href={item.href} icon={<item.icon size={20} />} label={item.label} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
                    ))}
                    <div className="pt-2 mt-2 border-t border-white/8">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reports</p>
                        {reportItems.map(item => (
                            <NavLink key={item.href} href={item.href} icon={<item.icon size={20} />} label={item.label} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
                        ))}
                    </div>
                    <div className="pt-2 mt-2 border-t border-white/8">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Systems</p>
                        {aiItems.map(item => (
                            <NavLink key={item.href} href={item.href} icon={<item.icon size={20} />} label={item.label} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/8">
                    <Link
                        href="/"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Logout</span>
                    </Link>
                </div>
            </aside>

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex w-64 flex-col h-full bg-surface-dark border-r border-border-dark flex-shrink-0">
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
                    {navItems.map(item => (
                        <NavLink key={item.href} href={item.href} icon={<item.icon size={20} />} label={item.label} active={isActive(item.href)} />
                    ))}
                    <div className="pt-2 mt-2 border-t border-border-dark">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reports</p>
                        {reportItems.map(item => (
                            <NavLink key={item.href} href={item.href} icon={<item.icon size={20} />} label={item.label} active={isActive(item.href)} />
                        ))}
                    </div>
                    <div className="pt-2 mt-2 border-t border-border-dark">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Systems</p>
                        {aiItems.map(item => (
                            <NavLink key={item.href} href={item.href} icon={<item.icon size={20} />} label={item.label} active={isActive(item.href)} />
                        ))}
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
        </>
    );
}

function NavLink({ href, icon, label, active, onClick }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick?: () => void;
}) {
    if (active) {
        return (
            <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/20 text-primary">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </Link>
        );
    }
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}
