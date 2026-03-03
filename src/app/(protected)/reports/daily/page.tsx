"use client";

import Link from "next/link";
import { Download, Search, CalendarDays, Filter, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";

export default function DailyReportPage() {
    return (
        <div className="flex-1 overflow-y-auto w-full bg-background-light dark:bg-background-dark">
            <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 pb-20">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span><Link href="#" className="hover:text-primary">Reports</Link><span>/</span><span className="text-slate-900 dark:text-white font-medium">Whole-Day</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Whole-Day Attendance Report</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Aggregated daily view across all departments and classes</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-border-light dark:border-slate-700 rounded-lg text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm">
                            <Download size={18} /> Export PDF
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
                            <FileSpreadsheet size={18} /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-700/50 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Date</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input type="date" className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" defaultValue="2024-10-24" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Department</label>
                            <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none">
                                <option>All Departments</option>
                                <option>Computer Science</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input type="text" placeholder="Name or Reg No." className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold flex items-center justify-center min-w-[100px] h-[38px]">
                            <Filter size={16} className="mr-2" /> Apply
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-border-light dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class / Sem</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">First Seen</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Seen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-slate-700/50">
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">Rahul Sharma</div>
                                        <div className="text-xs text-slate-500 mt-0.5">CS2023-014</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">CS-Batch-A <br /><span className="text-xs text-slate-500">Sem 5</span></td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Present</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">08:45 AM</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">03:30 PM</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">Priya Patel</div>
                                        <div className="text-xs text-slate-500 mt-0.5">CS2023-088</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">CS-Batch-B <br /><span className="text-xs text-slate-500">Sem 5</span></td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400">Absent</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">-</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border-light dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Showing 1-2 of 205 students</span>
                        <div className="flex gap-1">
                            <button className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={20} /></button>
                            <button className="p-1 rounded text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
