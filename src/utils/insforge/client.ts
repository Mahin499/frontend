import { createClient } from '@insforge/sdk';

const INSFORGE_BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

// Singleton for client-side use
let _client: ReturnType<typeof createClient> | null = null;

export function getInsforgeClient() {
    if (!_client) {
        _client = createClient({
            baseUrl: INSFORGE_BASE_URL,
            anonKey: INSFORGE_ANON_KEY,
        });
    }
    return _client;
}

// ─── Student photo storage helpers ───────────────────────────────────────────

/**
 * Upload a student photo to InsForge storage under class/<className>/<filename>.
 * Returns the public URL of the uploaded file.
 */
export async function uploadStudentPhoto(
    studentId: string,
    className: string,
    file: File
): Promise<string> {
    const client = getInsforgeClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `class/${className}/${studentId}_${Date.now()}.${ext}`;

    const { data, error } = await (client as any).storage
        .from('student-photos')
        .upload(path, file);

    if (error) throw new Error(`Upload failed: ${error.message}`);
    if (!data?.url) throw new Error("Upload succeeded but no URL returned");

    return data.url as string;
}

// ─── DB helpers ──────────────────────────────────────────────────────────────

export interface Student {
    id: string;
    name: string;
    register_number: string;
    class_id: string | null;
    photo_url: string | null;
    face_encoding: number[] | null;
    enrolled_at: string;
}

export interface Class {
    id: string;
    name: string;
    department: string;
    section: string | null;
}

export async function fetchClasses(): Promise<Class[]> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).db
        .from('classes')
        .select('*')
        .order('name');
    if (error) throw error;
    return (data || []) as Class[];
}

export async function fetchStudentsByClass(classId: string): Promise<Student[]> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).db
        .from('students')
        .select('*')
        .eq('class_id', classId);
    if (error) throw error;
    return (data || []) as Student[];
}

export async function enrollStudent(params: {
    name: string;
    register_number: string;
    class_id: string;
    photo_url: string;
    face_encoding: number[];
}): Promise<Student> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).db
        .from('students')
        .insert([params])
        .select()
        .single();
    if (error) throw error;
    return data as Student;
}

export async function updateStudentEncoding(studentId: string, face_encoding: number[]): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).db
        .from('students')
        .update({ face_encoding })
        .eq('id', studentId);
    if (error) throw error;
}

export async function updateStudent(studentId: string, params: Partial<Pick<Student, 'name' | 'register_number' | 'class_id'>>): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).db
        .from('students')
        .update(params)
        .eq('id', studentId);
    if (error) throw error;
}

export async function deleteStudent(studentId: string): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).db
        .from('students')
        .delete()
        .eq('id', studentId);
    if (error) throw error;
}

export async function markAttendance(params: {
    student_id: string;
    class_id: string;
    period?: string;
    subject?: string;
    confidence?: number;
    attention_status?: string;
    sleep_score?: number;
}): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).db
        .from('attendance')
        .insert([{ ...params, status: 'present' }]);
    if (error) throw error;
}

export async function createClass(params: { name: string; department: string; section?: string }): Promise<Class> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).db
        .from('classes')
        .insert([params])
        .select()
        .single();
    if (error) throw error;
    return data as Class;
}

export async function updateClass(classId: string, params: Partial<Pick<Class, 'name' | 'department' | 'section'>>): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).db
        .from('classes')
        .update(params)
        .eq('id', classId);
    if (error) throw error;
}

export async function deleteClass(classId: string): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).db
        .from('classes')
        .delete()
        .eq('id', classId);
    if (error) throw error;
}
