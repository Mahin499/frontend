import { NextResponse } from "next/server";
import { writeAIValidation } from "@/utils/insforge/realtime";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, scanId } = body;

        console.log("API: Handling AI Approval for scan", scanId);

        // Map scanId to correct validation string id if necessary, or pass through
        await writeAIValidation(String(scanId), "confirmed");

        return NextResponse.json({ success: true, status: "approved" });
    } catch (error: any) {
        console.error("Error approving detection:", error);
        return NextResponse.json({ error: error.message || "Failed to approve" }, { status: 500 });
    }
}
