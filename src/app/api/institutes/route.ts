import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/utils/insforge/client";

// GET /api/institutes — returns all institutes ordered by name
export async function GET() {
    try {
        const client = getInsforgeClient();
        const { data, error } = await (client as any).database
            .from('institutes')
            .select('id, institute_name')
            .order('institute_name');
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (err: any) {
        console.error("GET /api/institutes error:", err);
        return NextResponse.json([], { status: 500 });
    }
}

// POST /api/institutes — inserts a new institute record
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { institute_name, principal_name, principal_email } = body;
        if (!institute_name?.trim()) {
            return NextResponse.json({ error: "institute_name is required" }, { status: 400 });
        }
        const client = getInsforgeClient();
        const { data, error } = await (client as any).database
            .from('institutes')
            .insert([{
                institute_name: institute_name.trim(),
                principal_name: principal_name?.trim() || null,
                principal_email: principal_email?.trim() || null,
            }])
            .select()
            .single();
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error("POST /api/institutes error:", err);
        return NextResponse.json({ error: err.message || "Failed to create institute" }, { status: 500 });
    }
}
