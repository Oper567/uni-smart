'use client';
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <QrCode className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">UniSmart</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} />
              <span>Next-Gen Attendance</span>
            </div>
            
            <h1 className="text-6xl font-black text-slate-900 leading-[1.1] mb-6">
              Attendance tracking, <br />
              <span className="text-indigo-600">reimagined.</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
              Eliminate paper sheets and proxy attendance. UniSmart uses secure QR technology 
              to make classroom management effortless for lecturers and students.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                href="/register" 
                className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100"
              >
                Start Using Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} />
                <span className="text-sm font-medium">Secure JWT Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Real-time Sync</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual (Animated Element) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-indigo-100/50 rounded-full blur-3xl" />
            <div className="relative bg-white border border-slate-100 shadow-2xl rounded-[2rem] p-8 aspect-square flex flex-col items-center justify-center">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 bg-slate-50 border-4 border-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"
              >
                <QrCode size={100} className="text-indigo-600" />
              </motion.div>
              <div className="mt-8 text-center">
                <p className="font-bold text-slate-900">Scan to mark present</p>
                <p className="text-slate-400 text-sm">Instant verification enabled</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}