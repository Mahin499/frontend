import Link from "next/link";
import { Search, Bell } from "lucide-react";

export default function Header() {
    return (
        <header className="h-20 px-8 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex-shrink-0 z-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back to SmartAttend AI.</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white w-64 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Search students, faculty..."
                        type="text"
                    />
                </div>

                <Link href="/notifications" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
                </Link>

                <div className="flex items-center gap-4 pl-6 border-l border-border-light dark:border-border-dark">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Admin Console</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated User</p>
                    </div>
                    {/* Placeholder for future custom user profile menu */}
                    <div className="h-9 w-9 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
                        A
                    </div>
                </div>
            </div>
        </header>
    );
}
