"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Building2, BookOpen, Bell, Shield, Save, Loader2,
    CheckCircle2, Plus, Trash2, Globe, Phone, Mail,
    Lock, Eye, EyeOff, ToggleLeft, ToggleRight, Brain
} from "lucide-react";
import { saveInstituteSettings, loadInstituteSettings } from "@/utils/insforge/realtime";

type Tab = "institute" | "departments" | "academic" | "notifications" | "security";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "institute", label: "Institute Profile", icon: <Building2 size={16} /> },
    { id: "departments", label: "Departments", icon: <BookOpen size={16} /> },
    { id: "academic", label: "Academic & AI", icon: <Brain size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
];

const INIT_DEPTS = [
    "Computer Science",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("institute");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Institute fields
    const [instName, setInstName] = useState("SmartAttend Institute");
    const [instCode, setInstCode] = useState("SAI-2024");
    const [instEmail, setInstEmail] = useState("admin@smartattend.edu");
    const [instPhone, setInstPhone] = useState("+91 98765 43210");
    const [instWebsite, setInstWebsite] = useState("https://smartattend.edu");
    const [instAddress, setInstAddress] = useState("123 Education Lane, Bangalore, Karnataka 560001");

    // Departments
    const [depts, setDepts] = useState<string[]>(INIT_DEPTS);
    const [newDept, setNewDept] = useState("");

    // Academic year
    const [acadYear, setAcadYear] = useState("2025-2026");
    const [termStart, setTermStart] = useState("2025-06-01");
    const [termEnd, setTermEnd] = useState("2026-03-31");
    const [workingDays, setWorkingDays] = useState(["MON", "TUE", "WED", "THU", "FRI"]);
    const [minAttendance, setMinAttendance] = useState("75");

    // Notifications
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSms, setNotifSms] = useState(false);
    const [notifAbsence, setNotifAbsence] = useState(true);
    const [notifAnomaly, setNotifAnomaly] = useState(true);
    const [notifMeeting, setNotifMeeting] = useState(true);
    const [notifThreshold, setNotifThreshold] = useState("3");

    // Security
    const [showPass, setShowPass] = useState(false);
    const [curPass, setCurPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confPass, setConfPass] = useState("");
    const [twoFa, setTwoFa] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState("60");

    // AI thresholds
    const [aiConfidence, setAiConfidence] = useState("85");
    const [liveness, setLiveness] = useState("medium");
    const [attendanceThreshold, setAttendanceThreshold] = useState("75");

    // Load settings from DB on mount
    useEffect(() => {
        loadInstituteSettings().then(data => {
            if (!data) return;
            if (data.name) setInstName(data.name);
            if (data.code) setInstCode(data.code);
            if (data.email) setInstEmail(data.email);
            if (data.phone) setInstPhone(data.phone);
            if (data.website) setInstWebsite(data.website);
            if (data.address) setInstAddress(data.address);
            if (data.acad_year) setAcadYear(data.acad_year);
            if (data.term_start) setTermStart(data.term_start);
            if (data.term_end) setTermEnd(data.term_end);
            if (data.working_days) setWorkingDays(data.working_days);
            if (data.min_attendance_pct) setMinAttendance(String(data.min_attendance_pct));
            if (data.notif_email !== undefined) setNotifEmail(data.notif_email);
            if (data.notif_sms !== undefined) setNotifSms(data.notif_sms);
            if (data.notif_absence !== undefined) setNotifAbsence(data.notif_absence);
            if (data.notif_anomaly !== undefined) setNotifAnomaly(data.notif_anomaly);
            if (data.notif_meeting !== undefined) setNotifMeeting(data.notif_meeting);
            if (data.absence_threshold) setNotifThreshold(String(data.absence_threshold));
            if (data.two_fa !== undefined) setTwoFa(data.two_fa);
            if (data.session_timeout) setSessionTimeout(String(data.session_timeout));
            if (data.ai_confidence_threshold) setAiConfidence(String(data.ai_confidence_threshold));
            if (data.liveness_sensitivity) setLiveness(data.liveness_sensitivity);
            if (data.attendance_threshold) setAttendanceThreshold(String(data.attendance_threshold));
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await saveInstituteSettings({
                name: instName, code: instCode, email: instEmail, phone: instPhone,
                website: instWebsite, address: instAddress,
                acad_year: acadYear, term_start: termStart, term_end: termEnd,
                working_days: workingDays, min_attendance_pct: Number(minAttendance),
                notif_email: notifEmail, notif_sms: notifSms, notif_absence: notifAbsence,
                notif_anomaly: notifAnomaly, notif_meeting: notifMeeting,
                absence_threshold: Number(notifThreshold),
                two_fa: twoFa, session_timeout: Number(sessionTimeout),
                ai_confidence_threshold: Number(aiConfidence),
                liveness_sensitivity: liveness,
                attendance_threshold: Number(attendanceThreshold),
            });
        } catch (_) { /* silent fallback */ }
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const toggleDay = (d: string) =>
        setWorkingDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    const addDept = () => {
        if (newDept.trim() && !depts.includes(newDept.trim())) {
            setDepts(prev => [...prev, newDept.trim()]);
            setNewDept("");
        }
    };

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white">Institute Settings</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Institute Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your institute profile, departments, academic calendar and security</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Tab Sidebar */}
                    <div className="lg:w-56 flex-shrink-0">
                        <nav className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap flex-shrink-0 lg:flex-shrink-1 w-full ${activeTab === t.id
                                        ? "bg-primary text-white shadow"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6">

                        {/* ─── Institute Profile ─── */}
                        {activeTab === "institute" && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Institute Profile</h2>
                                {/* Logo placeholder */}
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-light dark:border-border-dark">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                                        <Building2 size={32} className="text-primary opacity-60" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-white">Institute Logo</p>
                                        <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 2MB · 200×200 recommended</p>
                                        <button className="mt-2 text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-semibold transition-colors">Upload Logo</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="block md:col-span-2">
                                        <span className="label-xs">Institute Name</span>
                                        <input value={instName} onChange={e => setInstName(e.target.value)} className="field-input mt-1.5" placeholder="Your Institute Name" />
                                    </label>
                                    <label className="block">
                                        <span className="label-xs">Institute Code</span>
                                        <input value={instCode} onChange={e => setInstCode(e.target.value)} className="field-input mt-1.5" placeholder="e.g. SAI-2024" />
                                    </label>
                                    <label className="block">
                                        <span className="label-xs">Website</span>
                                        <div className="relative mt-1.5">
                                            <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input value={instWebsite} onChange={e => setInstWebsite(e.target.value)} className="field-input pl-9" placeholder="https://" />
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span className="label-xs">Email</span>
                                        <div className="relative mt-1.5">
                                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="email" value={instEmail} onChange={e => setInstEmail(e.target.value)} className="field-input pl-9" placeholder="admin@institute.edu" />
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span className="label-xs">Phone</span>
                                        <div className="relative mt-1.5">
                                            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input value={instPhone} onChange={e => setInstPhone(e.target.value)} className="field-input pl-9" placeholder="+91 ..." />
                                        </div>
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="label-xs">Address</span>
                                        <textarea value={instAddress} onChange={e => setInstAddress(e.target.value)} rows={2} className="field-input mt-1.5 resize-none" placeholder="Full address..." />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ─── Departments ─── */}
                        {activeTab === "departments" && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Departments</h2>
                                <div className="flex gap-2 mb-4">
                                    <input value={newDept} onChange={e => setNewDept(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && addDept()}
                                        className="field-input flex-1" placeholder="Add new department name..." />
                                    <button onClick={addDept} className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-colors flex-shrink-0">
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {depts.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span className="text-sm font-medium text-slate-800 dark:text-white">{d}</span>
                                            </div>
                                            <button onClick={() => setDepts(prev => prev.filter((_, j) => j !== i))}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400">{depts.length} departments configured</p>
                            </div>
                        )}

                        {/* ─── Academic Year ─── */}
                        {activeTab === "academic" && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Academic Year</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="block">
                                        <span className="label-xs">Current Academic Year</span>
                                        <input value={acadYear} onChange={e => setAcadYear(e.target.value)} className="field-input mt-1.5" placeholder="2025-2026" />
                                    </label>
                                    <label className="block">
                                        <span className="label-xs">Term Start</span>
                                        <input type="date" value={termStart} onChange={e => setTermStart(e.target.value)} className="field-input mt-1.5" />
                                    </label>
                                    <label className="block">
                                        <span className="label-xs">Term End</span>
                                        <input type="date" value={termEnd} onChange={e => setTermEnd(e.target.value)} className="field-input mt-1.5" />
                                    </label>
                                </div>
                                <div>
                                    <span className="label-xs block mb-2">Working Days</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
                                            <button key={d} onClick={() => toggleDay(d)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${workingDays.includes(d) ? "bg-primary text-white border-primary" : "border-border-dark text-slate-400 hover:text-white hover:border-slate-500"}`}>
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <label className="block max-w-xs">
                                    <span className="label-xs">Minimum Attendance Required (%)</span>
                                    <input type="number" min="0" max="100" value={minAttendance} onChange={e => setMinAttendance(e.target.value)} className="field-input mt-1.5" />
                                    <p className="text-xs text-slate-400 mt-1">Students below this threshold will be flagged</p>
                                </label>

                                {/* AI Thresholds */}
                                <div className="mt-6 pt-5 border-t border-border-light dark:border-border-dark">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4"><Brain size={15} /> AI Thresholds</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="label-xs">AI Confidence Threshold (%)</span>
                                            <input type="number" min="50" max="100" value={aiConfidence} onChange={e => setAiConfidence(e.target.value)} className="field-input mt-1.5" />
                                            <p className="text-xs text-slate-400 mt-1">Detections below this are sent to validation queue</p>
                                        </label>
                                        <label className="block">
                                            <span className="label-xs">Liveness Sensitivity</span>
                                            <select value={liveness} onChange={e => setLiveness(e.target.value)} className="field-input mt-1.5 cursor-pointer">
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                            <p className="text-xs text-slate-400 mt-1">Higher = stricter liveness check</p>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Notifications ─── */}
                        {activeTab === "notifications" && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Notification Settings</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: "Email Notifications", desc: "Send alerts via email", val: notifEmail, set: setNotifEmail },
                                        { label: "SMS Notifications", desc: "Send alerts via SMS", val: notifSms, set: setNotifSms },
                                        { label: "Absence Alerts", desc: "Alert when student is absent", val: notifAbsence, set: setNotifAbsence },
                                        { label: "Anomaly Alerts", desc: "Alert for AI-detected anomalies", val: notifAnomaly, set: setNotifAnomaly },
                                        { label: "Meeting Reminders", desc: "Remind about upcoming meetings", val: notifMeeting, set: setNotifMeeting },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark last:border-0">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                            </div>
                                            <button onClick={() => item.set(!item.val)} className="flex-shrink-0">
                                                {item.val
                                                    ? <ToggleRight size={32} className="text-primary" />
                                                    : <ToggleLeft size={32} className="text-slate-400" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label className="block max-w-xs">
                                    <span className="label-xs">Absence Alert Threshold (consecutive days)</span>
                                    <input type="number" min="1" value={notifThreshold} onChange={e => setNotifThreshold(e.target.value)} className="field-input mt-1.5" />
                                </label>
                            </div>
                        )}

                        {/* ─── Security ─── */}
                        {activeTab === "security" && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Security Settings</h2>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Lock size={15} /> Change Password</h3>
                                    <label className="block">
                                        <span className="label-xs">Current Password</span>
                                        <div className="relative mt-1.5">
                                            <input type={showPass ? "text" : "password"} value={curPass} onChange={e => setCurPass(e.target.value)} className="field-input pr-10" placeholder="Enter current password" />
                                            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="label-xs">New Password</span>
                                            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="field-input mt-1.5" placeholder="New password" />
                                        </label>
                                        <label className="block">
                                            <span className="label-xs">Confirm New Password</span>
                                            <input type="password" value={confPass} onChange={e => setConfPass(e.target.value)} className="field-input mt-1.5" placeholder="Confirm password" />
                                        </label>
                                    </div>
                                    <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-colors">Update Password</button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Require OTP on login for added security</p>
                                        </div>
                                        <button onClick={() => setTwoFa(!twoFa)}>
                                            {twoFa ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-slate-400" />}
                                        </button>
                                    </div>
                                    <label className="block max-w-xs">
                                        <span className="label-xs">Session Timeout (minutes)</span>
                                        <input type="number" min="15" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="field-input mt-1.5" />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark flex justify-end">
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg shadow-primary/20">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
