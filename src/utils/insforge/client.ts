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
    faculty_id: string | null;
}

export async function fetchClasses(): Promise<Class[]> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).database
        .from('classes')
        .select('*')
        .order('name');
    if (error) throw error;
    return (data || []) as Class[];
}

export async function fetchStudentsByClass(classId: string): Promise<Student[]> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).database
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
    const { data, error } = await (client as any).database
        .from('students')
        .insert([params])
        .select()
        .single();
    if (error) throw error;
    return data as Student;
}

export async function updateStudentEncoding(studentId: string, face_encoding: number[]): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).database
        .from('students')
        .update({ face_encoding })
        .eq('id', studentId);
    if (error) throw error;
}

export async function updateStudent(studentId: string, params: Partial<Pick<Student, 'name' | 'register_number' | 'class_id'>>): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).database
        .from('students')
        .update(params)
        .eq('id', studentId);
    if (error) throw error;
}

export async function deleteStudent(studentId: string): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).database
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
    const { error } = await (client as any).database
        .from('attendance')
        .insert([{ ...params, status: 'present' }]);
    if (error) throw error;
}

export async function createClass(params: { name: string; department: string; section?: string; faculty_id?: string }): Promise<Class> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).database
        .from('classes')
        .insert([params])
        .select()
        .single();
    if (error) throw error;
    return data as Class;
}

export async function updateClass(classId: string, params: Partial<Pick<Class, 'name' | 'department' | 'section' | 'faculty_id'>>): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).database
        .from('classes')
        .update(params)
        .eq('id', classId);
    if (error) throw error;
}

export async function fetchApprovedFaculty(): Promise<{ id: string; faculty_name: string }[]> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).database
        .from('faculty_approvals')
        .select('id, faculty_name')
        .eq('status', 'approved')
        .order('faculty_name');
    if (error) throw error;
    return data || [];
}

export async function deleteClass(classId: string): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).database
        .from('classes')
        .delete()
        .eq('id', classId);
    if (error) throw error;
}

// ─── Staff photo storage helpers ───────────────────────────────────────────

/**
 * Upload a staff photo to InsForge storage under staff/<filename>.
 * Returns the public URL of the uploaded file.
 */
export async function uploadStaffPhoto(
    userId: string,
    file: File
): Promise<string> {
    const client = getInsforgeClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `staff/${userId}_${Date.now()}.${ext}`;

    const { data, error } = await (client as any).storage
        .from('student-photos')
        .upload(path, file);

    if (error) throw new Error(`Upload failed: ${error.message}`);
    if (!data?.url) throw new Error("Upload succeeded but no URL returned");

    return data.url as string;
}

// ─── Institute helpers ────────────────────────────────────────────────────────

export interface Institute {
    id: string;
    institute_name: string;
}

export async function fetchInstitutes(): Promise<Institute[]> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).database
        .from('institutes')
        .select('id, institute_name')
        .order('institute_name');
    if (error) throw error;
    return (data || []) as Institute[];
}

export async function insertInstitute(params: {
    institute_name: string;
    principal_name?: string;
    principal_email?: string;
    profile_photo_url?: string;
    face_encoding?: number[];
}): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).database
        .from('institutes')
        .insert([params]);
    if (error) throw error;
}

export async function fetchFacultyStatus(email: string): Promise<string | null> {
    const client = getInsforgeClient();
    const { data, error } = await (client as any).database
        .from('faculty_approvals')
        .select('status')
        .eq('faculty_email', email)
        .order('submitted_at', { ascending: false })
        .limit(1);

    if (error) return null;
    return data?.[0]?.status || null;
}

export async function insertFacultyApproval(params: {
    faculty_name: string;
    faculty_email: string;
    institute_id?: string | null;
    profile_photo_url?: string;
    face_encoding?: number[];
}): Promise<void> {
    const client = getInsforgeClient();
    const { error } = await (client as any).database
        .from('faculty_approvals')
        .insert([{ ...params, status: 'pending' }]);
    if (error) throw error;
}
