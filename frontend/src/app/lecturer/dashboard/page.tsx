'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, LogOut, Users, BookOpen, Layout, 
  History, FileSpreadsheet, FileText, Loader2, RefreshCw, Calendar
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
      link.setAttribute('download', `${type.toUpperCase()}_${courseCode}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed. Records might be empty.`);
    } finally {
      setExporting(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white text-black font-[family-name:var(--font-geist-sans)]">
      {/* Mobile Nav */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-black p-1.5 rounded-lg text-white">
            <Layout size={18}/>
          </div>
          <span className="font-black text-sm tracking-tighter">SmartAttend</span>
        </div>
        <button onClick={handleLogout} className="text-red-500 p-2 active:bg-red-50 rounded-full">
          <LogOut size={20} />
        </button>
      </nav>
      
      <main className="p-6 space-y-8 pb-24">
        {/* Welcome Header */}
        <header className="space-y-1">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lecturer Portal</span>
             <button onClick={() => fetchSessions(user.profileId)} className="text-slate-400">
               <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-tight">
            Hi, {user.name.split(' ')[0]}
          </h2>
          <p className="text-slate-500 text-sm font-medium">{user.department}</p>
        </header>

        {/* Start Button - Mobile Primary Action */}
        <button 
          onClick={() => router.push('/lecturer/dashboard/new-session')}
          className="w-full bg-black text-white p-6 rounded-[2rem] font-black text-lg flex items-center justify-between shadow-xl shadow-slate-200 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <PlusCircle size={24} />
            <span>New Attendance</span>
          </div>
          <BookOpen size={20} className="opacity-40" />
        </button>

        {/* Stats Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          <div className="min-w-[140px] bg-slate-50 p-5 rounded-3xl space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400">Courses</p>
            <p className="text-2xl font-black">{user.courses?.length || 0}</p>
          </div>
          <div className="min-w-[140px] bg-slate-50 p-5 rounded-3xl space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400">Total</p>
            <p className="text-2xl font-black">{sessions.length}</p>
          </div>
          <div className="min-w-[140px] bg-black text-white p-5 rounded-3xl space-y-1">
            <p className="text-[10px] font-black uppercase text-white/50">Active</p>
            <p className="text-2xl font-black">Online</p>
          </div>
        </div>

        {/* Recent Activity List */}
        <section className="space-y-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <History size={20} /> Recent Sessions
          </h3>

          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2rem]" />)
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <div key={session.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                        {session.courseCode}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                        <Calendar size={12} />
                        {new Date(session.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400">
                      {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      disabled={exporting?.startsWith(session.id)}
                      onClick={() => exportFile(session.id, session.courseCode, 'csv')}
                      className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-2xl text-xs font-black active:bg-black active:text-white transition-all disabled:opacity-50"
                    >
                      {exporting === `${session.id}-csv` ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                      CSV
                    </button>
                    <button 
                      disabled={exporting?.startsWith(session.id)}
                      onClick={() => exportFile(session.id, session.courseCode, 'pdf')}
                      className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-2xl text-xs font-black active:bg-black active:text-white transition-all disabled:opacity-50"
                    >
                      {exporting === `${session.id}-pdf` ? <Loader2 size={14} className="animate-spin" /> : <FileText size={16} />}
                      PDF Report
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No sessions found</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}