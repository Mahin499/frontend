"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, CheckCircle, Moon, BookOpen, Video, Clock, UserPlus,
    Eye, Meh, EyeOff, ArrowRight, CheckCircle2, XCircle, Loader2, AlertCircle
} from "lucide-react";
import { getInsforgeClient } from "@/utils/insforge/client";

interface FacultyApproval {
    id: string;
    faculty_name: string;
    faculty_email: string;
    department: string | null;
    subject: string | null;
    status: string;
    note: string | null;
    submitted_at: string;
}

const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    approved: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    rejected: "bg-red-500/10 border-red-500/20 text-red-400",
};

export default function FacultyDashboardPage() {
    const [approvals, setApprovals] = useState<FacultyApproval[]>([]);
    const [loadingApp, setLoadingApp] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

    const client = getInsforgeClient();

    useEffect(() => {
        (client as any).db.from("faculty_approvals").select("*").order("submitted_at", { ascending: false })
            .then(({ data, error }: any) => { if (!error) setApprovals(data || []); })
            .finally(() => setLoadingApp(false));
    }, []);

    const updateStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
        setUpdatingId(id);
        try {
            await (client as any).db.from("faculty_approvals").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
            setApprovals(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        } finally { setUpdatingId(null); }
    };

    const filtered = approvals.filter(a => filterStatus === "all" || a.status === filterStatus);
    const pendingCount = approvals.filter(a => a.status === "pending").length;

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* KPI Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-primary/20 rounded-xl text-primary"><Users size={24} /></div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 px-2 py-0.5 rounded">+3</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">My Students</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">128</h3>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400"><CheckCircle size={24} /></div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 px-2 py-0.5 rounded">+1.2%</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Today&apos;s Avg Attendance</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">89%</h3>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400"><Moon size={24} /></div>
                            <span className="text-xs font-bold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-400/10 px-2 py-0.5 rounded">Alert</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Drowsy Detections</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">7</h3>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        {pendingCount > 0 && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold animate-pulse">{pendingCount}</div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400"><BookOpen size={24} /></div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Pending Approvals</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{pendingCount}</h3>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Assigned Classes + Chart */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Chart Placeholder */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance Trend — This Week</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">CS-Batch-2024-A &bull; Computer Science</p>
                                </div>
                                <select className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2 border-none focus:ring-2 focus:ring-primary outline-none">
                                    <option>CS-Batch-2024-A</option>
                                    <option>CS-Batch-2024-B</option>
                                </select>
                            </div>
                            <div className="h-48 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400 text-sm font-medium">Chart Visualization Placeholder</p>
                            </div>
                        </div>

                        {/* ── Faculty Approval Panel ── */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex flex-wrap justify-between items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Faculty Approvals</h3>
                                    {pendingCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">{pendingCount} pending</span>
                                    )}
                                </div>
                                <div className="flex gap-1.5">
                                    {(["all", "pending", "approved", "rejected"] as const).map(s => (
                                        <button key={s} onClick={() => setFilterStatus(s)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${filterStatus === s ? "bg-primary text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loadingApp ? (
                                <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No {filterStatus === "all" ? "" : filterStatus} faculty requests</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border-light dark:divide-border-dark">
                                    {filtered.map(a => (
                                        <div key={a.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <div className="flex flex-wrap justify-between items-start gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{a.faculty_name}</p>
                                                        <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${statusColors[a.status]}`}>{a.status}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">{a.faculty_email}</p>
                                                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                                        {a.department && <span>{a.department}</span>}
                                                        {a.subject && <span>· {a.subject}</span>}
                                                    </div>
                                                </div>
                                                {a.status === "pending" && (
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => updateStatus(a.id, "approved")}
                                                            disabled={updatingId === a.id}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {updatingId === a.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(a.id, "rejected")}
                                                            disabled={updatingId === a.id}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {updatingId === a.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {a.status !== "pending" && (
                                                    <button
                                                        onClick={() => updateStatus(a.id, "pending")}
                                                        disabled={updatingId === a.id}
                                                        className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                                                    >
                                                        <AlertCircle size={11} /> Reset to Pending
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My Classes Table */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Assigned Classes</h3>
                                <Link href="/classes" className="text-primary text-sm font-medium hover:underline">View All</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/40">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Att.</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 dark:text-white text-sm">CS-Batch-2024-A</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">Computer Science · Sem 5</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">42</td>
                                            <td className="px-6 py-4"><span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">91%</span></td>
                                            <td className="px-6 py-4">
                                                <Link href="/session" className="inline-flex px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors">Take Attendance</Link>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 dark:text-white text-sm">CS-Batch-2024-B</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">Computer Science · Sem 5</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">38</td>
                                            <td className="px-6 py-4"><span className="text-amber-600 dark:text-amber-400 font-bold text-sm">78%</span></td>
                                            <td className="px-6 py-4">
                                                <Link href="/session" className="inline-flex px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors">Take Attendance</Link>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Analytics + Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">AI Attention Monitor</h3>
                                <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                                </span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "Attentive Students", pct: 78, color: "bg-emerald-500", Icon: Eye, cls: "text-emerald-600 dark:text-emerald-400" },
                                    { label: "Distracted", pct: 15, color: "bg-amber-500", Icon: Meh, cls: "text-amber-500" },
                                    { label: "Drowsy / Sleeping", pct: 7, color: "bg-indigo-500", Icon: EyeOff, cls: "text-indigo-600 dark:text-indigo-400", valueCls: "text-red-600 dark:text-red-400" },
                                ].map(s => (
                                    <div key={s.label}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2"><s.Icon className={s.cls} size={16} /><span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{s.label}</span></div>
                                            <span className={`font-bold text-slate-900 dark:text-white ${s.valueCls || ""}`}>{s.pct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold mb-1">⚠ Sleep Detection Alert</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">7 students flagged as drowsy. Review AI Validation Queue.</p>
                                    <Link href="/ai-validation" className="inline-flex mt-2 text-xs text-primary font-semibold hover:underline items-center gap-1">View Details <ArrowRight size={12} /></Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="/session" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><Video size={18} /></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-white transition-colors">Start Live Attendance</span>
                                </Link>
                                <Link href="/reports/period" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"><Clock size={18} /></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-white transition-colors">Period-Wise Report</span>
                                </Link>
                                <Link href="/students" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"><UserPlus size={18} /></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-white transition-colors">Add New Student</span>
                                </Link>
                                <Link href="/meetings" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"><Users size={18} /></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">View Meetings</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
