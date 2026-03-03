"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Webcam from "react-webcam";
import {
    Download, Plus, UserPlus, FolderArchive, ImagePlus,
    UploadCloud, Edit, Camera, CheckCircle2, XCircle,
    Loader2, RefreshCw, Search, Trash2
} from "lucide-react";
import {
    fetchClasses, fetchStudentsByClass, enrollStudent,
    uploadStudentPhoto, updateStudentEncoding,
    Class, Student
} from "@/utils/insforge/client";

// Insforge Edge Function for AI (Gemini Vision)
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
    (process.env.NEXT_PUBLIC_INSFORGE_BASE_URL
        ? `${process.env.NEXT_PUBLIC_INSFORGE_BASE_URL}/functions/v1/ai-engine`
        : "http://localhost:8000");

export default function StudentsManagementPage() {
    // Classes & Students
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Enrollment form
    const [fullName, setFullName] = useState("");
    const [regNumber, setRegNumber] = useState("");
    const [enrollClassId, setEnrollClassId] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [useCamera, setUseCamera] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    // State
    const [enrolling, setEnrolling] = useState(false);
    const [enrollMsg, setEnrollMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Load classes on mount
    useEffect(() => {
        fetchClasses()
            .then((cls) => {
                setClasses(cls);
                if (cls.length > 0) {
                    setSelectedClassId(cls[0].id);
                    setEnrollClassId(cls[0].id);
                }
            })
            .catch(console.error);
    }, []);

    // Load students when class changes
    useEffect(() => {
        if (!selectedClassId) return;
        setLoadingStudents(true);
        fetchStudentsByClass(selectedClassId)
            .then(setStudents)
            .catch(console.error)
            .finally(() => setLoadingStudents(false));
    }, [selectedClassId]);

    const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setUseCamera(false);
    };

    const captureFromCamera = useCallback(() => {
        const screenshot = webcamRef.current?.getScreenshot();
        if (!screenshot) return;
        setPhotoPreview(screenshot);
        // Convert base64 to File
        fetch(screenshot)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                setPhotoFile(file);
                setUseCamera(false);
            });
    }, [webcamRef]);

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnrollMsg(null);

        if (!fullName.trim() || !regNumber.trim() || !enrollClassId || !photoFile) {
            setEnrollMsg({ type: "error", text: "Please fill all fields and provide a student photo." });
            return;
        }

        setEnrolling(true);
        try {
            // 1. Generate a temp student ID (will be overwritten by DB)
            const tempId = `${regNumber.replace(/\s/g, "_")}_${Date.now()}`;

            // 2. Upload photo to InsForge storage → class/<classId>/<studentId>.jpg
            const photoUrl = await uploadStudentPhoto(tempId, enrollClassId, photoFile);

            // 3. Send photo to Python AI service to compute face encoding
            const imgData = await new Promise<string>((res, rej) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result as string);
                reader.onerror = rej;
                reader.readAsDataURL(photoFile);
            });

            const newStudent = await enrollStudent({
                name: fullName,
                register_number: regNumber,
                class_id: enrollClassId,
                photo_url: photoUrl,
                face_encoding: [1], // Sentinel: Gemini uses photo_url at scan time
            });

            setEnrollMsg({
                type: "success",
                text: `✅ ${fullName} enrolled! Photo stored — AI engine will recognize at scan time.`
            });

            // Refresh student list
            if (enrollClassId === selectedClassId) {
                setStudents(prev => [newStudent, ...prev]);
            }

            // Reset form
            setFullName("");
            setRegNumber("");
            setPhotoFile(null);
            setPhotoPreview(null);

        } catch (err: any) {
            setEnrollMsg({ type: "error", text: err.message || "Enrollment failed. Please try again." });
        } finally {
            setEnrolling(false);
        }
    };

    const recomputeEncoding = async (student: Student) => {
        if (!student.photo_url) return;
        try {
            const imgRes = await fetch(student.photo_url);
            const blob = await imgRes.blob();
            const base64 = await new Promise<string>((res) => {
                const reader = new FileReader();
                reader.onload = () => res(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const aiRes = await fetch(`${AI_SERVICE_URL}/api/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_id: student.id, image_base64: base64 }),
            });

            if (aiRes.ok) {
                const { encoding } = await aiRes.json();
                await updateStudentEncoding(student.id, encoding);
                setStudents(prev => prev.map(s => s.id === student.id ? { ...s, face_encoding: encoding } : s));
            }
        } catch (err) {
            console.error("Re-encode failed:", err);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.register_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedClass = classes.find(c => c.id === selectedClassId);

    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 w-full bg-[#0d1117]">
            <div className="max-w-[1440px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                        <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
                        <span>/</span>
                        <span className="text-white font-medium">Student Enrollment</span>
                    </div>
                    <div className="flex justify-between items-end flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white">Student Management</h1>
                            <p className="text-slate-400 mt-1">Enroll students with face photos — stored in InsForge and used for live AI recognition.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT: Enrollment Form */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#111418] border border-white/8 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/8">
                                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Enroll Student</h3>
                                    <p className="text-xs text-slate-400">Upload photo → stored in class folder → face encoded for AI</p>
                                </div>
                            </div>

                            {enrollMsg && (
                                <div className={`mb-5 p-3 rounded-xl flex items-start gap-2 text-sm font-medium ${enrollMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                                    {enrollMsg.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                                    {enrollMsg.text}
                                </div>
                            )}

                            <form className="flex flex-col gap-4" onSubmit={handleEnroll}>
                                {/* Name */}
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</span>
                                    <input
                                        value={fullName} onChange={e => setFullName(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-sm py-2.5 px-3 outline-none transition-all"
                                        placeholder="e.g. John Doe" type="text" required
                                    />
                                </label>

                                {/* Reg Number + Class */}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Reg Number</span>
                                        <input
                                            value={regNumber} onChange={e => setRegNumber(e.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 text-sm py-2.5 px-3 outline-none transition-all"
                                            placeholder="CS-2024-001" type="text" required
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Class</span>
                                        <select
                                            value={enrollClassId} onChange={e => setEnrollClassId(e.target.value)}
                                            className="w-full rounded-xl border border-white/10 bg-[#1a1f2e] text-white focus:border-blue-500/50 text-sm py-2.5 px-3 outline-none"
                                        >
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                {/* Photo Upload Area */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Student Photo</span>

                                    {/* Toggle: upload vs webcam */}
                                    <div className="flex gap-2 mb-1">
                                        <button type="button" onClick={() => setUseCamera(false)}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${!useCamera ? "bg-blue-600 border-blue-600 text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>
                                            <UploadCloud className="inline w-3 h-3 mr-1" /> Upload
                                        </button>
                                        <button type="button" onClick={() => setUseCamera(true)}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${useCamera ? "bg-blue-600 border-blue-600 text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>
                                            <Camera className="inline w-3 h-3 mr-1" /> Webcam
                                        </button>
                                    </div>

                                    {useCamera ? (
                                        <div className="rounded-xl overflow-hidden border border-white/10 relative">
                                            <Webcam
                                                ref={webcamRef}
                                                audio={false}
                                                screenshotFormat="image/jpeg"
                                                className="w-full aspect-video object-cover"
                                                onUserMedia={() => setIsCameraReady(true)}
                                                mirrored
                                            />
                                            {isCameraReady && (
                                                <button
                                                    type="button"
                                                    onClick={captureFromCamera}
                                                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
                                                >
                                                    <Camera size={14} /> Capture Photo
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <label className="relative group border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl bg-white/3 p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-3">
                                            {photoPreview ? (
                                                <div className="relative w-full">
                                                    <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-blue-500/10 p-3 rounded-full group-hover:scale-110 transition-transform">
                                                        <ImagePlus className="text-blue-400" size={24} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-white">Click or drag photo here</p>
                                                        <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                                                    </div>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoFileChange} />
                                        </label>
                                    )}

                                    {photoPreview && !useCamera && (
                                        <button type="button" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors self-end">
                                            Remove photo
                                        </button>
                                    )}
                                </div>

                                {/* Storage path info */}
                                {enrollClassId && (
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-slate-400">
                                        <FolderArchive size={12} className="text-blue-400 shrink-0" />
                                        <span>Stored at: <code className="text-blue-300">student-photos/class/{classes.find(c => c.id === enrollClassId)?.name || enrollClassId}/...</code></span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={enrolling}
                                    className="mt-2 w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    {enrolling ? "Enrolling..." : "Enroll Student"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT: Student List */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* Class selector + search */}
                        <div className="bg-[#111418] border border-white/8 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                            <select
                                value={selectedClassId}
                                onChange={e => setSelectedClassId(e.target.value)}
                                className="rounded-xl border border-white/10 bg-[#1a1f2e] text-white text-sm py-2 px-3 outline-none min-w-[150px]"
                            >
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} — {c.department}</option>
                                ))}
                            </select>
                            <div className="relative flex-1 min-w-[150px]">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm py-2 pl-8 pr-3 outline-none"
                                    placeholder="Search by name or reg..."
                                />
                            </div>
                            <button onClick={() => { if (selectedClassId) setLoadingStudents(true); fetchStudentsByClass(selectedClassId).then(setStudents).finally(() => setLoadingStudents(false)); }}
                                className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        {/* Student Table */}
                        <div className="bg-[#111418] border border-white/8 rounded-2xl overflow-hidden flex-1">
                            <div className="p-4 border-b border-white/8 flex justify-between items-center">
                                <h3 className="font-bold text-white text-sm">
                                    {selectedClass?.name} — {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
                                </h3>
                                {loadingStudents && <Loader2 size={16} className="animate-spin text-slate-400" />}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-white/3 border-b border-white/8">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Student</th>
                                            <th className="px-4 py-3 font-semibold">Photo</th>
                                            <th className="px-4 py-3 font-semibold">Face Encoding</th>
                                            <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                                                    {loadingStudents ? "Loading..." : "No students enrolled in this class yet."}
                                                </td>
                                            </tr>
                                        ) : filteredStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {student.photo_url ? (
                                                            <img
                                                                src={student.photo_url}
                                                                alt={student.name}
                                                                className="w-9 h-9 rounded-full object-cover border border-white/10"
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                                                                {student.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-white">{student.name}</div>
                                                            <div className="text-xs text-slate-500">{student.register_number}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {student.photo_url ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle2 size={10} /> Stored
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                            <XCircle size={10} /> Missing
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {student.face_encoding && (student.face_encoding as any[]).length > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                            <CheckCircle2 size={10} /> {(student.face_encoding as any[]).length}D
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {(!student.face_encoding || (student.face_encoding as any[]).length === 0) && student.photo_url && (
                                                            <button
                                                                onClick={() => recomputeEncoding(student)}
                                                                title="Compute face encoding"
                                                                className="text-slate-400 hover:text-blue-400 transition-colors"
                                                            >
                                                                <RefreshCw size={14} />
                                                            </button>
                                                        )}
                                                        <a href={student.photo_url || "#"} target="_blank" rel="noopener noreferrer"
                                                            className={`text-slate-400 hover:text-white transition-colors ${!student.photo_url ? "opacity-30 pointer-events-none" : ""}`}>
                                                            <Edit size={14} />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
