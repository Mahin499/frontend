import Link from "next/link";
import {
  LogIn,
  UserPlus,
  Unlock,
  ShieldCheck,
  School,
  Video,
  Cpu,
  Users,
  BookOpen,
  CalendarDays,
  Clock,
  CalendarRange
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">

      {/* Top Nav */}
      <nav className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">face</span>
          </div>
          <div>
            <span className="font-black text-lg text-white">SmartAI Attendance</span>
            <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20 font-semibold">
              LIVE SYSTEM
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 text-sm">
            <LogIn size={18} /> Sign In
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <Cpu size={14} />
          Powered by Gemini AI • OpenCV • face_recognition
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Smart AI</span><br />
          <span className="text-white">Attendance System</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Production-ready attendance platform with AI face recognition, sleep detection, Gemini validation,
          role-based access, and advanced analytics.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <NavCard href="/login" icon={<LogIn className="text-primary" />} title="Login" desc="Secure JWT auth with Principal / Faculty role toggle." color="primary" />
        <NavCard href="/register" icon={<UserPlus className="text-emerald-400" />} title="Register" desc="Principal & Faculty registration with institute creation." color="emerald" />
        <NavCard href="/forgot-password" icon={<Unlock className="text-slate-300" />} title="Reset Password" desc="Secure multi-step password reset flow." color="slate" />
        <NavCard href="/dashboard" icon={<ShieldCheck className="text-primary" />} title="Principal Dashboard" desc="Institute-wide stats and anomaly alerts." color="primary" badge="PRINCIPAL" />
        <NavCard href="/faculty" icon={<School className="text-violet-400" />} title="Faculty Dashboard" desc="Class-specific attendance and sleep analytics." color="violet" badge="FACULTY" />
        <NavCard href="/session" icon={<Video className="text-red-400" />} title="Live AI Session" desc="Real-time face detection with 98%+ confidence." color="red" badge="LIVE" />
        <NavCard href="/ai-validation" icon={<Cpu className="text-indigo-400" />} title="AI Validation Queue" desc="Review flagged anomalies via Gemini AI." color="indigo" badge="GEMINI AI" />
        <NavCard href="/students" icon={<Users className="text-teal-400" />} title="Student Management" desc="Enroll via CSV & ZIP bulk upload." color="teal" />
        <NavCard href="/classes" icon={<BookOpen className="text-amber-400" />} title="Class Management" desc="Create classes and view per-class stats." color="amber" />
        <NavCard href="/reports/daily" icon={<CalendarDays className="text-green-400" />} title="Whole-Day Report" desc="Full day log with export options." color="green" />
        <NavCard href="/reports/period" icon={<Clock className="text-orange-400" />} title="Period-Wise Report" desc="Confidence scores and sleep detection data." color="orange" />
        <NavCard href="/reports/monthly" icon={<CalendarRange className="text-pink-400" />} title="Monthly Report" desc="Institute-wide monthly analytics." color="pink" />
      </div>

    </div>
  );
}

function NavCard({ href, icon, title, desc, color, badge }: any) {
  const colorMap: Record<string, string> = {
    primary: "border-primary/30 bg-primary/20 hover:border-primary/40 text-primary",
    emerald: "border-emerald-500/30 bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400",
    slate: "border-slate-600 bg-slate-700/50 hover:border-slate-500 text-slate-300",
    violet: "border-violet-500/30 bg-violet-500/20 hover:border-violet-500/40 text-violet-400",
    red: "border-red-500/30 bg-red-500/20 hover:border-red-500/40 text-red-400",
    indigo: "border-indigo-500/30 bg-indigo-500/20 hover:border-indigo-500/40 text-indigo-400",
    teal: "border-teal-500/30 bg-teal-500/20 hover:border-teal-500/40 text-teal-400",
    amber: "border-amber-500/30 bg-amber-500/20 hover:border-amber-500/40 text-amber-400",
    green: "border-green-500/30 bg-green-500/20 hover:border-green-500/40 text-green-400",
    orange: "border-orange-500/30 bg-orange-500/20 hover:border-orange-500/40 text-orange-400",
    pink: "border-pink-500/30 bg-pink-500/20 hover:border-pink-500/40 text-pink-400",
  };

  return (
    <Link href={href} className={`group relative p-6 rounded-2xl border border-slate-800 bg-[#111418] block transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110 ${colorMap[color]}`}>
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>

      <div className="mt-auto flex items-center justify-between text-xs font-semibold">
        {badge && (
          <span className={`px-2 py-0.5 rounded bg-surface-dark border border-border-dark ${colorMap[color].split(' ')[4]}`}>
            {badge}
          </span>
        )}
        <span className={`flex items-center gap-1 ${colorMap[color].split(' ')[4]}`}>
          Open Page <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </span>
      </div>
    </Link>
  );
}
