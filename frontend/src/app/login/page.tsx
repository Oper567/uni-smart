'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Mail, Lock, Loader2, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      
      // Save Token and User Data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirect based on role
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
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-white sm:bg-slate-50 p-4 pt-12 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-white sm:rounded-[2.5rem] sm:shadow-2xl p-6 sm:p-10 sm:border border-slate-100">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-slate-100 text-black rounded-3xl mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="text-4xl font-black text-black tracking-tighter">Welcome Back</h2>
          <p className="text-slate-600 font-medium mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
            <input 
              type="email"
              required
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none transition-all text-[16px] text-black font-medium placeholder:text-slate-400"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
            <input 
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none transition-all text-[16px] text-black font-medium placeholder:text-slate-400"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2 active:scale-90 transition-transform"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-black text-white py-5 rounded-[2rem] font-bold text-lg active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center mt-10 text-slate-500 font-medium text-sm">
          Don't have an account?{' '}
          <button 
            onClick={() => router.push('/register')} 
            className="text-black font-bold underline underline-offset-4 hover:text-indigo-600 transition-colors"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}