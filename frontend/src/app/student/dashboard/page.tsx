'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  QrCode, User, GraduationCap, MapPin, 
  ChevronRight, LogOut, Bell, Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courseStats, setCourseStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchAttendanceStats(parsedUser.profileId);
  }, [router]);

  const fetchAttendanceStats = async (studentId: string) => {
    try {
      // Endpoint returns attendance % for each course the student is involved in
      const res = await api.get(`/student/stats/${studentId}`);
      setCourseStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-900 font-[family-name:var(--font-geist-sans)]">
      {/* Dynamic Nav */}
      <nav className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-blue-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Layout size={18}/>
          </div>
          <span className="font-black text-sm tracking-tighter text-blue-900 uppercase">SmartAttend</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 p-2"><Bell size={20} /></button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout} 
            className="text-red-500 bg-red-50 p-2 rounded-lg"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </nav>

      <main className="p-6 space-y-8 pb-32">
        {/* Profile Header */}
        <header className="flex items-center gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-4 border-white shadow-inner">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 leading-none">{user.name}</h2>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tighter">{user.student?.matricNo || 'Student'}</p>
          </div>
        </header>

        {/* Scan Floating Action Button */}
        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/scan')}
          className="w-full bg-blue-600 text-white p-8 rounded-[2.5rem] font-black text-xl flex flex-col items-center justify-center gap-3 shadow-2xl shadow-blue-300 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
            <QrCode size={120} />
          </div>
          <div className="bg-white/20 p-3 rounded-2xl mb-1">
            <QrCode size={32} />
          </div>
          <span>Scan to Sign-in</span>
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60">Ready for scan</p>
        </motion.button>

        {/* Course Grid */}
        <section className="space-y-4">
          <h3 className="font-black text-lg text-slate-700 flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-500" /> My Courses
          </h3>
          
          <div className="grid gap-4">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-[2rem]" />)
            ) : courseStats.length > 0 ? (
              courseStats.map((course) => (
                <CourseCard key={course.code} course={course} />
              ))
            ) : (
              <div className="bg-white p-10 rounded-[2.5rem] text-center border-2 border-dashed border-blue-100">
                <p className="text-slate-400 font-bold">No active courses found.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const getHealthColor = (percent: number) => {
    if (percent >= 75) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (percent >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-5 rounded-[2.2rem] border border-blue-50 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border ${getHealthColor(course.percentage)}`}>
           <span className="text-lg font-black leading-none">{course.percentage}%</span>
           <span className="text-[7px] font-black uppercase">Presence</span>
        </div>
        <div>
          <h4 className="font-black text-slate-800 tracking-tight text-lg uppercase">{course.code}</h4>
          <p className="text-slate-400 text-xs font-bold">{course.attended} of {course.total} Sessions</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </motion.div>
  );
}