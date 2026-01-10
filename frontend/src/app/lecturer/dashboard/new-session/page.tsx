'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { ChevronLeft, ShieldCheck, BookOpen, AlertCircle, Users, CheckCircle2, QrCode, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewSession() {
  const [courseCode, setCourseCode] = useState('');
  const [assignedCourses, setAssignedCourses] = useState<string[]>([]);
  const [qrToken, setQrToken] = useState('');
  const [sessionId, setSessionId] = useState('');
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrToken && sessionId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/session/count/${sessionId}`);
          setAttendanceCount(res.data.count);
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-[family-name:var(--font-geist-sans)] flex flex-col">
      {/* Mobile Top Bar */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()} 
          className="p-3 bg-white text-slate-600 rounded-2xl shadow-sm border border-slate-100 transition-all"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">SmartAttend</p>
          <h1 className="font-black text-lg text-slate-800">Attendance</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-10">
        <AnimatePresence mode="wait">
          {!qrToken ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col justify-center space-y-8"
            >
              <div className="space-y-2 text-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200"
                >
                  <BookOpen size={32} className="text-white" />
                </motion.div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-800">Start Session</h2>
                <p className="text-sm text-slate-500">Select your course to begin</p>
              </div>
              
              {assignedCourses.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative">
                    <select 
                      className="w-full p-6 bg-white border-2 border-slate-100 rounded-[2rem] text-center text-2xl font-black uppercase appearance-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    >
                      {assignedCourses.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={startSession}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><Sparkles className="animate-spin" size={20} /> Loading...</span>
                    ) : (
                      <>Generate QR <QrCode size={20} /></>
                    )}
                  </motion.button>
                </div>
              ) : (
                <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-[2rem] flex items-center gap-4 text-amber-700">
                  <AlertCircle className="shrink-0" />
                  <p className="text-sm font-bold">No courses assigned to your staff profile.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex-1 flex flex-col items-center justify-between"
            >
              {/* Live Status Pill */}
              <div className="w-full flex justify-between items-center bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-lg shadow-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="font-black text-[10px] uppercase tracking-[0.2em]">Live Session</span>
                </div>
                <div className="flex items-center gap-2 font-black">
                  <Users size={18} className="text-blue-400" />
                  <span className="text-xl">{attendanceCount}</span>
                </div>
              </div>

              {/* QR Section */}
              <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-6xl font-black tracking-tighter mb-2 text-slate-900">{courseCode}</h2>
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <ShieldCheck size={14} className="text-emerald-500" /> 
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure QR Protocol</span>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 0.5, 0, -0.5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="p-6 bg-white border-[10px] border-slate-100 rounded-[3.5rem] shadow-2xl shadow-slate-200 inline-block mx-auto"
                >
                  {/* QR Code set to #000000 (Black) */}
                  <QRCodeSVG 
                    value={qrToken} 
                    size={260} 
                    level="H" 
                    includeMargin={true} 
                    fgColor="#000000" 
                  />
                </motion.div>
                
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">
                  Scanning active for 15 minutes
                </p>
              </div>

              {/* End Session Button */}
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/lecturer/dashboard')}
                className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all"
              >
                <CheckCircle2 size={22} /> End & View Results
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}