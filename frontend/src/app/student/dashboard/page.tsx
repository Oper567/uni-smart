'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, LogOut, User, LayoutDashboard, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api'; // Ensure your axios instance is imported

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Fetch Attendance History
    const fetchHistory = async () => {
      try {
        const res = await api.get('/student/history'); // Adjust path to your route
        setHistory(res.data);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  if (!user) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600 animate-pulse text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-indigo-600 font-black text-lg">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span>UniSmart</span>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
          <LogOut size={20} />
        </button>
      </nav>

      <main className="p-6 max-w-md mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 leading-tight">{user.name}</h2>
            <p className="text-indigo-600 text-sm font-bold tracking-tight">{user.matricNo}</p>
          </div>
        </div>

        {/* Scan Button */}
        <button 
          onClick={() => router.push('/scan')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 flex flex-col items-center gap-3 transition-all active:scale-95 group"
        >
          <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform">
            <Camera size={32} />
          </div>
          <div className="text-center">
            <span className="text-lg font-black block">Mark Attendance</span>
            <span className="text-indigo-100 text-[10px] uppercase tracking-widest font-bold">Tap to Scan QR</span>
          </div>
        </button>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" /> Recent Sign-ins
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">
              {history.length} Classes
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-2xl" />)
            ) : history.length > 0 ? (
              history.map((record) => (
                <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2.5 rounded-xl text-green-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{record.session.courseCode}</p>
                      <p className="text-slate-400 text-[11px] font-medium">
                        {new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Present</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No attendance records found yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}