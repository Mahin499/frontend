"use client";

import Link from "next/link";
import {
    Users,
    GraduationCap,
    Target,
    AlertTriangle,
    TrendingUp,
    Download,
    ChevronRight,
    UserPlus,
    FileText,
    Settings,
    Calendar,
    Clock,
    Loader2
} from "lucide-react";
import { useStudentCount, useFacultyCount, usePendingApprovals } from "@/utils/insforge/realtime";
import { useState } from "react";
import dynamic from "next/dynamic";
import { RobotState } from "@/components/SplineRobot";

// Dynamically import SplineRobot to prevent SSR issues and avoid blocking main bundle load
const SplineRobot = dynamic(() => import("@/components/SplineRobot"), {
    ssr: false,
});

export default function DashboardPage() {
    const studentCount = useStudentCount();
    const facultyCount = useFacultyCount();
    const pendingApprovals = usePendingApprovals();

    // Modal State for Event Details
    const [showEventModal, setShowEventModal] = useState(false);

    // Robot State
    const [robotState, setRobotState] = useState<RobotState>("idle");
    const [isRobotMinimized, setIsRobotMinimized] = useState(false);

    // Mock event handler to trigger robot states
    const triggerRobotEvent = (state: RobotState) => {
        setRobotState(state);
        // Reset to idle after 4 seconds
        setTimeout(() => setRobotState("idle"), 4000);
    };

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 w-full min-w-0">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Students */}
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-primary">
                                <Users size={24} />
                            </div>
                            <span className="flex items-center text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs font-bold">
                                <TrendingUp size={14} className="mr-1" />
                                +1.2%
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Students</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                            {studentCount === null ? <Loader2 size={22} className="animate-spin text-primary" /> : studentCount.toLocaleString()}
                        </h3>
                    </div>

                    {/* Total Faculty */}
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-violet-600 dark:text-violet-400">
                                <GraduationCap size={24} />
                            </div>
                            <span className="flex items-center text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold">
                                0%
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Faculty</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                            {facultyCount === null ? <Loader2 size={22} className="animate-spin text-violet-400" /> : facultyCount}
                            {pendingApprovals !== null && pendingApprovals > 0 && (
                                <Link href="/faculty" className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full hover:bg-amber-400/20 transition-colors">{pendingApprovals} pending</Link>
                            )}
                        </h3>
                    </div>

                    {/* Avg Attendance */}
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Target size={24} />
                            </div>
                            <span className="flex items-center text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs font-bold">
                                <TrendingUp size={14} className="mr-1" />
                                +0.5%
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Attendance</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">92%</h3>
                    </div>

                    {/* Anomaly Alerts */}
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                                <AlertTriangle size={24} />
                            </div>
                            <span className="flex items-center text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-xs font-bold">
                                <AlertTriangle size={14} className="mr-1" />
                                Action Needed
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium relative z-10">Anomaly Alerts</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 relative z-10">3</h3>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-w-0">
                    {/* Left Column: Chart */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-time Institute Overview</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Attendance trends across departments today</p>
                                </div>
                                <div className="flex gap-2">
                                    <select className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2 border-none focus:ring-1 focus:ring-primary outline-none">
                                        <option>All Departments</option>
                                        <option>Science</option>
                                        <option>Arts</option>
                                        <option>Engineering</option>
                                    </select>
                                    <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors">
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-[300px] w-full relative">
                                {/* Graph SVG Visualization */}
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#137fec" stopOpacity="0.2"></stop>
                                            <stop offset="100%" stopColor="#137fec" stopOpacity="0"></stop>
                                        </linearGradient>
                                    </defs>
                                    {/* Grid Lines */}
                                    <line opacity="0.3" stroke="#2d3748" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
                                    <line opacity="0.3" stroke="#2d3748" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="190" y2="190"></line>
                                    <line opacity="0.3" stroke="#2d3748" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="130" y2="130"></line>
                                    <line opacity="0.3" stroke="#2d3748" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="70" y2="70"></line>
                                    {/* The Chart Area */}
                                    <path d="M0,250 C100,250 100,150 200,130 C300,110 300,80 400,90 C500,100 500,60 600,50 C700,40 700,100 800,90 V300 H0 Z" fill="url(#chartGradient)"></path>
                                    {/* The Chart Line */}
                                    <path d="M0,250 C100,250 100,150 200,130 C300,110 300,80 400,90 C500,100 500,60 600,50 C700,40 700,100 800,90" fill="none" stroke="#137fec" strokeLinecap="round" strokeWidth="3"></path>
                                    {/* Data Points */}
                                    <circle cx="200" cy="130" fill="#137fec" r="4" stroke="white" strokeWidth="2"></circle>
                                    <circle cx="400" cy="90" fill="#137fec" r="4" stroke="white" strokeWidth="2"></circle>
                                    <circle cx="600" cy="50" fill="#137fec" r="4" stroke="white" strokeWidth="2"></circle>
                                </svg>
                                {/* Time Labels */}
                                <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                                    <span>8 AM</span>
                                    <span>10 AM</span>
                                    <span>12 PM</span>
                                    <span>2 PM</span>
                                    <span>4 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Table */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm min-w-0">
                            <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Entries</h3>
                                <Link href="/reports/whole-day" className="text-primary text-sm font-medium hover:underline">View All</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                                                        MC
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Michael Chen</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Student</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">09:42 AM</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">On Time</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                                                        SJ
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Sarah Jenkins</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Faculty</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">09:45 AM</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">Late</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Actions & Alerts */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link href="/faculty/pending" className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary">
                                            <UserPlus size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Approve Faculty</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 group-hover:text-primary" />
                                </Link>
                                <Link href="/reports/monthly" className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                            <FileText size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Generate Monthly Report</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 group-hover:text-primary" />
                                </Link>
                                <Link href="/settings" className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                            <Settings size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Institute Settings</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400 group-hover:text-primary" />
                                </Link>
                            </div>
                        </div>

                        {/* Anomalies List */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Anomalies</h3>
                                <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">3 New</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-3 items-start pb-4 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Unexpected Absence Spike</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grade 11-B shows 45% absence today.</p>
                                        <Link href="/reports/whole-day" className="text-xs font-semibold text-primary mt-2 hover:underline inline-block">Investigate</Link>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start pb-4 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Unrecognized ID</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gate 3 Sensor detected unknown ID card.</p>
                                        <Link href="/ai-validation" className="text-xs font-semibold text-primary mt-2 hover:underline inline-block">View Log</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Calendar Snippet */}
                        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Next Event</p>
                                    <h3 className="text-xl font-bold mt-1">Faculty Meeting</h3>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                    <Calendar size={20} className="text-white" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} className="text-blue-100" />
                                <p className="text-sm text-blue-50">Today, 2:00 PM - 3:30 PM</p>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden mb-4">
                                <div className="h-8 w-8 rounded-full ring-2 ring-blue-600 bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">JD</div>
                                <div className="h-8 w-8 rounded-full ring-2 ring-blue-600 bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold">AS</div>
                                <div className="h-8 w-8 rounded-full ring-2 ring-blue-600 bg-white/20 flex items-center justify-center text-xs font-medium text-white">+5</div>
                            </div>
                            <button onClick={() => setShowEventModal(true)} className="block w-full py-2 bg-white text-primary font-semibold rounded-lg text-sm hover:bg-blue-50 transition-colors text-center">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Assistant Robot Integration */}
            <div
                className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out flex flex-col items-end ${isRobotMinimized ? "translate-y-[180px]" : "translate-y-0"}`}
            >
                {/* Robot Controls / Tooltip */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-3 mb-4 max-w-[250px] transition-opacity opacity-100 hover:opacity-100 group-hover:opacity-100 hidden md:block">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Assistant</p>
                        <button
                            onClick={() => setIsRobotMinimized(!isRobotMinimized)}
                            className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                        >
                            {isRobotMinimized ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="12" x2="6" y2="12"></line></svg>
                            )}
                        </button>
                    </div>
                    {!isRobotMinimized && (
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Trigger test events:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => triggerRobotEvent("attendance")} className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 py-1 px-2 rounded font-medium transition-colors">Mark Attend</button>
                                <button onClick={() => triggerRobotEvent("happy")} className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-2 rounded font-medium transition-colors">Student In</button>
                                <button onClick={() => triggerRobotEvent("alert")} className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-200 py-1 px-2 rounded font-medium transition-colors">Drowsy</button>
                                <button onClick={() => triggerRobotEvent("warning")} className="text-[10px] bg-red-100 text-red-700 hover:bg-red-200 py-1 px-2 rounded font-medium transition-colors">Unknown</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* The Robot Itself */}
                <div className="w-[200px] h-[200px] relative w-full h-full lg:w-[250px] lg:h-[250px] rounded-full drop-shadow-2xl">
                    <SplineRobot robotState={robotState} />
                </div>
            </div>

            {/* Event Details Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Faculty Meeting</h2>
                                <p className="text-sm text-slate-500 mt-1">Today, 2:00 PM - 3:30 PM</p>
                            </div>
                            <button onClick={() => setShowEventModal(false)} className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Participants</p>
                                <div className="flex gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">JD</div>
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">AS</div>
                                    <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">+5</div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Agenda</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    <li>Term 2 Syllabus Review</li>
                                    <li>AI Attendance System Feedback</li>
                                    <li>Upcoming Student Assessments</li>
                                </ul>
                            </div>
                        </div>

                        <button onClick={() => setShowEventModal(false)} className="mt-6 w-full py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
