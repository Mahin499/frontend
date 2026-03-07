import Link from "next/link";
import { LogIn, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

      {/* 1. Header */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-24 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500 text-xl">face</span>
          </div>
          <div>
            <span className="font-black text-xl text-white tracking-tight">SmartAI Attendance</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <a href="#about" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">About</a>
          <a href="#vision" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Vision</a>
          <a href="#mission" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Mission</a>
          <Link href="/login" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 text-sm ml-2">
            <LogIn size={18} /> Sign In
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="text-center mb-32 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
          <Cpu size={14} />
          Powered by Gemini AI • OpenCV • face_recognition
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
          <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">Smart AI</span><br />
          <span className="text-white">Attendance System</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          AI-powered attendance platform with face recognition, sleep detection, classroom analytics, and intelligent validation.
        </p>
      </section>

      {/* 3. About Section */}
      <section id="about" className="mb-32 max-w-4xl mx-auto text-center scroll-mt-24">
        <h2 className="text-3xl lg:text-4xl font-black text-white mb-8">About the System</h2>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-6 font-medium relative z-10">
            SmartAI Attendance is an AI-powered classroom monitoring system that automatically records student attendance using face recognition technology. The system also analyzes student alertness and classroom engagement using computer vision and machine learning.
          </p>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed relative z-10">
            It provides real-time insights for faculty and advanced analytics for institutional management.
          </p>
        </div>
      </section>

      {/* 4. Vision Section */}
      <section id="vision" className="mb-32 max-w-4xl mx-auto text-center scroll-mt-24">
        <h2 className="text-3xl lg:text-4xl font-black text-white mb-8">Our Vision</h2>
        <div className="bg-gradient-to-br from-blue-900/20 to-violet-900/10 border border-blue-500/20 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <p className="text-blue-100 text-lg md:text-xl leading-relaxed font-medium relative z-10">
            To create intelligent classrooms where artificial intelligence improves transparency, engagement, and academic performance through automated monitoring and analytics.
          </p>
        </div>
      </section>

      {/* 5. Mission Section */}
      <section id="mission" className="mb-32 max-w-4xl mx-auto text-center scroll-mt-24">
        <h2 className="text-3xl lg:text-4xl font-black text-white mb-8">Our Mission</h2>
        <div className="bg-gradient-to-br from-violet-900/20 to-pink-900/10 border border-violet-500/20 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <p className="text-violet-100 text-lg md:text-xl leading-relaxed font-medium relative z-10">
            To simplify classroom management using AI technologies that automate attendance, monitor student engagement, and provide meaningful insights for educators and institutions.
          </p>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-white/10 pt-10 pb-6 text-center">
        <p className="text-slate-500 text-sm font-medium">
          © 2026 SmartAI Attendance System.
        </p>
      </footer>

    </div>
  );
}
