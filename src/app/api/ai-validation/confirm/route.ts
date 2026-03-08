import { NextResponse } from 'next/server';
import { getInsforgeClient } from '@/utils/insforge/client';

export async function POST(req: Request) {
    try {
        const client = getInsforgeClient();

        const { validationId, action } = await req.json();

        if (!validationId || !action) {
            return NextResponse.json({ error: 'Missing validationId or action' }, { status: 400 });
        }

        // 1. Fetch the AI validation record
        const { data: validation, error: fetchError } = await client.database
            .from('ai_validations')
            .select('*')
            .eq('id', validationId)
            .single();

        if (fetchError || !validation) {
            return NextResponse.json({ error: 'Validation record not found' }, { status: 404 });
        }

        // 2. Update the ai_validations status
        const { error: updateError } = await client.database
            .from('ai_validations')
            .update({ status: action, reviewed_at: new Date().toISOString() })
            .eq('id', validationId);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update validation status' }, { status: 500 });
        }

        // 3. If action is 'confirmed', insert into attendance
        if (action === 'confirmed') {
            // Try to resolve the student by name (since ai_validations only has student_name)
            const { data: student } = await client.database
                .from('students')
                .select('id, class_id')
                .eq('name', validation.student_name)
                .single();

            if (student) {
                const { error: insertError } = await client.database
                    .from('attendance')
                    .insert([{
                        student_id: student.id,
                        class_id: student.class_id,
                        session_date: new Date().toISOString().split('T')[0],
                        status: 'present',
                        confidence: validation.confidence,
                        attention_status: Array.isArray(validation.tags) && validation.tags.includes('Attentive') ? 'Attentive' : 'Distracted',
                        marked_at: new Date().toISOString()
                    }]);

                if (insertError) {
                    console.error("Failed to insert attendance:", insertError);
                    // Non-fatal error, status was updated but attendance failed
                }
            } else {
                console.warn(`Could not resolve student ID for name: ${validation.student_name}`);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error confirming validation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
