'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  User, Mail, Lock, Building, BookOpen, 
  GraduationCap, Loader2, Eye, EyeOff 
} from 'lucide-react';

const DEPARTMENTS = ["Computer Science", "Information Communication System", "Cyber Security", "Data Science", "Software Engineering", "Information System"];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    department: '', matricNo: '', staffId: '',
    courses: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      role,
      courses: role === 'LECTURER' 
        ? formData.courses.split(',').map(c => c.trim().toUpperCase()).filter(c => c !== "") 
        : []
    };

    try {
      await api.post('/auth/register', payload);
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start sm:justify-center p-4 pt-10 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-lg bg-white sm:shadow-2xl sm:border border-slate-100 rounded-[2.5rem] p-6 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-black tracking-tighter mb-2">Join UniSmart</h2>
          <p className="text-slate-600 font-medium">Create your {role.toLowerCase()} account</p>
        </div>
        
        {/* Role Switcher - Mobile Optimized Height */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          {['STUDENT', 'LECTURER'].map((r) => (
            <button 
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === r ? 'bg-white shadow-sm text-black' : 'text-slate-500'
              }`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input 
              icon={<User size={20} className="text-black"/>} 
              placeholder="Full Name" 
              value={formData.name} 
              onChange={(v) => setFormData({...formData, name: v})} 
            />
            
            <Input 
              icon={<Mail size={20} className="text-black"/>} 
              type="email" 
              placeholder="Email Address" 
              value={formData.email} 
              onChange={(v) => setFormData({...formData, email: v})} 
            />

            {/* Password with View Toggle */}
            <div className="relative">
              <Input 
                icon={<Lock size={20} className="text-black"/>} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={formData.password} 
                onChange={(v) => setFormData({...formData, password: v})} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2 active:scale-90 transition-transform"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Department Dropdown - Large Touch Area */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black"><Building size={20}/></div>
              <select 
                required
                className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none transition-all text-[16px] text-black appearance-none font-medium"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>

            {role === 'STUDENT' ? (
              <Input 
                icon={<GraduationCap size={20} className="text-black"/>} 
                placeholder="Matric Number" 
                value={formData.matricNo} 
                onChange={(v) => setFormData({...formData, matricNo: v})} 
              />
            ) : (
              <div className="space-y-4">
                <Input 
                  icon={<BookOpen size={20} className="text-black"/>} 
                  placeholder="Staff ID" 
                  value={formData.staffId} 
                  onChange={(v) => setFormData({...formData, staffId: v})} 
                />
                <Input 
                  icon={<BookOpen size={20} className="text-black"/>} 
                  placeholder="Courses (e.g. CSC101, DCOT205)" 
                  value={formData.courses}
                  onChange={(v) => setFormData({...formData, courses: v})} 
                />
              </div>
            )}
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-black text-white py-5 rounded-[2rem] font-bold text-lg active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-3 shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium text-sm">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-black font-bold underline underline-offset-4">Log In</button>
        </p>
      </div>
    </div>
  );
}

function Input({ icon, type = "text", placeholder, value, onChange }: { 
  icon: React.ReactNode, 
  type?: string, 
  placeholder: string, 
  value: string, 
  onChange: (v: string) => void 
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">{icon}</div>
      <input 
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black outline-none transition-all text-[16px] text-black placeholder:text-slate-400 font-medium"
      />
    </div>
  );
}