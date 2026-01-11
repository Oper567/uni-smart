'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert(error.message);
    } else {
      setIsSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <button onClick={() => router.push('/login')} className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-sm">
          <ArrowLeft size={16} /> Back to login
        </button>

        {!isSent ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Recover Account</h2>
              <p className="text-slate-500 font-medium mt-2">Enter email to receive reset link</p>
            </div>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
                <input 
                  type="email" required placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button disabled={loading} className="w-full bg-black text-white py-5 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-4 bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100">
            <CheckCircle2 size={64} className="mx-auto text-black" />
            <h3 className="text-2xl font-black">Email Sent!</h3>
            <p className="text-slate-500 font-medium">Check your inbox for the recovery link.</p>
          </div>
        )}
      </div>
    </div>
  );
}