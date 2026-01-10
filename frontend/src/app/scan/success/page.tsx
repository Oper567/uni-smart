'use client';
import { Suspense } from 'react'; // 👈 Import Suspense
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, GraduationCap, Calendar, Clock, ArrowRight } from 'lucide-react';

// 1. Move the logic into a sub-component
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const courseCode = searchParams.get('course') || 'N/A';
  const percentage = parseInt(searchParams.get('percent') || '0');

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
      {/* Animated Checkmark */}
      <motion.div 
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        className="bg-emerald-500 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-200"
      >
        <CheckCircle2 size={64} className="text-white" />
      </motion.div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Attendance Recorded!</h1>
        <p className="text-slate-500 font-medium">Your presence has been successfully verified.</p>
      </div>

      {/* Attendance Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 space-y-6"
      >
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Course Code</span>
            <p className="text-2xl font-black text-slate-800 uppercase">{courseCode}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-3xl text-blue-600">
            <GraduationCap size={28} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-slate-400">Total Attendance</span>
            <span className="text-xl font-black text-blue-600">{percentage}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <Calendar size={14} className="text-blue-400" />
            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <Clock size={14} className="text-blue-400" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => router.replace('/student/dashboard')}
        className="w-full max-w-sm bg-slate-900 text-white p-6 rounded-[2.2rem] font-black flex items-center justify-center gap-3 shadow-2xl"
      >
        Back to Dashboard <ArrowRight size={20} />
      </motion.button>
    </main>
  );
}

// 2. The default export wraps it in Suspense
export default function ScanSuccess() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-[family-name:var(--font-geist-sans)]">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}