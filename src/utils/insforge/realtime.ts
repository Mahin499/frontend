import { useState, useEffect } from "react";
import { getInsforgeClient } from "./client";

// ── Real-time student count hook ─────────────────────────────────────────────
export function useStudentCount() {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
        const client = getInsforgeClient();
        // Initial fetch
        (client as any).db.from("students").select("id", { count: "exact", head: true })
            .then(({ count: c }: any) => setCount(c ?? 0));
        // Real-time subscription
        const sub = (client as any).realtime
            ?.channel("students-count")
            ?.on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
                (client as any).db.from("students").select("id", { count: "exact", head: true })
                    .then(({ count: c }: any) => setCount(c ?? 0));
            })
            ?.subscribe();
        return () => { sub?.unsubscribe?.(); };
    }, []);
    return count;
}

// ── Real-time faculty count hook ──────────────────────────────────────────────
export function useFacultyCount() {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
        const client = getInsforgeClient();
        (client as any).db.from("faculty_approvals").select("id", { count: "exact", head: true })
            .eq("status", "approved")
            .then(({ count: c }: any) => setCount(c ?? 0));
        const sub = (client as any).realtime
            ?.channel("faculty-count")
            ?.on("postgres_changes", { event: "*", schema: "public", table: "faculty_approvals" }, () => {
                (client as any).db.from("faculty_approvals").select("id", { count: "exact", head: true })
                    .eq("status", "approved")
                    .then(({ count: c }: any) => setCount(c ?? 0));
            })
            ?.subscribe();
        return () => { sub?.unsubscribe?.(); };
    }, []);
    return count;
}

// ── Real-time pending approvals ───────────────────────────────────────────────
export function usePendingApprovals() {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
        const client = getInsforgeClient();
        const fetch = () =>
            (client as any).db.from("faculty_approvals").select("id", { count: "exact", head: true })
                .eq("status", "pending")
                .then(({ count: c }: any) => setCount(c ?? 0));
        fetch();
        const sub = (client as any).realtime
            ?.channel("approvals-pending")
            ?.on("postgres_changes", { event: "*", schema: "public", table: "faculty_approvals" }, fetch)
            ?.subscribe();
        return () => { sub?.unsubscribe?.(); };
    }, []);
    return count;
}

// ── AI Validation DB writes ────────────────────────────────────────────────────
export async function writeAIValidation(
    validationId: string,
    action: "confirmed" | "rejected" | "investigating",
    reason?: string
) {
    const client = getInsforgeClient();
    const payload: Record<string, any> = {
        status: action === "confirmed" ? "Approved" : action === "rejected" ? "Rejected" : "Investigating",
        reviewed_at: new Date().toISOString(),
    };
    if (reason) payload.rejection_reason = reason;
    // Write to ai_validations table if it exists, silently ignore if not
    try {
        await (client as any).db.from("ai_validations").upsert([{ id: validationId, ...payload }]);
    } catch (_) { /* table may not exist, treat as no-op */ }
}

// ── Institute Settings DB persistence ─────────────────────────────────────────
export async function saveInstituteSettings(settings: Record<string, any>) {
    const client = getInsforgeClient();
    try {
        const { error } = await (client as any).db.from("institute_settings").upsert([{ id: "main", ...settings, updated_at: new Date().toISOString() }]);
        if (error) throw error;
    } catch (_) { /* table may not exist yet */ }
}

export async function loadInstituteSettings(): Promise<Record<string, any> | null> {
    const client = getInsforgeClient();
    try {
        const { data } = await (client as any).db.from("institute_settings").select("*").eq("id", "main").single();
        return data || null;
    } catch (_) { return null; }
}

// ── Meeting attendance marking ─────────────────────────────────────────────────
export async function markMeetingAttendance(meetingId: string, facultyId: string, status: "present" | "absent" | "late") {
    const client = getInsforgeClient();
    try {
        await (client as any).db.from("meeting_attendance").upsert([{
            meeting_id: meetingId, faculty_id: facultyId, status, marked_at: new Date().toISOString()
        }]);
    } catch (_) { /* silent */ }
}

export async function getMeetingAttendance(meetingId: string) {
    const client = getInsforgeClient();
    try {
        const { data } = await (client as any).db.from("meeting_attendance").select("*").eq("meeting_id", meetingId);
        return data || [];
    } catch (_) { return []; }
}
