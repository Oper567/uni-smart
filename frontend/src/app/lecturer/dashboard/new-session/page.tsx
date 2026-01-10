'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { ChevronLeft, ShieldCheck, BookOpen, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NewSession() {
  const [courseCode, setCourseCode] = useState('');
  const [assignedCourses, setAssignedCourses] = useState<string[]>([]);
  const [qrToken, setQrToken] = useState('');
  const [sessionId, setSessionId] = useState(''); // Store ID to track count
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { courses } = JSON.parse(userData);
      setAssignedCourses(courses || []);
      if (courses?.length > 0) setCourseCode(courses[0]);
    }
  }, []);

  // Polling for live attendance count
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrToken && sessionId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/session/${sessionId}/count`);
          setAttendanceCount(res.data.count);
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [qrToken, sessionId]);

  const startSession = async () => {
    if (!courseCode) return;
    setLoading(true);
    try {
      const res = await api.post('/session/start', { courseCode });
      setQrToken(res.data.token);
      setSessionId(res.data.sessionId);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to start session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-[family-name:var(--font-geist-sans)]">
      <button 
        onClick={() => router.back()} 
        className="mb-8 flex items-center gap-2 text-slate-400 font-bold hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="max-w-2xl mx-auto">
        {!qrToken ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center space-y-8">
            <div className="bg-blue-100 p-4 rounded-3xl text-blue-600 w-fit mx-auto">
              <BookOpen size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Start Session</h2>
            
            {assignedCourses.length > 0 ? (
              <div className="space-y-6">
                <select 
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-center text-2xl font-black uppercase appearance-none outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                >
                  {assignedCourses.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <button 
                  onClick={startSession}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-30 transition-all"
                >
                  {loading ? "Generating Security Token..." : "Generate QR Code"}
                </button>
              </div>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4 text-amber-700 text-left">
                <AlertCircle className="shrink-0" />
                <p className="text-sm font-medium">No courses assigned to your profile. Contact Admin.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center space-y-8">
            <div className="flex justify-between w-full items-center bg-slate-50 p-4 rounded-3xl px-8">
               <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="font-black text-xs uppercase tracking-widest">Live</span>
               </div>
               <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Users size={18} />
                  <span>{attendanceCount} Students Joined</span>
               </div>
            </div>

            <div className="text-center">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{courseCode}</h2>
            </div>
            
            <div className="p-6 bg-white border-[16px] border-slate-50 rounded-[3rem]">
              <QRCodeSVG value={qrToken} size={280} level="H" />
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-medium bg-slate-50 px-6 py-2 rounded-full">
              <ShieldCheck className="text-emerald-500" size={18} /> 
              <span className="text-xs">Dynamic Encryption Active</span>
            </div>

            <button 
              onClick={() => router.push('/lecturer/dashboard')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all"
            >
              <CheckCircle2 /> End Session & View Report
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}