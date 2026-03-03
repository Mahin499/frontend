"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import Link from "next/link";
import {
    Settings, Expand, StopCircle, Info, History,
    CheckCircle2, AlertTriangle, Edit3, CameraOff,
    Loader2, Users, Wifi, WifiOff, RefreshCcw
} from "lucide-react";
import {
    fetchClasses, fetchStudentsByClass, markAttendance,
    Class, Student
} from "@/utils/insforge/client";

// Insforge Edge Function powers the AI engine (Gemini Vision)
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
    (process.env.NEXT_PUBLIC_INSFORGE_BASE_URL
        ? `${process.env.NEXT_PUBLIC_INSFORGE_BASE_URL}/functions/v1/ai-engine`
        : "http://localhost:8000");
const SCAN_INTERVAL_MS = 4000; // 4s intervals (Gemini needs more time)

interface RecognitionResult {
    student_id?: string;
    register_number?: string;
    name?: string;
    photo_url?: string;
    confidence?: number;
    attention_status?: string;
    sleep_score?: number;
    is_unknown?: boolean;
    time?: string;
}

export default function LiveSessionPage() {
    // Session config
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("09:00 AM - Data Structures");
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Camera
    const [isRecording, setIsRecording] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const webcamRef = useRef<Webcam>(null);
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // AI
    const [isScanning, setIsScanning] = useState(false);
    const [aiServiceOnline, setAiServiceOnline] = useState<boolean | null>(null);
    const [recognitionLog, setRecognitionLog] = useState<RecognitionResult[]>([]);
    const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());

    // Stats
    const [presentCount, setPresentCount] = useState(0);
    const [lastScanMs, setLastScanMs] = useState<number | null>(null);

    // Load classes on mount + check AI service health
    useEffect(() => {
        fetchClasses()
            .then(cls => {
                setClasses(cls);
                if (cls.length > 0) setSelectedClassId(cls[0].id);
            })
            .catch(console.error);

        fetch(`${AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) })
            .then(r => setAiServiceOnline(r.ok))
            .catch(() => setAiServiceOnline(false));
    }, []);

    // Load students when class changes
    useEffect(() => {
        if (!selectedClassId) return;
        setLoadingStudents(true);
        setStudents([]);
        setMarkedIds(new Set());
        setRecognitionLog([]);
        setPresentCount(0);
        fetchStudentsByClass(selectedClassId)
            .then(setStudents)
            .catch(console.error)
            .finally(() => setLoadingStudents(false));
    }, [selectedClassId]);

    const handleUserMedia = useCallback(() => {
        setIsCameraReady(true);
        setCameraError(null);
    }, []);

    const handleUserMediaError = useCallback((err: string | DOMException) => {
        const message = typeof err === "string" ? err : err.message;
        if (message.includes("Permission denied") || message.includes("NotAllowedError")) {
            setCameraError("Camera access was denied. Please allow camera permission and refresh.");
        } else if (message.includes("NotFoundError") || message.includes("DevicesNotFoundError")) {
            setCameraError("No camera found. Please connect a webcam and try again.");
        } else {
            setCameraError(`Camera error: ${message}`);
        }
        setIsCameraReady(false);
    }, []);

    // ─── Core recognition scan ────────────────────────────────────────────────
    const doScan = useCallback(async () => {
        if (!webcamRef.current || !isCameraReady || isScanning) return;

        // Build known_faces from students with photo_url (Gemini uses photos, not encodings)
        const knownFaces = students
            .filter(s => s.photo_url)
            .map(s => ({
                student_id: s.id,
                register_number: s.register_number,
                photo_url: s.photo_url,
            }));

        if (knownFaces.length === 0) return; // Nothing to match against

        const screenshot = webcamRef.current.getScreenshot();
        if (!screenshot) return;

        setIsScanning(true);
        const t0 = Date.now();

        try {
            const res = await fetch(`${AI_SERVICE_URL}/api/recognize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_base64: screenshot,
                    known_faces: knownFaces,
                    confidence_threshold: 60,
                }),
                signal: AbortSignal.timeout(25000), // Gemini needs up to 20s
            });

            if (!res.ok) return;
            const data = await res.json();
            setLastScanMs(Date.now() - t0);
            setAiServiceOnline(true);

            // Process each face detected
            for (const face of (data.results || [])) {
                if (!face.match) {
                    // Unknown face
                    setRecognitionLog(prev => [{
                        is_unknown: true,
                        confidence: 0,
                        attention_status: face.attention_status,
                        time: new Date().toLocaleTimeString(),
                    }, ...prev].slice(0, 30));
                    continue;
                }

                const matched: typeof face.match = face.match;
                const studentId = matched.student_id;

                // Find student details
                const student = students.find(s => s.id === studentId);
                if (!student) continue;

                // Add to recognition log (deduplicate)
                setRecognitionLog(prev => {
                    const exists = prev.some(r => r.student_id === studentId);
                    if (exists) return prev;
                    return [{
                        student_id: studentId,
                        register_number: matched.register_number,
                        name: student.name,
                        photo_url: student.photo_url || undefined,
                        confidence: matched.confidence,
                        attention_status: face.attention_status,
                        sleep_score: face.sleep_score,
                        time: new Date().toLocaleTimeString(),
                    }, ...prev].slice(0, 30);
                });

                // Mark attendance in DB (once per student per session)
                if (!markedIds.has(studentId)) {
                    setMarkedIds(prev => new Set([...prev, studentId]));
                    setPresentCount(c => c + 1);
                    markAttendance({
                        student_id: studentId,
                        class_id: selectedClassId,
                        period: selectedPeriod,
                        subject: selectedPeriod.split(" - ")[1] || "",
                        confidence: matched.confidence,
                        attention_status: face.attention_status,
                        sleep_score: face.sleep_score,
                    }).catch(console.error);
                }
            }
        } catch (err) {
            setAiServiceOnline(false);
        } finally {
            setIsScanning(false);
        }
    }, [students, isCameraReady, isScanning, markedIds, selectedClassId, selectedPeriod]);

    // Start / stop scan interval when recording toggles
    useEffect(() => {
        if (isRecording) {
            scanIntervalRef.current = setInterval(doScan, SCAN_INTERVAL_MS);
        } else {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
        }
        return () => {
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        };
    }, [isRecording, doScan]);

    const selectedClass = classes.find(c => c.id === selectedClassId);
    const encodedCount = students.filter(s => s.face_encoding && (s.face_encoding as any[]).length > 0).length;

    return (
        <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] bg-[#0d1117]">
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">

                {/* LEFT: Config Sidebar */}
                <aside className="flex flex-col lg:col-span-3 xl:col-span-2 bg-[#111418] border-b lg:border-b-0 lg:border-r border-white/8 p-5 lg:overflow-y-auto shrink-0">
                    <h3 className="text-base font-bold mb-5 text-white">Session Config</h3>
                    <div className="flex flex-col gap-4 flex-1">

                        {/* Class selector */}
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class</span>
                            <select
                                value={selectedClassId}
                                onChange={e => setSelectedClassId(e.target.value)}
                                className="w-full rounded-xl bg-[#1a1f2e] border border-white/10 text-white px-3 py-2.5 outline-none text-sm"
                            >
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </label>

                        {/* Period */}
                        <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Period / Subject</span>
                            <select
                                value={selectedPeriod}
                                onChange={e => setSelectedPeriod(e.target.value)}
                                className="w-full rounded-xl bg-[#1a1f2e] border border-white/10 text-white px-3 py-2.5 outline-none text-sm"
                            >
                                <option>09:00 AM - Data Structures</option>
                                <option>10:00 AM - Algorithms</option>
                                <option>11:00 AM - Database Systems</option>
                                <option>12:00 PM - Networks</option>
                            </select>
                        </label>

                        {/* System Status */}
                        <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/15">
                            <div className="flex items-center gap-2 mb-3">
                                <Info size={14} className="text-blue-400" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">System Status</span>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Camera</span>
                                    <span className={`font-bold ${isCameraReady ? "text-emerald-400" : cameraError ? "text-red-400" : "text-amber-400"}`}>
                                        {isCameraReady ? "● Active" : cameraError ? "● Error" : "● Init..."}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">AI Engine</span>
                                    {aiServiceOnline === null ? (
                                        <span className="text-amber-400 font-bold">● Checking</span>
                                    ) : aiServiceOnline ? (
                                        <span className="text-emerald-400 font-bold">● Online</span>
                                    ) : (
                                        <span className="text-red-400 font-bold">● Offline</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Students</span>
                                    <span className="text-white font-bold">
                                        {loadingStudents ? "..." : `${encodedCount}/${students.length} encoded`}
                                    </span>
                                </div>
                                {lastScanMs && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Last Scan</span>
                                        <span className="text-white font-mono">{lastScanMs}ms</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Encoding warning */}
                        {!loadingStudents && students.length > 0 && encodedCount === 0 && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                                ⚠ No students have face encodings. Enroll students first from the <Link href="/students" className="underline font-bold">Students page</Link>.
                            </div>
                        )}
                    </div>
                </aside>

                {/* CENTER: Live Camera */}
                <section className="col-span-12 lg:col-span-7 xl:col-span-8 bg-black relative flex flex-col min-h-[500px] shrink-0">
                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-slate-500"}`} />
                            <span className="text-white font-mono text-sm tracking-wider font-bold">
                                {isRecording ? "LIVE SCAN" : "CAMERA READY"}
                            </span>
                            {isScanning && <Loader2 size={14} className="text-blue-400 animate-spin ml-1" />}
                        </div>
                        <div className="flex items-center gap-2">
                            {aiServiceOnline ? (
                                <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded text-emerald-400 text-xs font-bold">
                                    <Wifi size={10} /> AI ACTIVE
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 px-2 py-1 rounded text-red-400 text-xs font-bold">
                                    <WifiOff size={10} /> AI OFFLINE
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                        {cameraError ? (
                            <div className="flex flex-col items-center justify-center gap-4 px-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <CameraOff size={32} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold mb-2">Camera Access Failed</p>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{cameraError}</p>
                                </div>
                                <button
                                    onClick={() => { setCameraError(null); setIsCameraReady(false); }}
                                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Retry Camera
                                </button>
                            </div>
                        ) : (
                            <>
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ width: { ideal: 1280 }, height: { ideal: 720 }, facingMode }}
                                    onUserMedia={handleUserMedia}
                                    onUserMediaError={handleUserMediaError}
                                    className="w-full h-full object-cover"
                                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                                    mirrored={facingMode === "user"}
                                />
                                {!isCameraReady && (
                                    <div className="absolute inset-0 bg-[#0d1117] flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-slate-400 text-sm font-mono">Requesting camera access...</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* AI grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(19,127,236,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(19,127,236,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10" />

                        {/* Scanning ring effect when recording */}
                        {isRecording && isCameraReady && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 border-2 border-blue-500/60 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] pointer-events-none z-20">
                                <div className="absolute -top-6 left-0 bg-blue-600/90 text-white text-[10px] px-2 py-0.5 rounded-t font-mono font-bold">
                                    {isScanning ? "SCANNING..." : "DETECTING"}
                                </div>
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/80 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                            </div>
                        )}

                        {/* Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                            <button
                                onClick={() => setIsRecording(!isRecording)}
                                disabled={!isCameraReady || !aiServiceOnline || students.length === 0}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed ${isRecording
                                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/50"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/50"
                                    }`}
                            >
                                <StopCircle size={20} />
                                {isRecording ? "Stop Session" : "Start Recognition"}
                            </button>
                            <button
                                onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
                                className="flex items-center justify-center p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-white shadow-xl transition-all hover:scale-105"
                                title="Switch Camera"
                            >
                                <RefreshCcw size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="h-14 bg-[#111418] border-t border-white/8 flex items-center justify-between px-5 z-10">
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Class</span>
                                <span className="text-sm font-bold text-white leading-none">{selectedClass?.name || "—"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total</span>
                                <span className="text-sm font-bold text-white leading-none">{students.length}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Present</span>
                                <span className="text-sm font-bold text-emerald-400 leading-none">{presentCount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Absent</span>
                                <span className="text-sm font-bold text-red-400 leading-none">{Math.max(0, students.length - presentCount)}</span>
                            </div>
                        </div>
                        {lastScanMs && (
                            <span className="text-xs text-slate-500 font-mono">{lastScanMs}ms</span>
                        )}
                    </div>
                </section>

                {/* RIGHT: Recognition Log */}
                <aside className="col-span-12 lg:col-span-2 xl:col-span-2 bg-[#111418] border-t lg:border-t-0 lg:border-l border-white/8 flex flex-col min-h-[400px] shrink-0">
                    <div className="p-4 border-b border-white/8 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                            <History className="text-blue-400" size={16} /> Log
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${isRecording ? "bg-red-500/20 text-red-400" : "bg-slate-700 text-slate-400"}`}>
                            {isRecording ? "LIVE" : "IDLE"}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {recognitionLog.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                                <Users size={32} className="text-slate-700" />
                                <p className="text-slate-500 text-xs">Start a session to see recognition results here.</p>
                            </div>
                        ) : (
                            recognitionLog.map((entry, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/3 transition-colors ${entry.is_unknown ? "bg-amber-500/5" : ""}`}>
                                    <div className="relative shrink-0">
                                        {entry.photo_url ? (
                                            <img src={entry.photo_url} alt={entry.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {entry.is_unknown ? "?" : (entry.name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 rounded-full border-2 border-[#111418] p-0.5 ${entry.is_unknown ? "bg-amber-500" : "bg-emerald-500"}`}>
                                            {entry.is_unknown ? <AlertTriangle size={8} className="text-white" /> : <CheckCircle2 size={8} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs font-semibold text-white truncate">
                                                {entry.is_unknown ? "Unknown" : entry.name}
                                            </h4>
                                            {!entry.is_unknown && (
                                                <span className={`text-[10px] font-mono font-bold shrink-0 ml-1 ${(entry.confidence || 0) > 80 ? "text-emerald-400" : "text-amber-400"}`}>
                                                    {entry.confidence?.toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500">
                                            {entry.is_unknown ? "Review needed" : `${entry.register_number} • ${entry.time}`}
                                        </p>
                                        {entry.attention_status && entry.attention_status !== "Attentive" && (
                                            <span className="text-[10px] text-amber-400">⚠ {entry.attention_status}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-white/8">
                        <div className="text-xs text-slate-500 mb-2">
                            {presentCount} of {students.length} marked present
                        </div>
                        <div className="w-full bg-white/8 rounded-full h-1.5 mb-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all"
                                style={{ width: students.length > 0 ? `${(presentCount / students.length) * 100}%` : "0%" }}
                            />
                        </div>
                        <button
                            onClick={() => setIsRecording(false)}
                            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={14} /> Finalize Session
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
