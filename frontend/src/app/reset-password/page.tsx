'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase'; // Updated to use the SSR helper
import { Lock, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Initialize the modern browser client
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    // Supabase automatically handles the session token from the email link
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully! Redirecting to login...");
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="text-center">
          <div className="inline-flex p-4 bg-black text-white rounded-3xl mb-6 shadow-lg shadow-slate-200">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-black">New Password</h2>
          <p className="text-slate-500 font-medium mt-2">Create a secure password for your account</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* New Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
            <input 
              type="password" 
              required 
              placeholder="New Password"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none transition-all placeholder:text-slate-400 text-black font-medium"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
            <input 
              type="password" 
              required 
              placeholder="Confirm New Password"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none transition-all placeholder:text-slate-400 text-black font-medium"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button 
            disabled={loading} 
            className="w-full bg-black text-white py-5 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-slate-100 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : "Update Password"}
          </button>
        </form>

        {/* Cancel/Back Link */}
        <button 
          onClick={() => router.push('/login')}
          className="w-full text-center text-sm font-bold text-slate-400 hover:text-black transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Login
        </button>
      </div>
    </div>
  );
}