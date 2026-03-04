import { NextResponse } from "next/server";
import { createClass } from "@/utils/insforge/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { className, department, semester, facultyId } = body;

        if (!className || !department) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newClass = await createClass({
            name: className,
            department: department,
            section: semester || null,
        });

        return NextResponse.json(newClass, { status: 201 });
    } catch (error: any) {
        console.error("Error creating class:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
