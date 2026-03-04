import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");

    console.log(`API: Filtering detections with value: ${filter}`);

    // This is a stub endpoint so that the frontend can simulate the GET /api/ai/detections behavior
    // It returns empty indicating the client should apply local filtering for now
    return NextResponse.json({ success: true, data: [] });
}
