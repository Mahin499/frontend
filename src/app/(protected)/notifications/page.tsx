"use client";

import Link from "next/link";
import { BellRing, Check, Info, AlertTriangle, UserPlus, Clock } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="flex-1 overflow-y-auto w-full bg-background-light dark:bg-background-dark">
            <div className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-6 pb-20">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span><span className="text-slate-900 dark:text-white font-medium">Notifications</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Notifications Center</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Review alerts, reports, and system messages</p>
                    </div>
                    <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-lg">
                        Mark all as read
                    </button>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm flex flex-col mt-4">
                    <div className="divide-y divide-border-light dark:divide-slate-700/50">

                        {/* Notification 1: Alert */}
                        <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors flex gap-4 items-start relative bg-red-50/30 dark:bg-red-900/5">
                            <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">AI Anomaly Flagged</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Low engagement and drowsy detection flagged 7 students in Class 12-B.</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> 10 mins ago</span>
                                    <Link href="/ai-validation" className="text-xs font-bold text-primary hover:underline">Review AI queue &rarr;</Link>
                                </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-primary absolute top-5 right-5"></div>
                        </div>

                        {/* Notification 2: System */}
                        <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors flex gap-4 items-start relative">
                            <div className="p-2.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Check size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Attendance Sync Complete</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Live session for CS-Batch-2024-A synced successfully with InsForge Database.</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> 1 hour ago</span>
                                    <Link href="/reports/period-wise" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors hover:underline">View report</Link>
                                </div>
                            </div>
                        </div>

                        {/* Notification 3: Info */}
                        <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors flex gap-4 items-start relative">
                            <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                                <UserPlus size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Bulk Upload Processing</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">45 student face encodings have been successfully trained and added to your roster.</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> 3 hours ago</span>
                                    <Link href="/students" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors hover:underline">View students</Link>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="p-4 border-t border-border-light dark:border-slate-700/50 flex justify-center bg-slate-50 dark:bg-slate-800/20">
                        <button className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Load Older Notifications</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
