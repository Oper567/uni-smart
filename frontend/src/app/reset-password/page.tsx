'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated! Logging you in...");
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex p-4 bg-black text-white rounded-3xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter">New Password</h2>
          <p className="text-slate-500 font-medium mt-2">Enter your secure new password</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
            <input 
              type="password" required placeholder="New Password"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-black text-white py-5 rounded-[2rem] font-bold text-lg flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}