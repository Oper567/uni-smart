'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, LogOut, Users, BookOpen, Layout, 
  History, FileSpreadsheet, FileText, Loader2, RefreshCw, Calendar, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function LecturerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchSessions = useCallback(async (lecturerId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/session/lecturer/${lecturerId}`);
      
      const sessionsWithCounts = await Promise.all(res.data.map(async (s: any) => {
        try {
          // Added timestamp to bypass Render/Cloudflare caching
          const countRes = await api.get(`/session/${s.id}/count?t=${Date.now()}`);
          return { ...s, count: countRes.data.count };
        } catch (err) {
          return { ...s, count: 0 };
        }
      }));
      setSessions(sessionsWithCounts);
    } catch (err) {
      console.error("Failed to fetch sessions");
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
    
    fetchSessions(parsedUser.profileId);

    const handleFocus = () => fetchSessions(parsedUser.profileId);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [router, fetchSessions]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const exportFile = async (sessionId: string, courseCode: string, type: 'csv' | 'pdf') => {
    setExporting(`${sessionId}-${type}`);
    try {
      const response = await api.get(`/session/export/${type}/${sessionId}`, { 
        responseType: 'blob', // 👈 Crucial for binary data
        timeout: 45000,       // 👈 Increased to 45s for Render Free Tier PDF generation
        headers: { 'Cache-Control': 'no-cache' } 
      });

      // FIX: Handle cases where the backend returns a JSON error instead of a file
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || "Export failed.");
      }
      
      const blobType = type === 'csv' ? 'text/csv' : 'application/pdf';
      const extension = type === 'csv' ? 'csv' : 'pdf';
      
      // Safety check for empty blobs
      if (response.data.size < 100) {
        throw new Error("The generated file is empty. Ensure students have signed in.");
      }

      const blob = new Blob([response.data], { type: blobType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `${courseCode}_Attendance_${new Date().toISOString().split('T')[0]}.${extension}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 200);
      
    } catch (err: any) {
      console.error("Detailed Export Error:", err);
      
      // Better Error Messages for the UI
      let errorMessage = "Export failed. Please try again.";
      if (err.message) errorMessage = err.message;
      if (err.code === 'ECONNABORTED') errorMessage = "Request timed out. The server is taking too long.";
      
      alert(errorMessage);
    } finally {
      setExporting(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-900 font-[family-name:var(--font-geist-sans)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-blue-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Layout size={18}/>
          </div>
          <span className="font-black text-sm tracking-tighter text-blue-900 uppercase">SmartAttend</span>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout} 
          className="text-slate-400 p-2 hover:text-red-500 transition-colors"
        >
          <LogOut size={22} />
        </motion.button>
      </nav>
      
      <main className="p-6 space-y-8 pb-24">
        {/* Welcome Header */}
        <header className="space-y-1">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Lecturer Overview</span>
             <motion.button 
               whileTap={{ rotate: 180 }}
               onClick={() => fetchSessions(user.profileId)} 
               className="text-blue-500 bg-blue-50 p-2 rounded-full"
             >
               <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
             </motion.button>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">
            Welcome, {user.name?.split(' ')[0]}
          </h2>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
             {user.department}
          </p>
        </header>

        {/* Start Button */}
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/lecturer/dashboard/new-session')}
          className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black text-lg flex items-center justify-between shadow-2xl shadow-blue-200 transition-all border-b-4 border-blue-800"
        >
          <div className="flex items-center gap-3">
            <PlusCircle size={26} />
            <span>New Session</span>
          </div>
          <ChevronRight size={20} className="opacity-60" />
        </motion.button>

        {/* Stats Row */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          <StatMiniCard label="Courses" value={user.courses?.length || 0} color="blue" />
          <StatMiniCard label="Sessions" value={sessions.length} color="indigo" />
          <StatMiniCard label="Status" value="Live" color="emerald" />
        </div>

        {/* Activity List */}
        <section className="space-y-4">
          <h3 className="font-black text-lg text-slate-700 flex items-center gap-2">
            <History size={20} className="text-blue-500" /> Recent Activity
          </h3>

          <div className="space-y-4">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-40 bg-white border border-blue-50 animate-pulse rounded-[2rem]" />)
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={session.id} 
                  className="bg-white border border-blue-50 rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                          {session.courseCode}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                          <Users size={10} /> {session.count || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-2 font-bold">
                        <Calendar size={12} className="text-blue-300" />
                        {new Date(session.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-1 rounded-md">
                      {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <ExportButton 
                      label="CSV" 
                      icon={<FileSpreadsheet size={16} />}
                      isLoading={exporting === `${session.id}-csv`}
                      onClick={() => exportFile(session.id, session.courseCode, 'csv')}
                    />
                    <ExportButton 
                      label="PDF" 
                      icon={<FileText size={16} />}
                      isLoading={exporting === `${session.id}-pdf`}
                      onClick={() => exportFile(session.id, session.courseCode, 'pdf')}
                      variant="primary"
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 bg-white border border-blue-50 rounded-[2.5rem]">
                <BookOpen size={40} className="mx-auto text-blue-100 mb-2" />
                <p className="text-slate-400 text-sm font-medium">No sessions recorded yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Sub-components
function StatMiniCard({ label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };
  return (
    <div className={`min-w-[140px] border p-5 rounded-[2rem] space-y-1 ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase opacity-60">{label}</p>
      <p className="text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function ExportButton({ label, icon, isLoading, onClick, variant }: any) {
  return (
    <button 
      disabled={isLoading}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 ${
        variant === 'primary' 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
        : "bg-blue-50 text-blue-700 border border-blue-100"
      }`}
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}