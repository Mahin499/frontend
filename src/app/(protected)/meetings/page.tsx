"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus, X, Video, Calendar, Clock, Link2, Pencil, Trash2,
    Loader2, CheckCircle2, AlertCircle, ExternalLink, Copy, Check,
    Users, Globe
} from "lucide-react";
import { getInsforgeClient } from "@/utils/insforge/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Meeting {
    id: string;
    title: string;
    description: string | null;
    meeting_type: string;
    meeting_link: string | null;
    scheduled_at: string;
    ends_at: string | null;
    created_by_role: string;
    status: string;
    invited_roles: string[];
    created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MEETING_TYPES = [
    { value: "gmeet", label: "Google Meet", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { value: "zoom", label: "Zoom", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
    { value: "teams", label: "Microsoft Teams", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { value: "other", label: "Other Link", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
];

const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
    upcoming: { label: "Upcoming", classes: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    live: { label: "🔴 Live Now", classes: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse", dot: "bg-red-400" },
    completed: { label: "Completed", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    cancelled: { label: "Cancelled", classes: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-400" },
};

function getMeetingTypeInfo(type: string) {
    return MEETING_TYPES.find(t => t.value === type) || MEETING_TYPES[3];
}

function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Modal
    const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
    const [editing, setEditing] = useState<Meeting | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form fields
    const [fTitle, setFTitle] = useState("");
    const [fDesc, setFDesc] = useState("");
    const [fType, setFType] = useState("gmeet");
    const [fLink, setFLink] = useState("");
    const [fDate, setFDate] = useState("");
    const [fEnds, setFEnds] = useState("");
    const [fRole, setFRole] = useState("principal");
    const [fInvited, setFInvited] = useState<string[]>(["faculty"]);
    const [fStatus, setFStatus] = useState("upcoming");

    // Delete
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const client = getInsforgeClient();

    useEffect(() => { loadMeetings(); }, []);

    const loadMeetings = async () => {
        setLoading(true);
        try {
            const { data, error } = await (client as any).db.from("meetings").select("*").order("scheduled_at", { ascending: false });
            if (!error) setMeetings(data || []);
        } finally { setLoading(false); }
    };

    const openCreate = () => {
        setFTitle(""); setFDesc(""); setFType("gmeet"); setFLink("");
        const now = new Date(); now.setMinutes(0, 0, 0);
        now.setHours(now.getHours() + 1);
        setFDate(now.toISOString().slice(0, 16));
        const end = new Date(now); end.setHours(end.getHours() + 1);
        setFEnds(end.toISOString().slice(0, 16));
        setFRole("principal"); setFInvited(["faculty"]); setFStatus("upcoming");
        setMsg(null); setEditing(null); setModalMode("create");
    };

    const openEdit = (m: Meeting) => {
        setFTitle(m.title); setFDesc(m.description || ""); setFType(m.meeting_type);
        setFLink(m.meeting_link || "");
        setFDate(m.scheduled_at ? new Date(m.scheduled_at).toISOString().slice(0, 16) : "");
        setFEnds(m.ends_at ? new Date(m.ends_at).toISOString().slice(0, 16) : "");
        setFRole(m.created_by_role); setFInvited(m.invited_roles); setFStatus(m.status);
        setMsg(null); setEditing(m); setModalMode("edit");
    };

    const handleSave = async () => {
        if (!fTitle.trim() || !fDate) { setMsg({ type: "error", text: "Title and date are required." }); return; }
        setSaving(true); setMsg(null);
        const payload = {
            title: fTitle.trim(), description: fDesc.trim() || null, meeting_type: fType,
            meeting_link: fLink.trim() || null, scheduled_at: new Date(fDate).toISOString(),
            ends_at: fEnds ? new Date(fEnds).toISOString() : null,
            created_by_role: fRole, invited_roles: fInvited, status: fStatus, updated_at: new Date().toISOString(),
        };
        try {
            if (modalMode === "create") {
                const { data, error } = await (client as any).db.from("meetings").insert([payload]).select().single();
                if (error) throw error;
                setMeetings(prev => [data, ...prev]);
                setMsg({ type: "success", text: "✅ Meeting created!" });
            } else if (editing) {
                const { error } = await (client as any).db.from("meetings").update(payload).eq("id", editing.id);
                if (error) throw error;
                setMeetings(prev => prev.map(m => m.id === editing.id ? { ...m, ...payload } : m));
                setMsg({ type: "success", text: "✅ Meeting updated!" });
            }
            setTimeout(() => { setModalMode(null); setEditing(null); }, 900);
        } catch (e: any) {
            setMsg({ type: "error", text: e.message || "Failed to save." });
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        setDeleting(true);
        try {
            await (client as any).db.from("meetings").delete().eq("id", id);
            setMeetings(prev => prev.filter(m => m.id !== id));
            setDeletingId(null);
        } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
    };

    const copyLink = (link: string, id: string) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleInvited = (role: string) => {
        setFInvited(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    const filtered = meetings.filter(m => filterStatus === "all" || m.status === filterStatus);

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-background-light dark:bg-background-dark">
            <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span>
                            <span className="text-slate-900 dark:text-white">Meetings</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Meetings</h1>
                        <p className="text-slate-500 mt-1">Schedule and share meeting links (Google Meet, Zoom, Teams) with faculty & staff</p>
                    </div>
                    <button onClick={openCreate} className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
                        <Plus size={20} /> New Meeting
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {["all", "upcoming", "live", "completed", "cancelled"].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border capitalize transition-all ${filterStatus === s
                                ? "bg-primary text-white border-primary"
                                : "bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                            {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
                        </button>
                    ))}
                </div>

                {/* Meetings List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <Video size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No meetings found</p>
                        <p className="text-sm mt-1">Click "New Meeting" to schedule one</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {filtered.map(m => {
                            const typeInfo = getMeetingTypeInfo(m.meeting_type);
                            const statusCfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.upcoming;
                            return (
                                <div key={m.id} className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all group">
                                    {/* Top row */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.bg} ${typeInfo.color}`}>
                                                <Globe size={10} /> {typeInfo.label}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.classes}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                                {statusCfg.label}
                                            </span>
                                        </div>
                                        {/* Edit / Delete (only principal or faculty of that meeting can edit) */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(m)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Pencil size={14} /></button>
                                            <button onClick={() => setDeletingId(m.id)} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{m.title}</h3>
                                    {m.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{m.description}</p>}

                                    {/* Date & Time */}
                                    <div className="flex items-center gap-4 mb-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5"><Calendar size={13} /> {fmtDate(m.scheduled_at)}</span>
                                        {m.ends_at && <span className="flex items-center gap-1.5"><Clock size={13} /> ends {fmtDate(m.ends_at)}</span>}
                                    </div>

                                    {/* Invited Roles */}
                                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                                        <Users size={12} />
                                        Invited: {(m.invited_roles || []).map(r => <span key={r} className="capitalize">{r}</span>).reduce((a: any, b: any) => a ? <>{a}, {b}</> : b, null)}
                                        {" "}· By <span className="capitalize font-medium text-slate-300">{m.created_by_role}</span>
                                    </div>

                                    {/* Meeting Link */}
                                    {m.meeting_link ? (
                                        <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/15 rounded-xl">
                                            <Link2 size={14} className="text-primary flex-shrink-0" />
                                            <span className="text-xs text-slate-400 truncate flex-1">{m.meeting_link}</span>
                                            <button onClick={() => copyLink(m.meeting_link!, m.id)} className="p-1 rounded text-slate-400 hover:text-primary transition-colors flex-shrink-0">
                                                {copiedId === m.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                            </button>
                                            <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-slate-400 hover:text-primary transition-colors flex-shrink-0">
                                                <ExternalLink size={13} />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                                            <AlertCircle size={13} /> No meeting link added yet
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ── */}
            {modalMode && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-lg p-6 my-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                {modalMode === "create" ? "Schedule Meeting" : "Edit Meeting"}
                            </h2>
                            <button onClick={() => setModalMode(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X size={20} /></button>
                        </div>

                        {msg && (
                            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${msg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                                {msg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />} {msg.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block">
                                <span className="label-xs">Title *</span>
                                <input value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="e.g. Monthly Faculty Meeting"
                                    className="field-input mt-1.5" />
                            </label>

                            <label className="block">
                                <span className="label-xs">Description</span>
                                <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} rows={2} placeholder="Optional agenda or notes..."
                                    className="field-input mt-1.5 resize-none" />
                            </label>

                            {/* Meeting Type */}
                            <div>
                                <span className="label-xs block mb-2">Platform</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {MEETING_TYPES.map(t => (
                                        <button key={t.value} type="button" onClick={() => setFType(t.value)}
                                            className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${fType === t.value ? `${t.bg} ${t.color} border-current` : "border-border-dark text-slate-400 hover:text-white hover:border-slate-500"}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Meeting Link */}
                            <label className="block">
                                <span className="label-xs">Meeting Link</span>
                                <div className="relative mt-1.5">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input value={fLink} onChange={e => setFLink(e.target.value)} placeholder="https://meet.google.com/..."
                                        className="field-input pl-9" />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Principal and the meeting faculty can edit this link anytime.</p>
                            </label>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="label-xs">Starts *</span>
                                    <input type="datetime-local" value={fDate} onChange={e => setFDate(e.target.value)} className="field-input mt-1.5" />
                                </label>
                                <label className="block">
                                    <span className="label-xs">Ends</span>
                                    <input type="datetime-local" value={fEnds} onChange={e => setFEnds(e.target.value)} className="field-input mt-1.5" />
                                </label>
                            </div>

                            {/* Created By Role */}
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="label-xs">Scheduled By</span>
                                    <select value={fRole} onChange={e => setFRole(e.target.value)} className="field-input mt-1.5 cursor-pointer">
                                        <option value="principal">Principal</option>
                                        <option value="faculty">Faculty</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="label-xs">Status</span>
                                    <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="field-input mt-1.5 cursor-pointer">
                                        <option value="upcoming">Upcoming</option>
                                        <option value="live">Live Now</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </label>
                            </div>

                            {/* Invited Roles */}
                            <div>
                                <span className="label-xs block mb-2">Invite</span>
                                <div className="flex gap-2">
                                    {["faculty", "students", "principal"].map(role => (
                                        <button key={role} type="button" onClick={() => toggleInvited(role)}
                                            className={`flex-1 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${fInvited.includes(role) ? "bg-primary text-white border-primary" : "border-border-dark text-slate-400 hover:text-white"}`}>
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setModalMode(null)} className="flex-1 py-3 border border-border-dark text-slate-400 hover:text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                                    {saving ? "Saving..." : modalMode === "create" ? "Create Meeting" : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation ── */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-light dark:bg-surface-dark border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="text-red-400" size={22} /></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Meeting?</h3>
                        <p className="text-slate-400 text-sm mb-6">This will permanently remove this meeting and its link.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-border-dark text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(deletingId)} disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
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
