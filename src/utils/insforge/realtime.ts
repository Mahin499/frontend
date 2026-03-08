"use client";

import { useState, useEffect } from "react";
import { getInsforgeClient } from "./client";

// ── Real-time student count hook ─────────────────────────────────────────────
export function useStudentCount() {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
        const client = getInsforgeClient();
        // Initial fetch
        (client as any).database.from("students").select("id", { count: "exact", head: true })
            .then(({ count: c }: any) => setCount(c ?? 0));
        // Real-time subscription
        const rt = (client as any).realtime;
        if (rt) {
            rt.connect?.();
            rt.subscribe?.("students-count");
            const handler = () => {
                (client as any).database.from("students").select("id", { count: "exact", head: true })
                    .then(({ count: c }: any) => setCount(c ?? 0));
            };
            // Listen for a custom event or generic fallback
            rt.on?.("update", handler);
            return () => { rt.unsubscribe?.("students-count"); rt.off?.("update", handler); };
        }
        return () => { };
    }, []);
    return count;
}

// ── Real-time faculty count hook ──────────────────────────────────────────────
export function useFacultyCount() {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
        const client = getInsforgeClient();
        (client as any).database.from("faculty_approvals").select("id", { count: "exact", head: true })
            .eq("status", "approved")
            .then(({ count: c }: any) => setCount(c ?? 0));
        const rt = (client as any).realtime;
        if (rt) {
            rt.connect?.();
            rt.subscribe?.("faculty-count");
            const handler = () => {
                (client as any).database.from("faculty_approvals").select("id", { count: "exact", head: true })
                    .eq("status", "approved")
                    .then(({ count: c }: any) => setCount(c ?? 0));
            };
            rt.on?.("update", handler);
            return () => { rt.unsubscribe?.("faculty-count"); rt.off?.("update", handler); };
        }
        return () => { };
    }, []);
    return count;
}

// ── Real-time pending approvals ───────────────────────────────────────────────
export function usePendingApprovals() {
    const [count, setCount] = useState<number | null>(null);
    useEffect(() => {
        const client = getInsforgeClient();
        const fetch = () =>
            (client as any).database.from("faculty_approvals").select("id", { count: "exact", head: true })
                .eq("status", "pending")
                .then(({ count: c }: any) => setCount(c ?? 0));
        fetch();
        const rt = (client as any).realtime;
        if (rt) {
            rt.connect?.();
            rt.subscribe?.("approvals-pending");
            rt.on?.("update", fetch);
            return () => { rt.unsubscribe?.("approvals-pending"); rt.off?.("update", fetch); };
        }
        return () => { };
    }, []);
    return count;
}

// ── AI Validation DB writes ────────────────────────────────────────────────────
export async function writeAIValidation(
    validationId: string,
    action: "confirmed" | "rejected" | "investigating",
    reason?: string
) {
    try {
        const response = await fetch('/api/ai-validation/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validationId, action, reason })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update AI validation');
        }
    } catch (e) {
        console.error("Failed to update AI validation", e);
        throw e;
    }
}

export async function bulkApproveHighConfidence(threshold: number = 85) {
    const client = getInsforgeClient();
    try {
        // Fetch all pending high-confidence items
        const { data: items } = await (client as any).database
            .from("ai_validations")
            .select("id")
            .eq("status", "pending")
            .gte("confidence", threshold);

        if (!items || items.length === 0) return;

        // Process them concurrently using the new API
        await Promise.all(
            items.map((item: any) => writeAIValidation(item.id, "confirmed"))
        );
    } catch (e) {
        console.error("Failed bulk approval", e);
        throw e;
    }
}

export function useAIDetections() {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const client = getInsforgeClient();

        // Initial fetch
        const fetchDetections = async () => {
            const { data } = await (client as any).database
                .from("ai_validations")
                .select("*")
                .order("created_at", { ascending: false });
            if (data) setItems(data);
        };
        fetchDetections();

        const rt = (client as any).realtime;
        if (rt) {
            rt.connect?.();
            rt.subscribe?.("ai-validations-channel");
            const handler = () => {
                fetchDetections();
            };
            // Listen for table updates
            rt.on?.("update", handler);
            return () => {
                rt.unsubscribe?.("ai-validations-channel");
                rt.off?.("update", handler);
            };
        }
    }, []);

    return items;
}

// ── Institute Settings DB persistence ─────────────────────────────────────────
export async function saveInstituteSettings(settings: Record<string, any>) {
    const client = getInsforgeClient();
    try {
        const { error } = await (client as any).database.from("institute_settings").upsert([{ id: "main", ...settings, updated_at: new Date().toISOString() }]);
        if (error) throw error;
    } catch (_) { /* table may not exist yet */ }
}

export async function loadInstituteSettings(): Promise<Record<string, any> | null> {
    const client = getInsforgeClient();
    try {
        const { data } = await (client as any).database.from("institute_settings").select("*").eq("id", "main").single();
        return data || null;
    } catch (_) { return null; }
}

// ── Meeting attendance marking ─────────────────────────────────────────────────
export async function markMeetingAttendance(meetingId: string, facultyId: string, status: "present" | "absent" | "late") {
    const client = getInsforgeClient();
    try {
        await (client as any).database.from("meeting_attendance").upsert([{
            meeting_id: meetingId, faculty_id: facultyId, status, marked_at: new Date().toISOString()
        }]);
    } catch (_) { /* silent */ }
}

export async function getMeetingAttendance(meetingId: string) {
    const client = getInsforgeClient();
    try {
        const { data } = await (client as any).database.from("meeting_attendance").select("*").eq("meeting_id", meetingId);
        return data || [];
    } catch (_) { return []; }
}
