"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, VideoOff, WifiOff, Users, AlertCircle, PlayCircle, StopCircle, Maximize2 } from "lucide-react";

export default function LiveSessionPage() {
    const [streamActive, setStreamActive] = useState<boolean>(false);
    const [imgUrl, setImgUrl] = useState<string>("");

    // Hardcoded URL fallback in case NEXT_PUBLIC_AI_SERVICE_URL is missing
    const aiBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

    const startCamera = () => {
        // Force refresh the image by appending a timestamp
        setImgUrl(`${aiBaseUrl}/video_feed?t=${new Date().getTime()}`);
        setStreamActive(true);
    };

    const stopCamera = async () => {
        try {
            await fetch(`${aiBaseUrl}/stop_camera`, { method: "POST" });
        } catch (e) {
            console.error("Failed to stop camera on backend:", e);
        }
        setStreamActive(false);
        setImgUrl("");
    };

    return (
        <div className="flex-1 overflow-y-auto w-full bg-background-light dark:bg-background-dark p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link><span>/</span>
                            <span className="text-slate-900 dark:text-white font-medium">Live Session</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Real-Time Monitoring</h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm leading-relaxed mt-1">
                            View the live AI camera feed with bounding boxes, face recognition, and anomaly detection.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!streamActive ? (
                            <button onClick={startCamera} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all">
                                <PlayCircle size={20} /> Start Camera
                            </button>
                        ) : (
                            <button onClick={stopCamera} className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-red-600 transition-all">
                                <StopCircle size={20} /> Stop Camera
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                    {/* Camera Feed Column */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center min-h-[500px] aspect-video">
                            {streamActive && imgUrl ? (
                                <img
                                    src={imgUrl}
                                    alt="Live AI Camera Feed"
                                    className="w-full h-full object-contain bg-black"
                                    onError={(e) => {
                                        console.error("Stream error", e);
                                        setStreamActive(false);
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-slate-500">
                                    <VideoOff size={64} className="opacity-50" />
                                    <div className="text-center">
                                        <h3 className="font-bold text-lg text-slate-300">Camera Inactive</h3>
                                        <p className="text-sm mt-1">Click 'Start Camera' to connect to the AI Backend.</p>
                                    </div>
                                </div>
                            )}

                            {/* Overlays */}
                            {streamActive && (
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-white text-xs font-bold tracking-wider">LIVE RECORDING</span>
                                </div>
                            )}
                            {streamActive && (
                                <button className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md p-2.5 rounded-lg text-white transition-colors">
                                    <Maximize2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats & Info Column */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users size={18} className="text-primary" /> Session Stats
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center pb-3 border-b border-border-light dark:border-slate-800">
                                    <span className="text-slate-500 text-sm font-medium">Auto-Marked</span>
                                    <span className="text-slate-900 dark:text-white font-black text-emerald-500">Active</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-border-light dark:border-slate-800">
                                    <span className="text-slate-500 text-sm font-medium">Face Processing</span>
                                    <span className="text-slate-900 dark:text-white font-black">Python AI</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-slate-800 rounded-2xl p-5 shadow-sm flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-orange-500" /> Recent Alerts
                            </h3>

                            <div className="flex flex-col gap-3">
                                {streamActive ? (
                                    <p className="text-xs text-slate-500 italic text-center mt-10">Check the AI Validation page for anomaly logs.</p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-10 gap-2">
                                        <WifiOff size={32} className="opacity-50" />
                                        <p className="text-xs font-medium">Offline</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
