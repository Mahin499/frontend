"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, X, Users, CheckCircle, Component, Hash, BookOpen, Clock, AlertCircle } from "lucide-react";

export default function ClassesManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-background-light dark:bg-background-dark">
            <div className="p-8 max-w-7xl mx-auto pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span><span className="text-slate-900 dark:text-white">Classes</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Class Management</h1>
                        <p className="text-slate-500 mt-1">Manage classes, assign faculty, and monitor per-class analytics</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
                        <Plus size={20} /> New Class
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm text-center">
                        <p className="text-3xl font-black text-slate-900 dark:text-white">12</p>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Total Classes</p>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm text-center">
                        <p className="text-3xl font-black text-slate-900 dark:text-white">1,240</p>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Total Students</p>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm text-center">
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">92%</p>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Avg. Attendance</p>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm text-center">
                        <p className="text-3xl font-black text-primary">4</p>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Departments</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                        <input type="text" placeholder="Search classes..." className="w-full pl-10 pr-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-slate-400 shadow-sm" />
                    </div>
                    <select className="px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none shadow-sm cursor-pointer min-w-[150px]">
                        <option>All Departments</option>
                        <option>Computer Science</option>
                        <option>Electronics</option>
                    </select>
                    <select className="px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none shadow-sm cursor-pointer min-w-[150px]">
                        <option>All Semesters</option>
                        <option>Sem 1</option>
                        <option>Sem 3</option>
                        <option>Sem 5</option>
                    </select>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    {/* Card: Active Class */}
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                <BookOpen className="text-primary text-2xl" />
                            </div>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20">Active</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">CS-Batch-2024-A</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Computer Science &bull; Semester 5</p>

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                            <div>
                                <p className="text-lg font-black text-slate-900 dark:text-white">42</p>
                                <p className="text-xs text-slate-500">Students</p>
                            </div>
                            <div>
                                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">93%</p>
                                <p className="text-xs text-slate-500">Att. Avg</p>
                            </div>
                            <div>
                                <p className="text-lg font-black text-primary">95%</p>
                                <p className="text-xs text-slate-500">Conf.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-light dark:border-border-dark">
                            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                                <Users className="text-violet-600 dark:text-violet-400 text-sm" size={14} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Assigned Faculty</p>
                                <p className="text-xs font-semibold text-slate-900 dark:text-white">Prof. Rajan Kumar</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <Link href="/reports/period" className="flex-1 py-2 text-center text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                                Report
                            </Link>
                            <Link href="/session" className="flex-1 py-2 text-center text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                                Take Att.
                            </Link>
                        </div>
                    </div>

                    {/* Add New Class Card */}
                    <div onClick={() => setIsModalOpen(true)} className="bg-surface-light dark:bg-surface-dark border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all min-h-[260px]">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                            <Plus className="text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" size={32} />
                        </div>
                        <p className="text-slate-600 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white font-semibold transition-colors">Add New Class</p>
                        <p className="text-xs text-slate-500 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">Click to create a class</p>
                    </div>
                </div>

            </div>

            {/* Add Class Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen overflow-y-auto">
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-md p-6 sm:p-8 m-auto relative shadow-2xl animate-in fade-in zoom-in duration-200">

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Create New Class</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Class Name</label>
                                <input type="text" placeholder="e.g. CS-Batch-2025-A" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1c2127] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                                    <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1c2127] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none shadow-sm cursor-pointer">
                                        <option>Computer Science</option>
                                        <option>Electronics</option>
                                        <option>Mechanical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Semester</label>
                                    <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1c2127] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none shadow-sm cursor-pointer">
                                        <option>Semester 1</option>
                                        <option>Semester 3</option>
                                        <option>Semester 5</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign Faculty</label>
                                <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1c2127] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none shadow-sm cursor-pointer">
                                    <option>Prof. Rajan Kumar</option>
                                    <option>Prof. Anita Menon</option>
                                    <option>Prof. Vikram Nair</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="button" className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20">Create Class</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
