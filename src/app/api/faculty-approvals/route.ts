import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/utils/insforge/client";

// GET /api/faculty-approvals — returns all faculty approval requests
export async function GET() {
    try {
        const client = getInsforgeClient();
        const { data, error } = await (client as any).database
            .from('faculty_approvals')
            .select('*')
            .order('submitted_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (err: any) {
        console.error("GET /api/faculty-approvals error:", err);
        return NextResponse.json([], { status: 500 });
    }
}

// PATCH /api/faculty-approvals — update status of a faculty approval
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;
        if (!id || !status) {
            return NextResponse.json({ error: "id and status are required" }, { status: 400 });
        }
        const client = getInsforgeClient();
        const { data, error } = await (client as any).database
            .from('faculty_approvals')
            .update({ status, reviewed_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;

        // 3. Send email notification if approved
        if (status === 'approved') {
            try {
                await (client as any).notifications.sendEmail({
                    to: data.faculty_email,
                    subject: "Your SmartAttend Faculty Account is Approved!",
                    html: `
                        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                            <h2>Congratulations, ${data.faculty_name}!</h2>
                            <p>Your faculty registration for SmartAttend AI has been approved by the Principal.</p>
                            <p>You can now log in to access your dashboard and manage your classes.</p>
                            <a href="https://239piywv.insforge.site/login" 
                               style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                               Log In Now
                            </a>
                            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                                If you have any questions, please contact your institute's administrator.
                            </p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error("Failed to send approval email:", emailErr);
                // We don't fail the request just because the email failed
            }
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("PATCH /api/faculty-approvals error:", err);
        return NextResponse.json({ error: err.message || "Failed to update status" }, { status: 500 });
    }
}
