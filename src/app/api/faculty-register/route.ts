import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/utils/insforge/client";

// POST /api/faculty-register — inserts into faculty_approvals
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { faculty_name, faculty_email, institute_id } = body;
        if (!faculty_name?.trim() || !faculty_email?.trim()) {
            return NextResponse.json({ error: "faculty_name and faculty_email are required" }, { status: 400 });
        }
        const client = getInsforgeClient();
        const { data, error } = await (client as any).database
            .from('faculty_approvals')
            .insert([{
                faculty_name: faculty_name.trim(),
                faculty_email: faculty_email.trim(),
                department: null,
                subject: null,
                status: 'pending',
                institute_id: institute_id || null,
            }])
            .select()
            .single();
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/faculty-register error:", err);
        return NextResponse.json({ error: err.message || "Failed to register faculty" }, { status: 500 });
    }
}
