"use client";

import Link from "next/link";
import { Filter, CheckCircle2, User, AlertTriangle, Sparkles, Brain, Clock, HelpCircle, X, Search } from "lucide-react";

export default function AIValidationPage() {
    return (
        <div className="flex-1 overflow-y-auto w-full bg-background-light dark:bg-background-dark">
            <div className="p-6 md:p-8 max-w-[1400px] mx-auto flex flex-col gap-8 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span><span className="text-slate-900 dark:text-white font-medium">AI Validation Queue</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Anomaly & Engagement Panel</h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm leading-relaxed">
                            Review low-confidence detections flagged by Face Recognition. Includes real-time liveness checks and engagement analysis powered by Gemini AI.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-light dark:bg-slate-800 text-slate-700 dark:text-white border border-border-light dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm">
                            <Filter size={18} /> Filter
                        </button>
                        <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors text-sm font-bold shadow-sm">
                            <CheckCircle2 size={18} /> Approve All High Confidence
                        </button>
                    </div>
                </div>

                {/* AI Stats KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard icon={<User size={20} />} title="Total Scans Today" value="1,245" trend="+12%" color="emerald" />
                    <StatCard icon={<AlertTriangle size={20} />} title="Flagged Anomalies" value="32" trend="+2%" color="orange" />
                    <StatCard icon={<Sparkles size={20} />} title="Auto-Verified by AI" value="24" trend="+5%" color="emerald" />
                    <StatCard icon={<Brain size={20} />} title="Avg. Engagement" value="87%" trend="-3%" color="red" />
                    <StatCard icon={<Clock size={20} />} title="Pending Review" value="8" trend="-10%" color="emerald" />
                </div>

                {/* Validation Queue Table */}
                <div className="border border-border-light dark:border-slate-700/50 rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark shadow-sm flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-slate-700/50">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[240px]">Student Identity</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[160px]">Comparison</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[140px]">Confidence</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gemini AI Analysis & Engagement</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[180px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-slate-700/50">

                                {/* Row 1 - Verified Match */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 dark:text-white font-bold text-sm">Rahul Sharma</span>
                                            <span className="text-slate-500 dark:text-slate-400 text-xs">Class 10-A &bull; ID: #9821</span>
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 dark:border-slate-700 w-fit px-2 py-0.5 rounded text-nowrap">
                                                <Clock size={12} /> 08:42 AM Today
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-1 ring-border-light dark:ring-slate-700 overflow-hidden relative text-xs font-bold text-slate-400">
                                                SRC
                                            </div>
                                            <Search size={14} className="text-slate-400 shrink-0" />
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-1 ring-primary/50 overflow-hidden relative text-xs font-bold text-slate-400">
                                                DB
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-1 max-w-[80px]">
                                                <div className="h-full bg-yellow-500 w-[82%]"></div>
                                            </div>
                                            <span className="text-yellow-600 dark:text-yellow-500 text-xs font-bold">82%</span>
                                        </div>
                                        <span className="text-slate-500 text-[10px] mt-1 block font-medium">Threshold: 85%</span>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge color="emerald" icon={<CheckCircle2 size={12} />} text="Attentive" />
                                                <Badge color="blue" icon={<Sparkles size={12} />} text="Verified Match" />
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
                                                Low lighting detected. Facial landmarks align despite shadow. Subject is maintaining direct eye contact with high alertness score.
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Reject">
                                                <X size={18} />
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors shadow-sm">
                                                <CheckCircle2 size={14} /> Confirm
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Row 2 - Anomaly / Drowsy */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-red-50/30 dark:bg-red-900/5">
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 dark:text-white font-bold text-sm">Anjali Gupta</span>
                                            <span className="text-slate-500 dark:text-slate-400 text-xs">Class 12-B &bull; ID: #9845</span>
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 dark:border-slate-700 w-fit px-2 py-0.5 rounded text-nowrap">
                                                <Clock size={12} /> 08:45 AM Today
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-1 ring-border-light dark:ring-slate-700 overflow-hidden relative text-xs font-bold text-slate-400">
                                                SRC
                                            </div>
                                            <Search size={14} className="text-slate-400 shrink-0" />
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-1 ring-primary/50 overflow-hidden relative text-xs font-bold text-slate-400">
                                                DB
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-1 max-w-[80px]">
                                                <div className="h-full bg-red-500 w-[60%]"></div>
                                            </div>
                                            <span className="text-red-600 dark:text-red-500 text-xs font-bold">60%</span>
                                        </div>
                                        <span className="text-slate-500 text-[10px] mt-1 block font-medium">Critical Low</span>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge color="indigo" icon={<AlertTriangle size={12} />} text="Drowsy Detected" />
                                                <Badge color="orange" icon={<AlertTriangle size={12} />} text="Anomaly Detected" />
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
                                                Significant occlusion detected (likely medical mask). Eyelid closure rate suggests drowsiness or fatigue.
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Reject">
                                                <X size={18} />
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold transition-colors shadow-sm">
                                                <HelpCircle size={14} /> Investigate
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Row 3 - Distracted */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 dark:text-white font-bold text-sm">Vikram Singh</span>
                                            <span className="text-slate-500 dark:text-slate-400 text-xs">Class 11-A &bull; ID: #9112</span>
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 dark:border-slate-700 w-fit px-2 py-0.5 rounded text-nowrap">
                                                <Clock size={12} /> 09:05 AM Today
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-1 ring-border-light dark:ring-slate-700 overflow-hidden relative text-xs font-bold text-slate-400">
                                                SRC
                                            </div>
                                            <Search size={14} className="text-slate-400 shrink-0" />
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-1 ring-primary/50 overflow-hidden relative text-xs font-bold text-slate-400">
                                                DB
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-1 max-w-[80px]">
                                                <div className="h-full bg-emerald-500 w-[88%]"></div>
                                            </div>
                                            <span className="text-emerald-600 dark:text-emerald-500 text-xs font-bold">88%</span>
                                        </div>
                                        <span className="text-slate-500 text-[10px] mt-1 block font-medium">Medium</span>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge color="slate" icon={<AlertTriangle size={12} />} text="Distracted" />
                                                <Badge color="blue" icon={<Sparkles size={12} />} text="Verified Match" />
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
                                                Angle deviation detected (side profile). Key landmarks aligned. Gaze vector suggests distraction towards window.
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top text-right">
                                        <div className="flex justify-end gap-2">
                                            <span className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 cursor-default" title="Verified">
                                                <CheckCircle2 size={18} />
                                            </span>
                                        </div>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-border-light dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/20 p-4 flex items-center justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-900 dark:text-white">1-3</span> of <span className="font-bold text-slate-900 dark:text-white">8</span> pending items
                        </p>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1.5 rounded border border-border-light dark:border-slate-700 text-slate-400 text-xs font-medium disabled:opacity-50">Previous</button>
                            <button className="px-3 py-1.5 rounded border border-border-light dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Next</button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-2">
                    <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                        <Sparkles size={14} className="text-primary" /> Authenticated by Google Gemini Pro Vision &bull; Data Encrypted AES-256
                    </p>
                </div>

            </div>
        </div>
    );
}

// Helper Components
function StatCard({ icon, title, value, trend, color }: { icon: any, title: string, value: string, trend: string, color: string }) {
    const colorMap: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10",
        orange: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10",
        red: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-400/10"
    };

    return (
        <div className="p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-700/50 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {icon}
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${colorMap[color]}`}>{trend}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <p className="text-slate-900 dark:text-white text-2xl font-black mt-1 leading-none">{value}</p>
        </div>
    );
}

function Badge({ color, icon, text }: { color: string, icon: any, text: string }) {
    const badgeColors: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-primary/10 dark:text-primary dark:border-primary/20",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
        orange: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
        slate: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    };

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold ${badgeColors[color]}`}>
            {icon} {text}
        </div>
    )
}
