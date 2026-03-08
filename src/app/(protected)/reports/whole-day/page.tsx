"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Download, Search, CalendarDays, Filter, ChevronLeft, ChevronRight, FileSpreadsheet, CheckCircle2, X } from "lucide-react";
import { getInsforgeClient } from "@/utils/insforge/client";

const STATUS_STYLE: Record<string, string> = {
    Present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    Absent: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400",
    Late: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400",
};

const PER_PAGE = 6;

export default function DailyReportPage() {
    const [allData, setAllData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [dept, setDept] = useState("All Departments");
    const [statusFilter, setStatusFilter] = useState("All");
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

    useEffect(() => {
        const client = getInsforgeClient();
        const fetchData = async () => {
            const { data, error } = await (client as any).database
                .from('attendance')
                .select(`
                    id,
                    status,
                    marked_at,
                    session_date,
                    students ( name, register_number ),
                    classes ( name, section, department )
                `)
                .eq('session_date', date);

            if (!error && data) {
                const formatted = data.map((d: any) => ({
                    id: d.id,
                    name: d.students?.name || 'Unknown',
                    reg: d.students?.register_number || 'Unknown',
                    class: d.classes?.name || 'Unknown',
                    sem: d.classes?.section ? `Section ${d.classes.section}` : '',
                    dept: d.classes?.department || 'Unknown',
                    status: d.status.charAt(0).toUpperCase() + d.status.slice(1),
                    first: new Date(d.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    last: new Date(d.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }));
                // Try to merge multiple periods for the same student
                const mergedMap = new Map();
                formatted.forEach((f: any) => {
                    if (mergedMap.has(f.reg)) {
                        const existing = mergedMap.get(f.reg);
                        existing.last = f.last; // Assuming ordered chronologically somewhat... Ideally we sort it.
                    } else {
                        mergedMap.set(f.reg, f);
                    }
                });
                setAllData(Array.from(mergedMap.values()));
            }
        };
        fetchData();
    }, [date]);

    const filtered = useMemo(() => allData.filter(s => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.reg.includes(search)) return false;
        if (statusFilter !== "All" && s.status !== statusFilter) return false;
        if (dept !== "All Departments" && (!s.dept || !s.dept.includes(dept))) return false;
        return true;
    }), [allData, search, statusFilter, dept]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const stats = {
        present: filtered.filter(s => s.status === "Present").length,
        absent: filtered.filter(s => s.status === "Absent").length,
        late: filtered.filter(s => s.status === "Late").length,
    };

    const handleExport = (type: string) => showToast(`📥 Exporting ${type}... (demo mode)`);

    return (
        <div className="flex-1 overflow-y-auto w-full relative">
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl shadow-2xl">{toast}</div>
            )}
            <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 pb-20">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span>
                            <span className="text-slate-900 dark:text-white font-medium">Whole-Day Report</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Whole-Day Attendance Report</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Aggregated daily view across all departments and classes</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleExport("PDF")} className="flex items-center gap-2 px-4 py-2 border border-border-light dark:border-slate-700 rounded-lg text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm">
                            <Download size={16} /> Export PDF
                        </button>
                        <button onClick={() => handleExport("Excel")} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
                            <FileSpreadsheet size={16} /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Present", count: stats.present, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                        { label: "Absent", count: stats.absent, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
                        { label: "Late", count: stats.late, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border-light dark:border-border-dark`}>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
                            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.count}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[160px]">
                            <label className="label-xs block mb-1.5">Date</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="field-input pl-9" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="label-xs block mb-1.5">Department</label>
                            <select value={dept} onChange={e => { setDept(e.target.value); setPage(1); }} className="field-input cursor-pointer">
                                <option>All Departments</option>
                                <option>Computer Science</option>
                                <option>Electronics</option>
                                <option>Mechanical</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="label-xs block mb-1.5">Status</label>
                            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="field-input cursor-pointer">
                                <option>All</option>
                                <option>Present</option>
                                <option>Absent</option>
                                <option>Late</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="label-xs block mb-1.5">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name or Reg No."
                                    className="field-input pl-9" />
                            </div>
                        </div>
                        <button onClick={() => { setSearch(""); setStatusFilter("All"); setDept("All Departments"); setPage(1); }}
                            className="px-4 py-2.5 border border-border-light dark:border-slate-700 rounded-xl text-slate-400 hover:text-red-400 text-sm font-semibold transition-colors flex items-center gap-1.5 h-[42px]">
                            <X size={14} /> Clear
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-border-light dark:border-slate-700">
                                <tr>
                                    {["Student", "Class / Sem", "Status", "First Seen", "Last Seen"].map(h => (
                                        <th key={h} className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-slate-700/50">
                                {pageData.length === 0 ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-slate-400">No records match your filter</td></tr>
                                ) : pageData.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 font-mono">{s.reg}</div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{s.class} · <span className="text-xs text-slate-400">{s.sem}</span></td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{s.first}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{s.last}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border-light dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} students</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"><ChevronLeft size={18} /></button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${page === i + 1 ? "bg-primary text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{i + 1}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1.5 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
