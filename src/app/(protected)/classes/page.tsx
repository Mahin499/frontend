"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search, Plus, X, Users, BookOpen, Pencil, Trash2, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { fetchClasses, createClass, updateClass, deleteClass, Class } from "@/utils/insforge/client";

type ModalMode = "create" | "edit" | null;

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

export default function ClassesManagementPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("");

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [formName, setFormName] = useState("");
    const [formDept, setFormDept] = useState(DEPARTMENTS[0]);
    const [formSection, setFormSection] = useState("");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Delete confirm
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = () => {
        setLoading(true);
        fetchClasses()
            .then(setClasses)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const openCreate = () => {
        setFormName(""); setFormDept(DEPARTMENTS[0]); setFormSection(""); setMsg(null);
        setEditingClass(null);
        setModalMode("create");
    };

    const openEdit = (cls: Class) => {
        setFormName(cls.name); setFormDept(cls.department); setFormSection(cls.section || ""); setMsg(null);
        setEditingClass(cls);
        setModalMode("edit");
    };

    const closeModal = () => { setModalMode(null); setEditingClass(null); setMsg(null); };

    const handleSave = async () => {
        if (!formName.trim() || !formDept.trim()) {
            setMsg({ type: "error", text: "Class name and department are required." });
            return;
        }
        setSaving(true);
        setMsg(null);
        try {
            if (modalMode === "create") {
                const created = await createClass({ name: formName.trim(), department: formDept, section: formSection.trim() || undefined });
                setClasses(prev => [...prev, created]);
                setMsg({ type: "success", text: `✅ Class "${formName}" created!` });
            } else if (modalMode === "edit" && editingClass) {
                await updateClass(editingClass.id, { name: formName.trim(), department: formDept, section: formSection.trim() || undefined });
                setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, name: formName.trim(), department: formDept, section: formSection.trim() || null } : c));
                setMsg({ type: "success", text: `✅ Class updated!` });
            }
            setTimeout(closeModal, 1000);
        } catch (e: any) {
            setMsg({ type: "error", text: e.message || "Failed to save. Try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (classId: string) => {
        setDeleting(true);
        try {
            await deleteClass(classId);
            setClasses(prev => prev.filter(c => c.id !== classId));
            setDeletingId(null);
        } catch (e: any) {
            alert(e.message || "Failed to delete class.");
        } finally {
            setDeleting(false);
        }
    };

    const filtered = classes.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.department.toLowerCase().includes(search.toLowerCase());
        const matchDept = !filterDept || c.department === filterDept;
        return matchSearch && matchDept;
    });

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background-light dark:bg-background-dark">
            <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span>
                            <span className="text-slate-900 dark:text-white">Classes</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Class Management</h1>
                        <p className="text-slate-500 mt-1">Create, edit, and manage your classes</p>
                    </div>
                    <button onClick={openCreate} className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
                        <Plus size={20} /> New Class
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search classes..." className="w-full pl-10 pr-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-slate-400" />
                    </div>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                        className="px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-slate-700 dark:text-slate-300 text-sm focus:outline-none cursor-pointer min-w-[150px]">
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>

                {/* Classes Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(cls => (
                            <div key={cls.id} className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                        <BookOpen className="text-primary" size={22} />
                                    </div>
                                    {/* Edit / Delete buttons */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEdit(cls)}
                                            title="Edit class"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(cls.id)}
                                            title="Delete class"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{cls.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                    {cls.department}{cls.section ? ` • ${cls.section}` : ""}
                                </p>

                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-light dark:border-border-dark">
                                    <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                                        <Users className="text-violet-600 dark:text-violet-400" size={14} />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: <span className="font-mono text-slate-700 dark:text-slate-300">{cls.id.slice(0, 8)}...</span></p>
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
                        ))}

                        {/* Add New Class Card */}
                        <button onClick={openCreate} className="bg-surface-light dark:bg-surface-dark border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all min-h-[200px]">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Plus className="text-slate-400 group-hover:text-primary transition-colors" size={32} />
                            </div>
                            <p className="text-slate-600 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white font-semibold transition-colors">Add New Class</p>
                        </button>
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ── */}
            {modalMode && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                {modalMode === "create" ? "Create New Class" : "Edit Class"}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {msg && (
                            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${msg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                                {msg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                                {msg.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Name *</span>
                                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                                    placeholder="e.g. CS-Batch-2026-A"
                                    className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department *</span>
                                    <select value={formDept} onChange={e => setFormDept(e.target.value)}
                                        className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Semester</span>
                                    <select value={formSection} onChange={e => setFormSection(e.target.value)}
                                        className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                                        <option value="">None</option>
                                        {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={closeModal} className="flex-1 py-3 border border-border-dark text-slate-400 hover:text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {saving ? "Saving..." : modalMode === "create" ? "Create Class" : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation ── */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-light dark:bg-surface-dark border border-red-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-400" size={26} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Delete Class?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            This will permanently delete the class and cannot be undone. Students in this class will not be deleted.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-border-dark text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deletingId)} disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
