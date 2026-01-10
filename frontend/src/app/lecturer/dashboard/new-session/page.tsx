'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { ChevronLeft, ShieldCheck, BookOpen, AlertCircle, Users, CheckCircle2, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
          const res = await api.get(`/session/${sessionId}/count`);
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
    <div className="min-h-screen bg-white text-black font-[family-name:var(--font-geist-sans)] flex flex-col">
      {/* Mobile Top Bar */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="p-3 bg-black text-white rounded-2xl active:scale-90 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Attendance System</p>
          <h1 className="font-black text-lg">New Session</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-10">
        {!qrToken ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex-1 flex flex-col justify-center space-y-8"
          >
            <div className="space-y-2 text-center">
              <div className="bg-black/5 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter">Select Course</h2>
              <p className="text-sm text-black/50">Pick the class you want to record</p>
            </div>
            
            {assignedCourses.length > 0 ? (
              <div className="space-y-4">
                <div className="relative">
                  <select 
                    className="w-full p-6 bg-white border-4 border-black rounded-[2rem] text-center text-2xl font-black uppercase appearance-none outline-none focus:ring-4 focus:ring-black/5 transition-all"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  >
                    {assignedCourses.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={startSession}
                  disabled={loading}
                  className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? "Initializing..." : <>Generate Code <QrCode size={20} /></>}
                </button>
              </div>
            ) : (
              <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-center gap-4 text-red-700">
                <AlertCircle className="shrink-0" />
                <p className="text-sm font-bold">No assigned courses found.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex-1 flex flex-col items-center justify-between"
          >
            {/* Live Status Pill */}
            <div className="w-full flex justify-between items-center bg-black text-white p-6 rounded-[2.5rem]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Live Session</span>
              </div>
              <div className="flex items-center gap-2 font-black">
                <Users size={18} />
                <span className="text-lg">{attendanceCount}</span>
              </div>
            </div>

            {/* QR Section */}
            <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
              <div>
                <h2 className="text-6xl font-black tracking-tighter mb-2">{courseCode}</h2>
                <div className="flex items-center justify-center gap-2 text-black/40">
                  <ShieldCheck size={14} className="text-black" /> 
                  <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted QR Active</span>
                </div>
              </div>

              <div className="p-4 bg-white border-[10px] border-black/5 rounded-[3rem] shadow-sm inline-block mx-auto">
                <QRCodeSVG value={qrToken} size={260} level="H" includeMargin={true} />
              </div>
            </div>

            {/* End Session Button */}
            <button 
              onClick={() => router.push('/lecturer/dashboard')}
              className="w-full bg-black text-white py-6 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              <CheckCircle2 size={22} /> End & View Results
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}