'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  QrCode, User, GraduationCap, 
  ChevronRight, LogOut, Bell, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courseStats, setCourseStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchAttendanceStats = useCallback(async (studentId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/student/stats/${studentId}`);
      setCourseStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Initial Fetch
    fetchAttendanceStats(parsedUser.profileId);

    // REFRESH LOGIC: Listen for window focus
    // This triggers when the user returns to this tab after scanning
    const onFocus = () => fetchAttendanceStats(parsedUser.profileId);
    window.addEventListener('focus', onFocus);
    
    return () => window.removeEventListener('focus', onFocus);
  }, [router, fetchAttendanceStats]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-900 font-[family-name:var(--font-geist-sans)]">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-blue-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Layout size={18}/>
          </div>
          <span className="font-black text-sm tracking-tighter text-blue-900 uppercase">SmartAttend</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 p-2 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout} 
            className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </nav>

      <main className="p-6 space-y-8 pb-32 max-w-2xl mx-auto">
        {/* Profile Header */}
        <header className="flex items-center gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
            <User size={30} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 leading-none">{user.name}</h2>
            <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">
              {user.student?.matricNo || 'MATRIC NO PENDING'}
            </p>
          </div>
        </header>

        {/* Scan FAB (Floating Action Button style) */}
        <motion.button 
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/scan')}
          className="w-full bg-blue-600 text-white p-8 rounded-[2.5rem] font-black text-xl flex flex-col items-center justify-center gap-3 shadow-2xl shadow-blue-300 relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <QrCode size={140} />
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <QrCode size={32} />
          </div>
          <span className="relative z-10">Scan Attendance</span>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70 relative z-10">Tap to open camera</p>
        </motion.button>

        {/* Course Statistics Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-lg text-slate-700 flex items-center gap-2">
              <GraduationCap size={22} className="text-blue-600" /> My Courses
            </h3>
            <button 
              onClick={() => fetchAttendanceStats(user.profileId)}
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white animate-pulse rounded-[2rem] border border-slate-100" />
              ))
            ) : (
              <AnimatePresence mode='popLayout'>
                {courseStats.length > 0 ? (
                  courseStats.map((course) => (
                    <CourseCard key={course.code} course={course} />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100"
                  >
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-400 font-bold">No attendance records yet.</p>
                    <p className="text-slate-300 text-xs mt-1">Your courses will appear here once you scan.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const getHealthColor = (percent: number) => {
    if (percent >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (percent >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-5 rounded-[2.2rem] border border-blue-50 shadow-sm flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors ${getHealthColor(course.percentage)}`}>
           <span className="text-lg font-black leading-none">{course.percentage}%</span>
           <span className="text-[7px] font-black uppercase tracking-tighter">Stats</span>
        </div>
        <div>
          <h4 className="font-black text-slate-800 tracking-tight text-lg uppercase leading-tight">{course.code}</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">
            {course.attended} / {course.total} Sessions
          </p>
        </div>
      </div>
      <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
        <ChevronRight size={18} />
      </div>
    </motion.div>
  );
}