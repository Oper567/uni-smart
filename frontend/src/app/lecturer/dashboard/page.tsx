'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, LogOut, Users, BookOpen, Layout, 
  History, FileSpreadsheet, FileText, Loader2, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function LecturerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchSessions(parsedUser.profileId);
  }, [router]);

  const fetchSessions = async (lecturerId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/session/lecturer/${lecturerId}`);
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const exportFile = async (sessionId: string, courseCode: string, type: 'csv' | 'pdf') => {
    setExporting(`${sessionId}-${type}`);
    try {
      const response = await api.get(`/session/export/${type}/${sessionId}`, { 
        responseType: 'blob' 
      });
      
      const blobType = type === 'csv' ? 'text/csv' : 'application/pdf';
      const extension = type === 'csv' ? 'csv' : 'pdf';
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: blobType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type.toUpperCase()}_Attendance_${courseCode}_${new Date().toLocaleDateString()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`${type.toUpperCase()} Export failed. Check if session has attendance records.`);
    } finally {
      setExporting(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-[family-name:var(--font-geist-sans)] pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Layout size={20}/>
          </div>
          <h1 className="text-xl font-black text-blue-600 tracking-tight">
            SmartAttend <span className="text-slate-300 font-light">| Staff</span>
          </h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-all px-4 py-2 hover:bg-red-50 rounded-xl"
        >
          <LogOut size={20} /> Logout
        </button>
      </nav>
      
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                {user.department}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Welcome back, Professor</p>
            <h2 className="text-4xl font-black tracking-tight text-slate-800 uppercase">{user.name}</h2>
          </div>
          
          <div className="flex gap-3">
             <button 
              onClick={() => fetchSessions(user.profileId)}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all hover:shadow-md"
            >
              <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={() => router.push('/lecturer/dashboard/new-session')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              <PlusCircle size={22} /> Start New Session
            </button>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard icon={<BookOpen size={32}/>} title="My Courses" value={user.courses?.length || 0} color="text-blue-600" />
          <StatCard icon={<Users size={32}/>} title="Total Sessions" value={sessions.length} color="text-indigo-600" />
          <StatCard 
            icon={<History size={32}/>} 
            title="Last Session" 
            value={sessions.length > 0 ? sessions[0].courseCode : "None"} 
            color="text-emerald-600" 
          />
        </div>

        {/* Session History Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Recent Sessions</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-4">Course Code</th>
                  <th className="px-8 py-4">Date & Time</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                {sessions.map((session, index) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={session.id} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                        {session.courseCode}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-slate-700 font-semibold text-sm">
                        {new Date(session.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                      <p className="text-slate-400 text-xs font-medium">
                        {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <button 
                          disabled={exporting === `${session.id}-csv`}
                          onClick={() => exportFile(session.id, session.courseCode, 'csv')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          {exporting === `${session.id}-csv` ? <Loader2 className="animate-spin" size={14}/> : <FileSpreadsheet size={16} />} 
                          CSV
                        </button>
                        <button 
                          disabled={exporting === `${session.id}-pdf`}
                          onClick={() => exportFile(session.id, session.courseCode, 'pdf')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          {exporting === `${session.id}-pdf` ? <Loader2 className="animate-spin" size={14}/> : <FileText size={16} />} 
                          PDF Report
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
            
            {!loading && sessions.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <History size={32} />
                </div>
                <p className="text-slate-400 font-medium italic">No attendance history found for your account.</p>
              </div>
            )}

            {loading && (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all"
    >
      <div className={`${color} mb-4 p-3 bg-slate-50 w-fit rounded-2xl`}>{icon}</div>
      <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
      <p className="text-3xl font-black mt-1 text-slate-800 tracking-tight">{value}</p>
    </motion.div>
  );
}