"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Filter, CheckCircle2, User, AlertTriangle, Sparkles, Brain,
    Clock, HelpCircle, X, Search, Download, CheckCheck, Eye, EyeOff
} from "lucide-react";

type Status = "pending" | "confirmed" | "rejected" | "investigating";

interface ValidationItem {
    id: number;
    name: string;
    class: string;
    time: string;
    confidence: number;
    tags: string[];
    analysis: string;
    status: Status;
}

const INITIAL_ITEMS: ValidationItem[] = [
    { id: 1, name: "Rahul Sharma", class: "Class 10-A · ID: #9821", time: "08:42 AM Today", confidence: 82, tags: ["Attentive", "Verified Match"], analysis: "Low lighting detected. Facial landmarks align despite shadow. Subject is maintaining direct eye contact with high alertness score.", status: "pending" },
    { id: 2, name: "Anjali Gupta", class: "Class 12-B · ID: #9845", time: "08:45 AM Today", confidence: 60, tags: ["Drowsy Detected", "Anomaly Detected"], analysis: "Significant occlusion detected (likely medical mask). Eyelid closure rate suggests drowsiness or fatigue.", status: "pending" },
    { id: 3, name: "Vikram Singh", class: "Class 11-A · ID: #9112", time: "09:05 AM Today", confidence: 88, tags: ["Distracted", "Verified Match"], analysis: "Angle deviation detected (side profile). Key landmarks aligned. Gaze vector suggests distraction towards window.", status: "pending" },
    { id: 4, name: "Priya Nair", class: "Class 10-B · ID: #9220", time: "09:15 AM Today", confidence: 91, tags: ["Attentive", "Verified Match"], analysis: "High confidence match. Student appears fully engaged and attentive. All facial metrics within normal range.", status: "pending" },
    { id: 5, name: "Sanjay Kumar", class: "Class 11-B · ID: #9330", time: "09:22 AM Today", confidence: 55, tags: ["Anomaly Detected"], analysis: "Face partially obscured. Cannot confirm identity with sufficient confidence. Manual review required.", status: "pending" },
    { id: 6, name: "Meera Patel", class: "Class 12-A · ID: #9441", time: "09:35 AM Today", confidence: 94, tags: ["Attentive", "Verified Match"], analysis: "Excellent confidence match. Subject alert and engaged. No anomalies detected.", status: "pending" },
    { id: 7, name: "Arjun Das", class: "Class 10-C · ID: #9552", time: "09:40 AM Today", confidence: 72, tags: ["Distracted", "Low Confidence"], analysis: "Moderate confidence. Student appears distracted—gaze repeatedly shifts off-screen.", status: "pending" },
    { id: 8, name: "Kavya Reddy", class: "Class 12-C · ID: #9663", time: "09:48 AM Today", confidence: 49, tags: ["Drowsy Detected", "Critical Low"], analysis: "Very low confidence. Extreme drowsiness indicators. Possible identity mismatch. Urgent review needed.", status: "pending" },
];

const tagColors: Record<string, string> = {
    "Attentive": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    "Verified Match": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-primary/10 dark:text-primary dark:border-primary/20",
    "Drowsy Detected": "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    "Anomaly Detected": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    "Distracted": "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    "Low Confidence": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    "Critical Low": "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

function confidenceColor(c: number) {
    if (c >= 85) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
    if (c >= 70) return { bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400" };
    return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" };
}

const statusStyle: Record<Status, { bg: string; label: string }> = {
    pending: { bg: "", label: "" },
    confirmed: { bg: "bg-emerald-50/40 dark:bg-emerald-900/10", label: "✅ Confirmed" },
    rejected: { bg: "bg-red-50/40 dark:bg-red-900/10", label: "❌ Rejected" },
    investigating: { bg: "bg-amber-50/40 dark:bg-amber-900/10", label: "🔍 Investigating" },
};

export default function AIValidationPage() {
    const [items, setItems] = useState<ValidationItem[]>(INITIAL_ITEMS);
    const [search, setSearch] = useState("");
    const [filterTag, setFilterTag] = useState("All");
    const [showFilter, setShowFilter] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [hideProcessed, setHideProcessed] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 5;

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

    const update = (id: number, status: Status) =>
        setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));

    const approveAllHigh = () => {
        let count = 0;
        setItems(prev => prev.map(i => {
            if (i.confidence >= 85 && i.status === "pending") { count++; return { ...i, status: "confirmed" }; }
            return i;
        }));
        showToast(`✅ Approved ${count} high-confidence item(s)`);
    };

    const ALL_TAGS = ["All", "Attentive", "Drowsy Detected", "Anomaly Detected", "Distracted", "Verified Match"];

    const filtered = useMemo(() => items.filter(i => {
        if (hideProcessed && i.status !== "pending") return false;
        if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterTag !== "All" && !i.tags.includes(filterTag)) return false;
        return true;
    }), [items, search, filterTag, hideProcessed]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const pending = items.filter(i => i.status === "pending").length;

    return (
        <div className="flex-1 overflow-y-auto w-full bg-background-light dark:bg-background-dark relative">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl shadow-2xl animate-in slide-in-from-top-2">
                    {toast}
                </div>
            )}

            <div className="p-4 md:p-8 max-w-[1400px] mx-auto flex flex-col gap-6 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span>
                            <span className="text-slate-900 dark:text-white font-medium">AI Validation Queue</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Anomaly & Engagement Panel</h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm leading-relaxed mt-1">
                            Review low-confidence detections flagged by Face Recognition. Confirm, reject, or flag for investigation.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setShowFilter(!showFilter)}
                            className={`flex items-center gap-2 h-10 px-4 rounded-lg border transition-colors text-sm font-medium shadow-sm ${showFilter ? "bg-primary text-white border-primary" : "bg-surface-light dark:bg-slate-800 text-slate-700 dark:text-white border-border-light dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                            <Filter size={16} /> Filter {showFilter ? "▲" : "▼"}
                        </button>
                        <button onClick={() => { setHideProcessed(!hideProcessed); setPage(1); }}
                            className={`flex items-center gap-2 h-10 px-4 rounded-lg border transition-colors text-sm font-medium ${hideProcessed ? "bg-slate-800 text-white border-slate-600" : "bg-surface-light dark:bg-slate-800 text-slate-700 dark:text-white border-border-light dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                            {hideProcessed ? <Eye size={16} /> : <EyeOff size={16} />} {hideProcessed ? "Show All" : "Pending Only"}
                        </button>
                        <button onClick={approveAllHigh}
                            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors text-sm font-bold shadow-sm">
                            <CheckCheck size={16} /> Approve All High Confidence
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilter && (
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-4 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="label-xs block mb-1.5">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name..."
                                    className="field-input pl-9" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="label-xs block mb-1.5">Filter by Tag</label>
                            <div className="flex flex-wrap gap-1.5">
                                {ALL_TAGS.map(t => (
                                    <button key={t} onClick={() => { setFilterTag(t); setPage(1); }}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${filterTag === t ? "bg-primary text-white border-primary" : "border-border-dark text-slate-400 hover:text-white hover:border-slate-500"}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => { setSearch(""); setFilterTag("All"); setPage(1); }}
                            className="px-4 py-2 text-xs text-slate-400 hover:text-red-400 border border-border-dark rounded-lg transition-colors">
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* KPI Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                        { icon: <User size={20} />, title: "Total Scans Today", value: "1,245", trend: "+12%", color: "emerald" },
                        { icon: <AlertTriangle size={20} />, title: "Flagged Anomalies", value: String(items.filter(i => i.tags.some(t => t.includes("Anomaly"))).length), trend: "+2%", color: "orange" },
                        { icon: <Sparkles size={20} />, title: "Auto-Verified", value: String(items.filter(i => i.status === "confirmed").length), trend: "+5%", color: "emerald" },
                        { icon: <Brain size={20} />, title: "Avg. Engagement", value: "87%", trend: "-3%", color: "red" },
                        { icon: <Clock size={20} />, title: "Pending Review", value: String(pending), trend: `${pending} left`, color: pending > 0 ? "orange" : "emerald" },
                    ].map(s => (
                        <div key={s.title} className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{s.icon}</div>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : s.color === "orange" ? "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"}`}>{s.trend}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{s.title}</p>
                            <p className="text-slate-900 dark:text-white text-2xl font-black mt-1">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Validation Table */}
                <div className="border border-border-light dark:border-slate-700/50 rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-slate-700/50">
                                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">Student</th>
                                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">Confidence</th>
                                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis & Tags</th>
                                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[180px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-slate-700/50">
                                {pageItems.length === 0 ? (
                                    <tr><td colSpan={4} className="py-16 text-center text-slate-400 text-sm">No items match your filter</td></tr>
                                ) : pageItems.map(item => {
                                    const cc = confidenceColor(item.confidence);
                                    const ss = statusStyle[item.status];
                                    return (
                                        <tr key={item.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${ss.bg}`}>
                                            <td className="py-4 px-5 align-top">
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{item.class}</div>
                                                <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 w-fit px-2 py-0.5 rounded">
                                                    <Clock size={10} /> {item.time}
                                                </div>
                                                {item.status !== "pending" && (
                                                    <div className="mt-1.5 text-xs font-semibold text-slate-500">{ss.label}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-5 align-top">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`h-full ${cc.bar} rounded-full`} style={{ width: `${item.confidence}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${cc.text}`}>{item.confidence}%</span>
                                                </div>
                                                <span className="text-slate-500 text-[10px] mt-1 block">Threshold: 85%</span>
                                            </td>
                                            <td className="py-4 px-5 align-top">
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {item.tags.map(t => (
                                                        <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${tagColors[t] || tagColors["Distracted"]}`}>
                                                            {t.includes("Anomaly") || t.includes("Drowsy") ? <AlertTriangle size={10} /> : t === "Verified Match" ? <Sparkles size={10} /> : t === "Attentive" ? <CheckCircle2 size={10} /> : null}
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">{item.analysis}</p>
                                            </td>
                                            <td className="py-4 px-5 align-top text-right">
                                                {item.status === "pending" ? (
                                                    <div className="flex justify-end gap-1.5 flex-wrap">
                                                        <button title="Reject" onClick={() => { update(item.id, "rejected"); showToast(`❌ Rejected: ${item.name}`); }}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                        {item.confidence < 75 && (
                                                            <button onClick={() => { update(item.id, "investigating"); showToast(`🔍 Flagged for investigation: ${item.name}`); }}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 text-amber-700 dark:text-amber-400 text-xs font-bold transition-colors">
                                                                <HelpCircle size={13} /> Investigate
                                                            </button>
                                                        )}
                                                        <button onClick={() => { update(item.id, "confirmed"); showToast(`✅ Confirmed: ${item.name}`); }}
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors shadow-sm">
                                                            <CheckCircle2 size={13} /> Confirm
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => update(item.id, "pending")}
                                                        className="text-xs text-slate-400 hover:text-primary hover:underline transition-colors">
                                                        Reset
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-border-light dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/20 p-4 flex items-center justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> items
                            {pending > 0 && <span className="ml-2 text-amber-500 font-semibold">· {pending} pending</span>}
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 rounded border border-border-light dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)}
                                    className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${page === i + 1 ? "bg-primary text-white border-primary" : "border-border-light dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>{i + 1}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 rounded border border-border-light dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                        <Sparkles size={14} className="text-primary" /> Authenticated by Gemini AI · Data Encrypted AES-256
                    </p>
                </div>
            </div>
        </div>
    );
}
