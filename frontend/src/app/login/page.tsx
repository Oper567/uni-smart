'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      
      // 1. Save the Token for API calls
      localStorage.setItem('token', res.data.token);
      
      // 2. Save User Data (includes department and courses)
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // 3. Redirect based on role
      if (res.data.user.role === 'LECTURER') {
        router.push('/lecturer/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to manage your attendance</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="email"
              required
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="password"
              required
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Don't have an account? <span onClick={() => router.push('/register')} className="text-indigo-600 font-bold cursor-pointer hover:underline">Register here</span>
        </p>
      </div>
    </div>
  );
}