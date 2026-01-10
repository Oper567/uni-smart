'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Get user data from storage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // 2. If no token, kick back to login
    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  if (!user) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600 animate-pulse text-xl">Loading Secure Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <LayoutDashboard size={20} /> <span>SmartAttend</span>
        </div>
        <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
          <LogOut size={20} />
        </button>
      </nav>

      <main className="p-6 max-w-md mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600"><User size={28} /></div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Logged in as</p>
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-indigo-600 text-sm font-mono">{user.matricNo}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/student/dashboard/scan')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-10 rounded-[2.5rem] shadow-xl shadow-indigo-200 flex flex-col items-center gap-4 transition-transform active:scale-95"
        >
          <Camera size={44} />
          <div className="text-center">
            <span className="text-xl font-black block">Open Scanner</span>
            <span className="text-indigo-100 text-xs">Ready for QR Attendance</span>
          </div>
        </button>
      </main>
    </div>
  );
}